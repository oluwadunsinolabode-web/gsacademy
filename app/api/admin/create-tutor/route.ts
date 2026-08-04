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

    password += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );

  }

  return password;

}



export async function POST(request: NextRequest) {

  try {


    const body = await request.json();


    const password = generatePassword();



    // Create Supabase Auth account

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({

        email: body.email,

        password,

        email_confirm: true,

        user_metadata: {
          role: "tutor",
        },

      });



    if (authError) {

      return NextResponse.json(
        {
          error: authError.message,
        },
        {
          status:400,
        }
      );

    }





    // Save tutor profile

    const { error: dbError } =
      await supabase
        .from("tutors")
        .insert({

          auth_id: authUser.user.id,

          full_name: body.full_name,

          email: body.email,

          phone: body.phone,

          subjects: body.subjects,

          status: body.status ?? "Active",

        });



    if(dbError){

      return NextResponse.json(
        {
          error: dbError.message,
        },
        {
          status:400,
        }
      );

    }





    // Send login email

    const emailResponse =
      await resend.emails.send({

        from:
        "GS Academy <noreply@gsacademyhub.com>",


        to:
        body.email,


        subject:
        "Welcome to GS Academy - Tutor Login",



        html:`

        <h2>
        Welcome to GS Academy
        </h2>


        <p>
        Hello ${body.full_name},
        </p>


        <p>
        Your tutor account has been created successfully.
        </p>


        <p>
        <strong>Email:</strong>
        ${body.email}
        </p>


        <p>
        <strong>
        Temporary Password:
        </strong>
        ${password}
        </p>


        <p>
        Login here:
        </p>


        <p>
        https://gsacademyhub.com/login/tutor
        </p>


        <p>
        Please change your password after your first login.
        </p>


        <br/>


        <p>
        GS Academy Team
        </p>


        `,

      });



      console.log(
        "NEW TUTOR EMAIL RESULT:",
        emailResponse
      );





    return NextResponse.json({

      success:true,

      message:"Tutor created and email sent",

    });




  } catch(err:any){


    console.log(
      "CREATE TUTOR ERROR:",
      err
    );


    return NextResponse.json(

      {
        error:err.message,
      },

      {
        status:500,
      }

    );


  }

}