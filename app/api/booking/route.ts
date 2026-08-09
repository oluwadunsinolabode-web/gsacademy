import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
}

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      parentName,
      studentName,
      email,
      whatsapp,
      country,
      studentLevel,
      selectedPackage,
      selectedSubjects,
      subjectSchedules,
      additionalNotes,
    } = body;

    // ==========================================
    // Calculate Tuition
    // ==========================================

    let totalAmount = 0;
    let currency = "";

    if (country === "Nigeria") {
      currency = "₦";

      if (selectedPackage === "Package 1 - Small Group") {
        totalAmount =
          selectedSubjects.length >= 5
            ? selectedSubjects.length * 7000
            : selectedSubjects.length * 10000;
      }

      if (selectedPackage === "Package 2 - Private Coaching") {
        totalAmount = selectedSubjects.length * 40000;
      }

      if (selectedPackage === "Package 3 - Premium Coaching") {
        totalAmount = selectedSubjects.length * 50000;
      }
    } else {
      currency = "$";

      totalAmount =
        selectedSubjects.length >= 3
          ? selectedSubjects.length * 30
          : selectedSubjects.length * 35;
    }

    // ==========================================
    // Save Booking
    // ==========================================

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        parent_name: parentName,
        student_name: studentName,
        email,
        whatsapp,
        country,
        student_level: studentLevel,
        package: selectedPackage,
        subjects: selectedSubjects,
        lesson_schedule: subjectSchedules,
        additional_notes: additionalNotes,
        total_amount: totalAmount,
        currency,
        payment_status: "Pending",
        booking_status: "Pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error);

      return Response.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    const bookingReference = data.booking_reference;

    // ==========================================
    // Show timetable only for:
    // Package 2
    // Package 3
    // International Students
    // ==========================================

    const showTimetable =
      selectedPackage === "Package 2 - Private Coaching" ||
      selectedPackage === "Package 3 - Premium Coaching" ||
      country !== "Nigeria";

    const scheduleHTML =
      subjectSchedules && subjectSchedules.length > 0
        ? `
          <table
            style="
              width:100%;
              border-collapse:collapse;
              margin-top:15px;
            "
          >

            <thead>
              <tr
                style="
                  background:#071b41;
                  color:#ffffff;
                "
              >

                <th
                  style="
                    padding:10px;
                    border:1px solid #ddd;
                    text-align:left;
                  "
                >
                  Subject
                </th>

                <th
                  style="
                    padding:10px;
                    border:1px solid #ddd;
                    text-align:left;
                  "
                >
                  Lesson
                </th>

                <th
                  style="
                    padding:10px;
                    border:1px solid #ddd;
                    text-align:left;
                  "
                >
                  Day
                </th>

                <th
                  style="
                    padding:10px;
                    border:1px solid #ddd;
                    text-align:left;
                  "
                >
                  Time
                </th>

              </tr>
            </thead>

            <tbody>

              ${subjectSchedules
                .map(
                  (item: any) => `
                    <tr>

                      <td
                        style="
                          padding:10px;
                          border:1px solid #ddd;
                        "
                      >
                        ${item.subject}
                      </td>

                      <td
                        style="
                          padding:10px;
                          border:1px solid #ddd;
                        "
                      >
                        Lesson ${item.lesson + 1}
                      </td>

                      <td
                        style="
                          padding:10px;
                          border:1px solid #ddd;
                        "
                      >
                        ${item.day}
                      </td>

                      <td
                        style="
                          padding:10px;
                          border:1px solid #ddd;
                        "
                      >
                        ${item.time}
                      </td>

                    </tr>
                  `
                )
                .join("")}

            </tbody>

          </table>
        `
        : `
          <p
            style="
              color:#64748b;
              line-height:1.7;
            "
          >
            Your lesson schedule will be discussed with you during the
            enrollment process.
          </p>
        `;

    // ==========================================
    // Timetable Section
    // ==========================================

    const timetableSection = showTimetable
      ? `
        <div
          style="
            margin-top:40px;
            padding-top:25px;
            border-top:1px solid #e5e7eb;
          "
        >

          <h3
            style="
              color:#071b41;
              margin-top:0;
            "
          >
            Selected Lesson Timetable
          </h3>

          <p
            style="
              color:#475569;
              line-height:1.7;
            "
          >
            Here is the lesson schedule selected during your booking.
          </p>

          ${scheduleHTML}

        </div>
      `
      : "";

    // ==========================================
    // Send Welcome Email
    // ==========================================

    await resend.emails.send({
      from: "GS Academy <booking@gsacademyhub.com>",
      to: email,
      subject: `Welcome to GS Academy • Booking Received`,
      html: `
<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8" />

  <title>
    Welcome to GS Academy
  </title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f8fafc;
    font-family:Arial,Helvetica,sans-serif;
  "
>

<div
  style="
    max-width:700px;
    margin:40px auto;
    background:#ffffff;
    border-radius:14px;
    overflow:hidden;
    border:1px solid #e2e8f0;
  "
>

  <!-- HEADER -->

  <div
    style="
      background:#071b41;
      padding:32px;
      text-align:center;
    "
  >

    <h1
      style="
        margin:0;
        color:#ffffff;
        font-size:34px;
        letter-spacing:2px;
      "
    >
      GS ACADEMY
    </h1>

    <p
      style="
        margin:8px 0 0;
        color:#d4a017;
        font-size:14px;
        letter-spacing:4px;
      "
    >
      GROOMING SCHOLARS.
    </p>

  </div>


  <!-- MAIN -->

  <div style="padding:40px;">

    <h2
      style="
        margin-top:0;
        color:#071b41;
        font-size:28px;
      "
    >
      Welcome to GS Academy
    </h2>


    <p
      style="
        color:#334155;
        font-size:16px;
        line-height:1.8;
      "
    >
      Hello ${parentName},
    </p>


    <p
      style="
        color:#334155;
        font-size:16px;
        line-height:1.8;
      "
    >
      Thank you for choosing
      <strong>GS Academy</strong>
      for ${studentName}.
    </p>


    <p
      style="
        color:#334155;
        font-size:16px;
        line-height:1.8;
      "
    >
      We are pleased to let you know that your booking request
      has been successfully received.
    </p>


    <p
      style="
        color:#334155;
        font-size:16px;
        line-height:1.8;
      "
    >
      Our team will review your enrollment details and contact you
      with further information.
    </p>


    <!-- BOOKING REFERENCE -->

    <div
      style="
        margin:30px 0;
        padding:22px;
        background:#f8fafc;
        border-left:4px solid #d4a017;
        border-radius:8px;
      "
    >

      <p
        style="
          margin:0 0 8px;
          color:#64748b;
          font-size:14px;
        "
      >
        BOOKING REFERENCE
      </p>

      <p
        style="
          margin:0;
          color:#071b41;
          font-size:24px;
          font-weight:bold;
          letter-spacing:1px;
        "
      >
        ${bookingReference ?? "Pending"}
      </p>

    </div>


    <!-- ENROLLMENT DETAILS -->

    <h3
      style="
        color:#071b41;
        margin-top:35px;
      "
    >
      Enrollment Details
    </h3>


    <table
      style="
        width:100%;
        border-collapse:collapse;
      "
    >

      <tr>

        <td
          style="
            padding:11px;
            border-bottom:1px solid #e5e7eb;
            color:#475569;
          "
        >
          <strong>Student</strong>
        </td>

        <td
          style="
            padding:11px;
            border-bottom:1px solid #e5e7eb;
            color:#0f172a;
          "
        >
          ${studentName}
        </td>

      </tr>


      <tr>

        <td
          style="
            padding:11px;
            border-bottom:1px solid #e5e7eb;
            color:#475569;
          "
        >
          <strong>Academic Level</strong>
        </td>

        <td
          style="
            padding:11px;
            border-bottom:1px solid #e5e7eb;
            color:#0f172a;
          "
        >
          ${studentLevel}
        </td>

      </tr>


      <tr>

        <td
          style="
            padding:11px;
            border-bottom:1px solid #e5e7eb;
            color:#475569;
          "
        >
          <strong>Package</strong>
        </td>

        <td
          style="
            padding:11px;
            border-bottom:1px solid #e5e7eb;
            color:#0f172a;
          "
        >
          ${selectedPackage}
        </td>

      </tr>


      <tr>

        <td
          style="
            padding:11px;
            color:#475569;
          "
        >
          <strong>Subjects</strong>
        </td>

        <td
          style="
            padding:11px;
            color:#0f172a;
          "
        >
          ${selectedSubjects.join(", ")}
        </td>

      </tr>

    </table>


    <!-- TIMETABLE -->

    ${timetableSection}


    <!-- ADDITIONAL NOTES -->

    ${
      additionalNotes
        ? `
          <div
            style="
              margin-top:40px;
              padding-top:25px;
              border-top:1px solid #e5e7eb;
            "
          >

            <h3
              style="
                color:#071b41;
              "
            >
              Additional Notes
            </h3>

            <p
              style="
                color:#475569;
                line-height:1.7;
              "
            >
              ${additionalNotes}
            </p>

          </div>
        `
        : ""
    }


    <!-- NEXT STEPS -->

    <div
      style="
        margin-top:40px;
        padding:25px;
        background:#f8fafc;
        border-radius:10px;
        border:1px solid #e5e7eb;
      "
    >

      <h3
        style="
          margin-top:0;
          color:#071b41;
        "
      >
        What Happens Next?
      </h3>

      <p
        style="
          color:#475569;
          line-height:1.8;
        "
      >
        Our academic team will review your enrollment request
        and get in touch with you regarding the next steps.
      </p>

      <p
        style="
          color:#475569;
          line-height:1.8;
        "
      >
        If you need any further information in the meantime,
        feel free to contact us directly on WhatsApp.
      </p>

    </div>


    <!-- WHATSAPP -->

    <div
      style="
        margin-top:30px;
        text-align:center;
      "
    >

      <a
        href="https://wa.me/2347064586878"
        target="_blank"
        style="
          display:inline-block;
          background:#071b41;
          color:#ffffff;
          padding:14px 25px;
          border-radius:7px;
          text-decoration:none;
          font-weight:bold;
        "
      >
        Contact GS Academy on WhatsApp
      </a>

    </div>


    <p
      style="
        margin-top:35px;
        color:#64748b;
        line-height:1.7;
        text-align:center;
      "
    >
      We look forward to welcoming
      ${studentName}
      to GS Academy.
    </p>

  </div>


  <!-- FOOTER -->

  <div
    style="
      background:#071b41;
      padding:28px;
      text-align:center;
    "
  >

    <h2
      style="
        margin:0;
        color:#ffffff;
        font-size:22px;
      "
    >
      GS Academy
    </h2>

    <p
      style="
        margin:8px 0;
        color:#d4a017;
        letter-spacing:2px;
        font-size:13px;
      "
    >
      GROOMING SCHOLARS.
    </p>

    <p
      style="
        margin:18px 0 0;
        color:#cbd5e1;
        font-size:13px;
      "
    >
      Building Futures.
    </p>

    <p
      style="
        margin-top:20px;
        color:#cbd5e1;
        font-size:12px;
      "
    >
      © 2026 GS Academy. All rights reserved.
    </p>

  </div>

</div>

</body>

</html>
`,
    });

    return Response.json({
      success: true,
      bookingReference,
      totalAmount,
      currency,
    });

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to process booking.",
      },
      {
        status: 500,
      }
    );
  }
}