import { supabase } from "@/lib/supabase";


export async function getStudentClasses(studentId:string) {


  const { data, error } = await supabase
    .from("tutor_assignments")
    .select(`
      id,

      subjects (
        id,
        name
      ),

      tutors (
        id,
        full_name,
        email
      )
    `)
    .eq("student_id", studentId)
    .eq("active", true);



  if(error){

    console.log(error);

    return {
      data: [],
      error
    };

  }



  return {
    data,
    error:null
  };


}