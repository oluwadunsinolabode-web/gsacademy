import { Resend } from "resend";

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


    await resend.emails.send({
      from: "GS Academy <booking@gsacademyhub.com>",
      to: email,
      subject: "We've Received Your GS Academy Booking",
      html: `
        <h2>Thank you for choosing GS Academy</h2>

        <p>Dear ${parentName},</p>

        <p>
        We have successfully received your booking request for
        <strong>${studentName}</strong>.
        </p>

        <h3>Booking Summary</h3>

        <p><strong>Country:</strong> ${country}</p>

        <p><strong>Academic Level:</strong> ${studentLevel}</p>

        <p><strong>Package:</strong> ${selectedPackage}</p>

        <p><strong>Subjects:</strong></p>
        <p>${selectedSubjects.join(", ")}</p>

        <p><strong>Schedule:</strong></p>

        <pre>
${JSON.stringify(subjectSchedules, null, 2)}
        </pre>

        <p>
        Our academic team will review your request and contact you shortly.
        </p>

        <br/>

        <p>
        GS Academy<br/>
        Grooming Scholars
        </p>
      `,
    });


    return Response.json({
      success: true,
      message: "Booking received",
    });


  } catch (error) {

    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}