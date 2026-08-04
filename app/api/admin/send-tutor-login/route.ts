import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(
  process.env.RESEND_API_KEY!
);


function generatePassword(length = 10) {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[
      Math.floor(Math.random() * chars.length)
    ];
  }

  return password;
}



export async function POST(request: NextRequest) {

  try {

    const { tutorId } = await request.json();


    const { data: tutor, error: tutorError } =
      await supabase
        .from("tutors")
        .select("*")
        .eq("id", tutorId)
        .single();



    if (tutorError || !tutor) {

      return NextResponse.json(
        {
          error: "Tutor not found."
        },
        {
          status: 404
        }
      );

    }



    const password = generatePassword();



    const { data:userList } =
      await supabase.auth.admin.listUsers();



    const existingUser =
      userList.users.find(
        (user) =>
          user.email === tutor.email
      );



    let authId = "";



    if(existingUser){


      authId = existingUser.id;


      await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password,
        }
      );


    } else {



      const { data:newUser, error } =
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
          {
            error:error.message
          },
          {
            status:400
          }
        );

      }


      authId = newUser.user.id;


    }




    await supabase
      .from("tutors")
      .update({
        auth_id: authId,
      })
      .eq(
        "id",
        tutor.id
      );




    await resend.emails.send({

      from:
        "GS Academy <noreply@gsacademyhub.com>",

      to:tutor.email,

      subject:
        "Your GS Academy Tutor Login",


      html:`

      <h2>Welcome to GS Academy</h2>

      <p>Hello ${tutor.full_name}</p>

      <p>Your tutor account is ready.</p>

      <p>
      Email:
      <strong>${tutor.email}</strong>
      </p>

      <p>
      Temporary Password:
      <strong>${password}</strong>
      </p>

      <p>
      Login:
      https://gsacademyhub.com/login/tutor
      </p>

      <p>
      Please change your password after login.
      </p>

      <br/>

      <p>
      GS Academy
      </p>

      `

    });



    return NextResponse.json({
      success:true
    });



  } catch(err:any) {


    return NextResponse.json(
      {
        error:err.message
      },
      {
        status:500
      }
    );


  }

}