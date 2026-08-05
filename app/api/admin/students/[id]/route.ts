import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);



// ==========================
// GET SINGLE STUDENT
// ==========================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id:string }> }
){

  try {


    const { id } = await params;



    const { data, error } =
      await supabaseAdmin
      .from("students")
      .select(`
        *,
        tutor_assignments(
          id,
          subject_id,
          tutor_id,
          active,

          subjects(
            id,
            name
          ),

          tutors(
            id,
            full_name,
            email,
            phone
          )
        )
      `)
      .eq("id",id)
      .single();



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



    return NextResponse.json(data);



  } catch(error){


    return NextResponse.json(
      {
        error:"Server error"
      },
      {
        status:500
      }
    );

  }

}




// ==========================
// PATCH UPDATE STUDENT
// ==========================


export async function PATCH(
 request:NextRequest,
 {params}:{params:Promise<{id:string}>}
){


try{


const {id}=await params;


const body = await request.json();




// update student table


const {error} = await supabaseAdmin
.from("students")
.update({

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


})
.eq("id",id);




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





return NextResponse.json({

success:true

});



}catch(error){


console.log(error);


return NextResponse.json(

{
error:"Internal server error"
},

{
status:500
}

);


}


}