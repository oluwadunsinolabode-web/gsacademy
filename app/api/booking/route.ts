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
  // ===============================
// Calculate Tuition Automatically
// ===============================

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

    const scheduleHTML =
      subjectSchedules && subjectSchedules.length > 0
        ? `
        <table style="width:100%; border-collapse:collapse; margin-top:15px;">
          <thead>
            <tr style="background:#0f172a; color:white;">
              <th style="padding:10px; border:1px solid #ddd;">Subject</th>
              <th style="padding:10px; border:1px solid #ddd;">Lesson</th>
              <th style="padding:10px; border:1px solid #ddd;">Day</th>
              <th style="padding:10px; border:1px solid #ddd;">Time</th>
            </tr>
          </thead>
          <tbody>
            ${subjectSchedules
              .map(
                (item: any) => `
                <tr>
                  <td style="padding:10px; border:1px solid #ddd;">${item.subject}</td>
                  <td style="padding:10px; border:1px solid #ddd;">Lesson ${
                    item.lesson + 1
                  }</td>
                  <td style="padding:10px; border:1px solid #ddd;">${item.day}</td>
                  <td style="padding:10px; border:1px solid #ddd;">${item.time}</td>
                </tr>
              `
              )
              .join("")}
          </tbody>
        </table>
      `
        : `<p>No lesson schedule selected yet.</p>`;

    await resend.emails.send({
      from: "GS Academy <booking@gsacademyhub.com>",
      to: email,
      subject: `Booking Confirmation • ${studentName} • GS Academy`,
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>GS Academy Booking Confirmation</title>
</head>

<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">

<div style="max-width:700px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">

<div style="background:#0f172a;padding:30px;text-align:center;">
<h1 style="margin:0;color:#facc15;font-size:34px;">GS Academy</h1>
<p style="margin-top:8px;color:#ffffff;">
Grooming Scholars
</p>
</div>

<div style="padding:40px;">

<div style="background:#fef9c3;border:1px solid #facc15;border-radius:12px;padding:20px;text-align:center;margin-bottom:35px;">

  <div style="font-size:42px;">
    🎓
  </div>

  <h2 style="margin:10px 0 5px 0;color:#0f172a;font-size:30px;">
    Booking Successfully Received
  </h2>

  <p style="margin:0;color:#475569;font-size:16px;">
    Thank you for choosing <strong>GS Academy</strong>. We're delighted to welcome you to our learning community.
  </p>

</div>

<h2 style="color:#0f172a;">
Hello ${parentName},
</h2>

<p style="font-size:16px;color:#334155;line-height:1.8;">
Your enrollment for <strong>${studentName}</strong> has been successfully received and confirmed. Below is a summary of the enrollment details and the next steps.
</p>
<div style="margin:30px 0;padding:20px;background:#f8fafc;border-left:5px solid #facc15;">

<h3 style="margin-top:0;color:#0f172a;">
Booking Reference
</h3>

<p style="font-size:24px;font-weight:bold;color:#2563eb;">
${bookingReference ?? "Will be generated"}
</p>

</div>

<h3 style="color:#0f172a;">
Student Information
</h3>
<table style="width:100%;border-collapse:collapse;">

<tr>
<td style="padding:10px;border-bottom:1px solid #e5e7eb;"><strong>Student</strong></td>
<td style="padding:10px;border-bottom:1px solid #e5e7eb;">${studentName}</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #e5e7eb;"><strong>Country</strong></td>
<td style="padding:10px;border-bottom:1px solid #e5e7eb;">${country}</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #e5e7eb;"><strong>Academic Level</strong></td>
<td style="padding:10px;border-bottom:1px solid #e5e7eb;">${studentLevel}</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #e5e7eb;"><strong>Package</strong></td>
<td style="padding:10px;border-bottom:1px solid #e5e7eb;">${selectedPackage}</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #e5e7eb;"><strong>Subjects</strong></td>
<td style="padding:10px;border-bottom:1px solid #e5e7eb;">
${selectedSubjects.join(", ")}
</td>
</tr>

<tr>
<td style="padding:10px;"><strong>WhatsApp</strong></td>
<td style="padding:10px;">${whatsapp}</td>
</tr>

</table>

${
  subjectSchedules?.length > 0
    ? `
<h3 style="margin-top:40px;color:#0f172a;">
Confirmed Lesson Timetable
</h3>

${scheduleHTML}
`
    : ""
}

${
  additionalNotes
    ? `
<h3 style="margin-top:40px;color:#0f172a;">
Additional Notes
</h3>

<p style="color:#475569;">
${additionalNotes}
</p>
`
    : ""
}
${
selectedPackage === "Package 1 - Small Group"
? `
<hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb;" />

<h3 style="color:#0f172a;">
What Happens Next?
</h3>

<ol style="color:#475569;line-height:1.9;">
<li>Your enrollment has been confirmed.</li>
<li>Our academic team will prepare your group lesson timetable.</li>
<li>Your timetable and payment instructions will be sent to you shortly.</li>

<li>After payment confirmation, your Student Portal login details will be sent automatically so your child can begin classes.</li>
</ol>
`
: `
<hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb;" />

<h3 style="color:#0f172a;">
What Happens Next?
</h3>

<p style="color:#475569;">
Your lesson timetable is shown above and has been successfully confirmed.
</p>

<p style="color:#475569;">
The next step is to complete your tuition payment using the account details below.
</p>

<div style="margin:25px 0;padding:20px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;">
<div style="margin:25px 0;padding:20px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;">

<h3 style="margin-top:0;color:#0f172a;">
Tuition Fee
</h3>

<p style="font-size:34px;font-weight:bold;color:#2563eb;margin:0;">
${currency}${Number(totalAmount).toLocaleString()}
</p>

</div>
<h3 style="margin-top:0;color:#0f172a;">
Bank Payment Details
</h3>

<p style="margin:8px 0;">
<strong>Bank:</strong> Guaranty Trust Bank (GTBank)
</p>

<p style="margin:8px 0;">
<strong>Account Name:</strong> Olabode Oluwadunsin Samuel
</p>

<p style="margin:8px 0;">
<strong>Account Number:</strong> 0218031668
</p>

<p style="margin-top:18px;color:#b91c1c;font-weight:bold;">
IMPORTANT:
</p>

<p style="color:#475569;">
After making payment, kindly send your payment receipt via WhatsApp to <strong>07064586878</strong> for confirmation.
</p>

<p style="color:#475569;">
Immediately your payment has been verified, your Student Portal login details will be sent automatically, allowing your child to begin classes.
</p>

</div>
`
}

<hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb;" />



<p style="margin-top:35px;color:#475569;">
If you have any questions, simply reply to this email or contact us on WhatsApp.
</p>

<p style="font-size:18px;font-weight:bold;">
📱 <a
href="https://wa.me/2347064586878"
style="color:#16a34a;text-decoration:none;"
target="_blank"
>
Chat with us on WhatsApp (+234 706 458 6878)
</a>
</p>
</div>

<div style="background:#0f172a;padding:30px;text-align:center;">

<h2 style="margin:0;color:#facc15;">
GS Academy
</h2>

<p style="margin:8px 0;color:#ffffff;">
Grooming Scholars
</p>

<p style="margin:18px 0;">
📧
<a
href="mailto:gsacademyadmin@gmail.com"
style="color:#ffffff;text-decoration:none;"
>
gsacademyadmin@gmail.com
</a>
</p>

<p style="margin:18px 0;">
🌐
<a
href="https://gsacademyhub.com"
style="color:#ffffff;text-decoration:none;"
target="_blank"
>
www.gsacademyhub.com
</a>
</p>

<p style="margin:18px 0;">
📱
<a
href="https://wa.me/2347064586878"
style="color:#25D366;text-decoration:none;font-weight:bold;"
target="_blank"
>
Chat with us on WhatsApp
</a>
</p>

<p style="margin-top:25px;font-size:12px;color:#cbd5e1;">
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
          : "Unable to send confirmation email.",
    },
    {
      status: 500,
    }
  );
}
}