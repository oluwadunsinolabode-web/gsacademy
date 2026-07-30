import { supabase } from "@/lib/supabase";

export async function createStudent(student: any) {
  return await supabase
    .from("students")
    .insert(student)
    .select()
    .single();
}

export async function createTutor(tutor: any) {
  return await supabase
    .from("tutors")
    .insert(tutor)
    .select()
    .single();
}

export async function getStudents() {
  return await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function getTutors() {
  return await supabase
    .from("tutors")
    .select("*")
    .order("created_at", { ascending: false });
}