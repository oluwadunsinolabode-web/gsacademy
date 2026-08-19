import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Student email is required." },
        { status: 400 }
      );
    }

    // Find the existing student
    const { data: student, error: studentError } =
      await supabaseAdmin
        .from("students")
        .select(
          "id, full_name, email, auth_id"
        )
        .ilike("email", email)
        .single();

    if (studentError || !student) {
      return NextResponse.json(
        {
          error:
            "No student account was found with this email address.",
        },
        { status: 404 }
      );
    }

    if (!student.auth_id) {
      return NextResponse.json(
        {
          error:
            "This student does not have a Supabase Auth account.",
        },
        { status: 400 }
      );
    }

    // Generate a new temporary password
    const temporaryPassword =
      Math.random().toString(36).slice(-8) +
      "Gs@1";

    // Reset the EXISTING Auth account
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.updateUserById(
        student.auth_id,
        {
          password: temporaryPassword,
        }
      );

    if (authError) {
      console.error(
        "AUTH PASSWORD RESET ERROR:",
        authError
      );

      return NextResponse.json(
        {
          error: authError.message,
        },
        { status: 400 }
      );
    }

    // Keep your existing student fields/logic
    const { error: updateError } =
      await supabaseAdmin
        .from("students")
        .update({
          password_changed: false,
          temporary_password:
            temporaryPassword,
        })
        .eq("id", student.id);

    if (updateError) {
      console.error(
        "STUDENT UPDATE ERROR:",
        updateError
      );

      return NextResponse.json(
        {
          error: updateError.message,
        },
        { status: 400 }
      );
    }

    // Send the temporary password to the student's REAL email
    const { error: emailError } =
      await resend.emails.send({
        from:
          "GS Academy <booking@gsacademyhub.com>",

        to: student.email,

        subject:
          "Your GS Academy Password Has Been Reset",

        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">

            <h1 style="color:#0f172a">
              GS Academy
            </h1>

            <p>
              Hello ${student.full_name},
            </p>

            <p>
              Your GS Academy student portal password
              has been reset.
            </p>

            <p>
              <strong>Login email:</strong>
              ${student.email}
            </p>

            <p>
              <strong>Temporary password:</strong>
              ${temporaryPassword}
            </p>

            <a
              href="https://gsacademyhub.com/login"
              style="
                display:inline-block;
                margin-top:20px;
                background:#facc15;
                color:#0f172a;
                padding:15px 25px;
                border-radius:10px;
                font-weight:bold;
                text-decoration:none;
              "
            >
              Login To GS Academy
            </a>

            <p style="margin-top:25px">
              After logging in, you will be asked to
              create a new password.
            </p>

            <p>
              GS Academy<br/>
              Grooming Scholars
            </p>

          </div>
        `,
      });

    if (emailError) {
      console.error(
        "PASSWORD EMAIL ERROR:",
        emailError
      );

      return NextResponse.json(
        {
          error:
            "Password was reset, but the email could not be sent.",
          details: emailError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Password reset successfully and email sent.",
    });
  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}