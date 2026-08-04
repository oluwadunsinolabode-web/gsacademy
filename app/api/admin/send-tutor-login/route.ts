import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

function generatePassword(length = 10) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  return password;
}

export async function POST(request: NextRequest) {
  try {
    const { tutorId } = await request.json();

    // Get tutor
    const { data: tutor, error: tutorError } = await supabase
      .from("tutors")
      .select("*")
      .eq("id", tutorId)
      .single();

    if (tutorError || !tutor) {
      return NextResponse.json(
        { error: "Tutor not found." },
        { status: 404 }
      );
    }

    const password = generatePassword();

    // Create Auth account
   const password = generatePassword();

const { data: existingUsers } =
  await supabase.auth.admin.listUsers();

const existingUser = existingUsers.users.find(
  (user) => user.email === tutor.email
);


let authId = "";


if (existingUser) {

  authId = existingUser.id;


  await supabase.auth.admin.updateUserById(
    existingUser.id,
    {
      password,
    }
  );


} else {


  const { data: newUser, error } =
    await supabase.auth.admin.createUser({

      email: tutor.email,

      password,

      email_confirm:true,

      user_metadata:{
        role:"tutor",
      },

    });


  if(error){

    return NextResponse.json(
      {error:error.message},
      {status:400}
    );

  }


  authId = newUser.user.id;

}
        email: tutor.email,
        password,
        email_confirm: true,
        user_metadata: {
          role: "tutor",
        },
      });

    // If the account already exists, continue
    if (
      authError &&
      !authError.message.toLowerCase().includes("already")
    ) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Save auth_id if newly created
    if (authUser?.user?.id) {
      await supabase
        .from("tutors")
        .update({
          auth_id: authUser.user.id,
        })
        .eq("id", tutor.id);
    }

    // Send email
    await resend.emails.send({
      from: "GS Academy <noreply@gsacademyhub.com>",
      to: tutor.email,
      subject: "Your GS Academy Tutor Login",

      html: `
        <h2>Welcome to GS Academy</h2>

        <p>Hello <strong>${tutor.full_name}</strong>,</p>

        <p>Your tutor account is ready.</p>

        <p><strong>Email:</strong> ${tutor.email}</p>

        <p><strong>Temporary Password:</strong> ${password}</p>

        <p>
          Login:
          <a href="https://gsacademyhub.com/login/tutor">
            https://gsacademyhub.com/login/tutor
          </a>
        </p>

        <p>
          Please change your password after your first login.
        </p>

        <br>

        <p>GS Academy</p>
      `,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}