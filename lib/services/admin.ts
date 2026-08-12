import { createClient } from "@/lib/supabase/server";

export async function createStudent(student: any) {
  const supabase = await createClient();

  return await supabase
    .from("students")
    .insert(student)
    .select()
    .single();
}

export async function createTutor(tutor: any) {
  const supabase = await createClient();

  return await supabase
    .from("tutors")
    .insert(tutor)
    .select()
    .single();
}

export async function getStudents() {
  const supabase = await createClient();

  return await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function getTutors() {
  const supabase = await createClient();

  return await supabase
    .from("tutors")
    .select("*")
    .order("created_at", { ascending: false });
}