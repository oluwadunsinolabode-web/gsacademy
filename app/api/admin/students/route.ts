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



    // Generate temporary password

    const temporaryPassword =
      Math.random().toString(36).slice(-8) + "Gs@1";




    // Create Auth account


    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({

        email: body.email,

        password: temporaryPassword,

        email_confirm: true,

      });



    if (authError) {

      return NextResponse.json(
        {
          error: authError.message
        },
        {
          status:400
        }
      );

    }




    // Create student record


    const { data: student, error: studentError } =

      await supabaseAdmin

        .from("students")

        .insert({


          full_name:
            body.full_name,


          email:
            body.email,


          phone:
            body.phone,


          parent_name:
            body.parent_name,


          parent_phone:
            body.parent_phone,


          country:
            body.country,


          academic_level:
            body.academic_level,


          package:
            body.package,


          subjects:
            body.subjects,


          amount_paid:
            body.amount_paid,


          outstanding_balance:
            body.outstanding_balance,


          payment_due_date:
            body.payment_due_date,


          google_meet_link:
            body.google_meet_link,


          lesson_schedule:
            body.lesson_schedule,


          status:
            "Active",


          auth_id:
            authUser.user.id,


        })

        .select()

        .single();




    if(studentError){

      return NextResponse.json(

        {
          error: studentError.message
        },

        {
          status:400
        }

      );

    }




    // Create tutor-subject assignments


    if(

      body.assignments &&

      body.assignments.length > 0

    ){


      const tutorAssignments =

        body.assignments.map(
          (assignment:any)=>({

            student_id:
              student.id,


            tutor_id:
              assignment.tutor_id,


            subject_id:
              assignment.subject_id,


            active:true,


          })
        );



      const { error: assignmentError } =

        await supabaseAdmin

          .from("tutor_assignments")

          .insert(tutorAssignments);



      if(assignmentError){


        return NextResponse.json(

          {
            error:
              assignmentError.message
          },

          {
            status:400
          }

        );


      }


    }
    // ===============================
// SEND LOGIN EMAIL
// ===============================


const { data: emailData, error: emailError } =

await resend.emails.send({


from:

"GS Academy <booking@gsacademyhub.com>",



to:

body.email,



subject:

"Your GS Academy Student Portal Login Details",



html:`


<!DOCTYPE html>

<html>

<body style="
margin:0;
padding:0;
background:#f8fafc;
font-family:Arial,sans-serif;
">


<div style="
max-width:650px;
margin:40px auto;
background:white;
border-radius:15px;
overflow:hidden;
border:1px solid #e2e8f0;
">



<div style="
background:#0f172a;
padding:30px;
text-align:center;
">


<h1 style="
color:#facc15;
margin:0;
font-size:34px;
">

GS Academy

</h1>


<p style="
color:white;
">

Grooming Scholars

</p>


</div>




<div style="
padding:40px;
">


<h2 style="
color:#0f172a;
">

Welcome ${body.full_name}

</h2>



<p style="
color:#475569;
font-size:16px;
line-height:1.7;
">


Your GS Academy student portal account has been created successfully.


You can now access your dashboard, lessons, timetable and class information.


</p>





<div style="
background:#fef9c3;
border:1px solid #facc15;
border-radius:12px;
padding:25px;
margin:30px 0;
">



<h3 style="
color:#0f172a;
margin-top:0;
">

Student Portal Login Details

</h3>



<p>

<strong>Email:</strong>

${body.email}

</p>




<p>

<strong>Temporary Password:</strong>

${temporaryPassword}

</p>



</div>






<a

href="https://gsacademyhub.com/login"

style="
display:inline-block;
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





<p style="
margin-top:35px;
color:#64748b;
line-height:1.6;
">


For security reasons, please change your password after your first login.


</p>




<p style="
color:#475569;
">

Thank you for choosing GS Academy.


</p>



</div>






<div style="
background:#0f172a;
padding:25px;
text-align:center;
">


<h2 style="
color:#facc15;
">

GS Academy

</h2>



<p style="
color:white;
">

Grooming Scholars

</p>



<p>

<a

href="https://gsacademyhub.com"

style="
color:white;
text-decoration:none;
"

>

www.gsacademyhub.com

</a>


</p>



</div>



</div>



</body>

</html>


`

});





if(emailError){

console.log(
"EMAIL ERROR:",
emailError
);


}
else{


console.log(
"LOGIN EMAIL SENT:",
emailData
);


}




return NextResponse.json({


success:true,


student,


temporaryPassword,


});




} catch(error){



console.log(error);



return NextResponse.json(

{

error:"Internal Server Error"

},

{

status:500

}

);


}

}