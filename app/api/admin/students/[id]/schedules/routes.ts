import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);



// GET STUDENT SCHEDULES

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id:string }> }
){

  const { id } = await params;


  const { data, error } =
    await supabaseAdmin
      .from("student_schedules")
      .select(`
        id,
        day,
        time,

        subjects(
          id,
          name
        ),

        tutors(
          id,
          full_name
        )

      `)
      .eq(
        "student_id",
        id
      );



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


}






// SAVE STUDENT SCHEDULES

export async function POST(
  request:NextRequest,
  { params }: { params: Promise<{ id:string }> }
){

try{


const { id } = await params;


const body =
await request.json();




// remove old schedules

await supabaseAdmin
.from("student_schedules")
.delete()
.eq(
"student_id",
id
);





if(
body.schedules &&
body.schedules.length > 0
){


const schedules =
body.schedules.map(
(item:any)=>({

student_id:id,

subject_id:
item.subject_id,

tutor_id:
item.tutor_id,

day:
item.day,

time:
item.time

})
);




const {error} =
await supabaseAdmin
.from("student_schedules")
.insert(
schedules
);



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



}




return NextResponse.json(
{
success:true
}
);



}catch(error){


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