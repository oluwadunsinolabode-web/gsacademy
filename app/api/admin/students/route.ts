import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Generate temporary password
    const temporaryPassword =
      Math.random().toString(36).slice(-8) + "Gs@1";

    /*
     * =====================================================
     * CHECK WHETHER THIS EMAIL ALREADY EXISTS IN AUTH
     * =====================================================
     */

    let authEmail = body.email;

    const {
      data: existingUsers,
      error: usersError,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      return NextResponse.json(
        {
          error: usersError.message,
        },
        {
          status: 400,
        }
      );
    }

    const emailAlreadyExists = existingUsers.users.some(
      (user) =>
        user.email?.toLowerCase() ===
        body.email.toLowerCase()
    );

    /*
     * =====================================================
     * IF EMAIL ALREADY EXISTS
     *
     * Create a unique internal login email.
     *
     * The student's REAL email remains in:
     * students.email
     * =====================================================
     */

    if (emailAlreadyExists) {
      authEmail =
        `student-${crypto.randomUUID()}@gsacademyhub.com`;
    }

    /*
     * =====================================================
     * CREATE AUTH ACCOUNT
     * =====================================================
     */

    const {
      data: authUser,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser({
        email: authEmail,
        password: temporaryPassword,
        email_confirm: true,
      });

    if (authError) {
      return NextResponse.json(
        {
          error: authError.message,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =====================================================
     * CREATE STUDENT RECORD
     * =====================================================
     */

    const {
      data: student,
      error: studentError,
    } =
      await supabaseAdmin
        .from("students")
        .insert({
          full_name: body.full_name,

          // REAL EMAIL
          email: body.email,

          phone: body.phone,

          parent_name: body.parent_name,

          parent_phone: body.parent_phone,

          country: body.country,

          academic_level: body.academic_level,

          package: body.package,

          subjects: body.subjects,

          amount_paid: body.amount_paid,

          outstanding_balance:
            body.outstanding_balance,

          payment_due_date:
            body.payment_due_date,

          google_meet_link:
            body.google_meet_link,

          lesson_schedule:
            body.lesson_schedule,

          status: "Active",

          auth_id: authUser.user.id,

          temporary_password:
            temporaryPassword,

          password_changed: false,
        })
        .select()
        .single();

    if (studentError) {
      // If student creation fails, remove the Auth account
      await supabaseAdmin.auth.admin.deleteUser(
        authUser.user.id
      );

      return NextResponse.json(
        {
          error: studentError.message,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =====================================================
     * CREATE TUTOR-SUBJECT ASSIGNMENTS
     * =====================================================
     */

    if (
      body.assignments &&
      body.assignments.length > 0
    ) {
      const tutorAssignments =
        body.assignments.map(
          (assignment: any) => ({
            student_id: student.id,

            tutor_id:
              assignment.tutor_id,

            subject_id:
              assignment.subject_id,

            active: true,
          })
        );

      const {
        error: assignmentError,
      } =
        await supabaseAdmin
          .from("tutor_assignments")
          .insert(tutorAssignments);

      if (assignmentError) {
        return NextResponse.json(
          {
            error:
              assignmentError.message,
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * =====================================================
     * SEND LOGIN EMAIL
     * =====================================================
     */

    const { data: emailData, error: emailError } =
      await resend.emails.send({
        from:
          "GS Academy <booking@gsacademyhub.com>",

        to: body.email,

        subject:
          "Your GS Academy Student Portal Login Details",

        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">

            <h1 style="color:#0f172a">
              GS Academy
            </h1>

            <p>
              <strong>Grooming Scholars</strong>
            </p>

            <p>
              Welcome ${body.full_name},
            </p>

            <p>
              Your GS Academy student portal account
              has been created successfully.
            </p>

            <p>
              You can now access your dashboard,
              lessons, timetable and class information.
            </p>

            <h2>
              Student Portal Login Details
            </h2>

            <p>
              <strong>Login Email:</strong>
              ${authEmail}
            </p>

            ${
              authEmail !== body.email
                ? `
                  <p style="color:#b45309">
                    Please use the Login Email above
                    when signing in. Your registered
                    contact email remains ${body.email}.
                  </p>
                `
                : ""
            }

            <p>
              <strong>Temporary Password:</strong>
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
              Login To Student Portal
            </a>

            <p style="margin-top:25px">
              For security reasons, please change your
              password after your first login.
            </p>

            <p>
              Thank you for choosing GS Academy.
            </p>

            <p>
              GS Academy<br/>
              Grooming Scholars
            </p>

            <a href="https://gsacademyhub.com">
              www.gsacademyhub.com
            </a>

          </div>
        `,
      });

    if (emailError) {
      console.log(
        "EMAIL ERROR:",
        emailError
      );
    } else {
      console.log(
        "LOGIN EMAIL SENT:",
        emailData
      );
    }

    /*
     * =====================================================
     * RETURN RESULT
     * =====================================================
     */

    return NextResponse.json({
      success: true,

      student,

      temporaryPassword,

      loginEmail: authEmail,
    });

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}