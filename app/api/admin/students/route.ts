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

    const realEmail = body.email?.trim().toLowerCase();

    if (!realEmail) {
      return NextResponse.json(
        {
          error: "Student email is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =====================================================
     * GENERATE TEMPORARY PASSWORD
     * =====================================================
     */

    const temporaryPassword =
      Math.random().toString(36).slice(-8) + "Gs@1";

    /*
     * =====================================================
     * CHECK WHETHER REAL EMAIL ALREADY EXISTS IN AUTH
     * =====================================================
     *
     * We no longer create internal GS Academy emails.
     *
     * The student's REAL email must be their Auth login email.
     */

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

    const existingAuthUser =
      existingUsers.users.find(
        (user) =>
          user.email?.toLowerCase() === realEmail
      );

    if (existingAuthUser) {
      return NextResponse.json(
        {
          error:
            "This email already has a GS Academy login account. Please remove the existing student account before creating it again.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * =====================================================
     * CREATE AUTH ACCOUNT
     * =====================================================
     *
     * IMPORTANT:
     * The student's REAL email is now used directly.
     */

    const {
      data: authUser,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser({
        email: realEmail,
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
          email: realEmail,

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
      /*
       * If the student record fails,
       * remove the Auth account we just created.
       */

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
        /*
         * We do not delete the student/Auth account here
         * because the student was already created successfully.
         * The assignment error is returned for correction.
         */

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

    const {
      data: emailData,
      error: emailError,
    } =
      await resend.emails.send({
        from:
          "GS Academy <booking@gsacademyhub.com>",

        to: realEmail,

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
              ${realEmail}
            </p>

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
      console.error(
        "EMAIL ERROR:",
        emailError
      );

      /*
       * The account was created successfully,
       * but the email failed.
       */

      return NextResponse.json(
        {
          success: true,
          warning:
            "Student account was created, but the login email could not be sent.",
          student,
          loginEmail: realEmail,
        },
        {
          status: 200,
        }
      );
    }

    console.log(
      "LOGIN EMAIL SENT:",
      emailData
    );

    /*
     * =====================================================
     * RETURN RESULT
     * =====================================================
     */

    return NextResponse.json({
      success: true,

      student,

      temporaryPassword,

      loginEmail: realEmail,
    });

  } catch (error) {
    console.error(
      "CREATE STUDENT ERROR:",
      error
    );

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