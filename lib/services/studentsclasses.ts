import { supabase } from "@/lib/supabase";


export async function getStudentClasses(studentId:string){

return await supabase
.from("tutor_assignments")
.select(`
id,
active,

subjects(
 id,
 name
),

tutors(
 id,
 full_name
)

`)
.eq("student_id", studentId)
.eq("active", true);

}