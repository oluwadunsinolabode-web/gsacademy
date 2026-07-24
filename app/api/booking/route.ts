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
      bookingReference,
    } = body;

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
      subject: "Booking Confirmation • GS Academy",
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

<h2 style="color:#0f172a;">
Hello ${parentName},
</h2>

<p style="font-size:16px;color:#334155;line-height:1.8;">
Thank you for choosing <strong>GS Academy</strong>.
We are pleased to inform you that we have successfully received your enrollment request.
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
Preferred Lesson Schedule
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

<hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb;" />

<h3 style="color:#0f172a;">
What Happens Next?
</h3>

<ol style="color:#475569;line-height:1.9;">
<li>Your enrollment will be reviewed by our academic team.</li>
<li>Your lesson schedule will be confirmed.</li>
<li>You will receive payment instructions.</li>
<li>After payment confirmation, your classes will officially begin.</li>
</ol>

<p style="margin-top:35px;color:#475569;">
If you have any questions, simply reply to this email or contact us via WhatsApp.
</p>

</div>

<div style="background:#f8fafc;padding:25px;text-align:center;font-size:14px;color:#64748b;">

<strong>GS Academy</strong><br/>

Email: gsacademyadmin@gmail.com<br/>

Website: https://gsacademyhub.com

</div>

</div>

</body>
</html>
`,
    });

    return Response.json({
      success: true,
      message: "Confirmation email sent successfully.",
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Unable to send confirmation email.",
      },
      {
        status: 500,
      }
    );
  }
}