import { supabase } from "@/lib/supabase";


// GET ALL STUDENTS
export async function getStudents() {

  return await supabase
    .from("students")
    .select(`
      *,
      tutor_assignments (
        id,
        tutor_id,
        subject_id,
        day,
        time_slot,
        google_meet_link,
        status,
        subjects (
          id,
          name
        ),
        tutors (
          id,
          full_name,
          email,
          phone
        )
      )
    `)
    .order("created_at", { ascending: false });

}



// CREATE STUDENT
export async function createStudent(student: {
  full_name: string;
  email: string;
  phone: string;
  parent_name: string;
  parent_phone: string;
  country: string;
  academic_level: string;
  package: string;
  tutor_id: string;
  subjects?: string[];
  amount_paid?: number;
  outstanding_balance?: number;
  payment_due_date?: string;
  google_meet_link?: string;
  lesson_schedule?: string;
  status?: string;
  auth_id?: string;
}) {


  return await supabase
    .from("students")
    .insert({

      full_name: student.full_name,

      email: student.email,

      phone: student.phone,

      parent_name: student.parent_name,

      parent_phone: student.parent_phone,

      country: student.country,

      academic_level: student.academic_level,

      package: student.package,

      tutor_id: student.tutor_id,


      subjects: student.subjects ?? [],


      amount_paid: student.amount_paid ?? 0,

      outstanding_balance:
        student.outstanding_balance ?? 0,


      payment_due_date:
        student.payment_due_date ?? null,


      google_meet_link:
        student.google_meet_link ?? null,


      lesson_schedule:
        student.lesson_schedule ?? null,


      status:
        student.status ?? "Active",


      auth_id:
        student.auth_id ?? null,

    })
    .select()
    .single();

}



// GET SINGLE STUDENT
export async function getStudent(id: string) {


  return await supabase
    .from("students")
    .select(`

      *,

      tutor_assignments (

        id,

        tutor_id,

        subject_id,

        day,

        time_slot,

        google_meet_link,

        status,


        subjects (

          id,

          name

        ),


        tutors (

          id,

          full_name,

          email,

          phone

        )

      )

    `)
    .eq("id", id)
    .single();


}



// GET STUDENT BY AUTH ID
export async function getStudentByAuthId(authId: string) {


  return await supabase
    .from("students")
    .select(`

      *,

      tutor_assignments (

        id,

        tutor_id,

        subject_id,

        day,

        time_slot,

        google_meet_link,

        status,


        subjects (

          id,

          name

        ),


        tutors (

          id,

          full_name,

          email,

          phone

        )

      )

    `)
    .eq("auth_id", authId)
    .single();


}



// UPDATE STUDENT
export async function updateStudent(
  id: string,
  updates: {

    full_name?: string;

    email?: string;

    phone?: string;

    parent_name?: string;

    parent_phone?: string;

    country?: string;

    academic_level?: string;

    package?: string;

    tutor_id?: string;

    subjects?: string[];

    amount_paid?: number;

    outstanding_balance?: number;

    payment_due_date?: string;

    google_meet_link?: string;

    lesson_schedule?: string;

    status?: string;

    auth_id?: string;

  }
) {


  return await supabase

    .from("students")

    .update(updates)

    .eq("id", id)

    .select()

    .single();


}



// DELETE STUDENT
export async function deleteStudent(id: string) {


  return await supabase

    .from("students")

    .delete()

    .eq("id", id);


}