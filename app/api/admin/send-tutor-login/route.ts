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


    const { data: tutor, error } =
      await supabase
        .from("tutors")
        .select("*")
        .eq("id", tutorId)
        .single();



    if(error || !tutor){

      return NextResponse.json(
        {
          error:"Tutor not found"
        },
        {
          status:404
        }
      );

    }



    const password = generatePassword();



    const { data:userData } =
      await supabase.auth.admin.listUsers();



    const existingUser =
      userData.users.find(
        (user)=>
          user.email?.toLowerCase()
          ===
          tutor.email.toLowerCase()
      );



    let authId = "";



    if(existingUser){


      const {error:updateError} =
        await supabase.auth.admin.updateUserById(
          existingUser.id,
          {
            password,
            user_metadata:{
              role:"tutor"
            }
          }
        );


      if(updateError){

        return NextResponse.json(
          {
            error:updateError.message
          },
          {
            status:400
          }
        );

      }


      authId = existingUser.id;



    } else {



      const {data:newUser,error:createError} =
        await supabase.auth.admin.createUser({

          email:tutor.email,

          password,

          email_confirm:true,

          user_metadata:{
            role:"tutor"
          }

        });



      if(createError){

        return NextResponse.json(
          {
            error:createError.message
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

        auth_id:authId

      })
      .eq(
        "id",
        tutor.id
      );





    const emailResult =
      await resend.emails.send({

        from:
        "GS Academy <noreply@gsacademyhub.com>",


        to:tutor.email,


        subject:
        "Your GS Academy Tutor Login",


        html:`

        <h2>Welcome to GS Academy</h2>

        <p>Hello ${tutor.full_name},</p>

        <p>Your tutor account has been created.</p>


        <p>
        <b>Email:</b> ${tutor.email}
        </p>


        <p>
        <b>Temporary Password:</b> ${password}
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

      success:true,

      emailResult

    });



  } catch(err:any){


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