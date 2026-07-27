import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      email,
      parentName,
      studentName,
      packageName,
      subjects,
      totalAmount,
      currency,
      bookingReference,
    } = body;

    await resend.emails.send({
      from: "GS Academy <booking@gsacademyhub.com>",
     to: "oluwadunsinsamuelolabode@gmail.com",
      subject: "Payment Information • GS Academy",
      html: `
<body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;">

<div style="max-width:700px;margin:40px auto;background:white;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">

<div style="background:#0f172a;padding:30px;text-align:center;">
<h1 style="margin:0;color:#facc15;">GS Academy</h1>
<p style="color:white;">Grooming Scholars</p>
</div>

<div style="padding:40px;">

<h2 style="color:#0f172a;">
Hello ${parentName},
</h2>

<p style="line-height:1.8;color:#475569;">
Thank you once again for enrolling <strong>${studentName}</strong> at GS Academy.
</p>

<p style="line-height:1.8;color:#475569;">
We noticed that the tuition amount was accidentally omitted from your booking confirmation email. Kindly find the payment details below.
</p>

<div style="background:#f8fafc;padding:25px;border-radius:10px;border:1px solid #e5e7eb;margin:30px 0;">

<h3 style="margin-top:0;">Enrollment Summary</h3>

<p><strong>Booking Reference:</strong> ${bookingReference}</p>

<p><strong>Package:</strong> ${packageName}</p>

<p><strong>Subjects:</strong> ${subjects.join(", ")}</p>

<p style="font-size:26px;font-weight:bold;color:#2563eb;margin-top:20px;">
Amount Payable: ${currency} ${totalAmount}
</p>

</div>

<div style="background:#fff7ed;padding:20px;border-left:5px solid #f59e0b;">

<h3>Bank Details</h3>

<p><strong>Bank:</strong> Guaranty Trust Bank (GTBank)</p>

<p><strong>Account Name:</strong> Olabode Oluwadunsin Samuel</p>

<p><strong>Account Number:</strong> 0218031668</p>

</div>

<p style="margin-top:30px;color:#475569;">
After making payment, kindly send your payment receipt via WhatsApp to
<strong>+234 706 458 6878</strong>.
</p>

<p style="color:#475569;">
Once payment is confirmed, your Student Portal login details will be sent automatically.
</p>

<p style="margin-top:40px;">
Thank you for choosing GS Academy.
</p>

</div>

<div style="background:#0f172a;padding:25px;text-align:center;color:white;">
GS Academy • Grooming Scholars
</div>

</div>

</body>
`,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);

    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}