import { supabase } from "@/lib/supabase";


export async function getStudents() {
  return await supabase
    .from("students")
    .select(`
      *,
      tutors (
        id,
        full_name,
        email,
        phone,
        subjects
      )
    `)
    .order("created_at", { ascending: false });
}



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
      outstanding_balance: student.outstanding_balance ?? 0,

      payment_due_date: student.payment_due_date ?? null,

      google_meet_link: student.google_meet_link ?? null,

      lesson_schedule: student.lesson_schedule ?? null,

      status: student.status ?? "Active",

      auth_id: student.auth_id ?? null,
    })
    .select()
    .single();

}



export async function getStudent(id: string) {

  return await supabase
    .from("students")
    .select(`
      *,
      tutors (
        id,
        full_name,
        email,
        phone,
        subjects
      )
    `)
    .eq("id", id)
    .single();

}



export async function getStudentByAuthId(authId: string) {

  return await supabase
    .from("students")
    .select(`
      *,
      tutors (
        id,
        full_name,
        email,
        phone,
        subjects
      )
    `)
    .eq("auth_id", authId)
    .single();

}



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



export async function deleteStudent(id: string) {

  return await supabase
    .from("students")
    .delete()
    .eq("id", id);

}