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



      const { error:updateError } =
        await supabase.auth.admin.updateUserById(

          existingUser.id,

          {

            password,


            user_metadata:{

              role:"tutor",

              must_change_password:true

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



      const { data:newUser, error:createError } =

        await supabase.auth.admin.createUser({

          email:tutor.email,


          password,


          email_confirm:true,


          user_metadata:{

            role:"tutor",

            must_change_password:true

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







    await resend.emails.send({



      from:

      "GS Academy <booking@gsacademyhub.com>",




      to:tutor.email,




      subject:

      "Your GS Academy Tutor Portal Login Details",





      html:`


<!DOCTYPE html>

<html>

<body

style="

font-family:Arial;

background:#f8fafc;

padding:40px;

">


<div

style="

max-width:600px;

margin:auto;

background:white;

padding:40px;

border-radius:15px;

border:1px solid #e2e8f0;

">



<h1

style="

color:#0f172a;

text-align:center;

">

GS Academy

</h1>



<p>

Grooming Scholars

</p>




<h2>

Welcome ${tutor.full_name}

</h2>




<p>

Your Tutor Portal account has been created successfully.

</p>





<div

style="

background:#fef9c3;

padding:20px;

border-radius:10px;

"

>



<p>

<strong>Email:</strong>

${tutor.email}

</p>





<p>

<strong>Temporary Password:</strong>

${password}

</p>




</div>







<a

href="https://gsacademyhub.com/login/tutor"


style="

display:inline-block;

margin-top:25px;

background:#facc15;

padding:15px 25px;

border-radius:10px;

font-weight:bold;

color:#0f172a;

text-decoration:none;

"

>


Login To Tutor Portal


</a>







<p

style="

margin-top:30px;

color:#475569;

"

>


For security, please change your password after your first login.


</p>





<hr/>





<p>

GS Academy Team

</p>




</div>



</body>


</html>


`

    });







    return NextResponse.json({

      success:true

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