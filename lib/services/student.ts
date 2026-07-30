import { supabase } from "@/lib/supabase";

export async function getStudents() {
  return await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function createStudent(student: any) {
  return await supabase
    .from("students")
    .insert(student)
    .select()
    .single();
}

export async function getStudent(id: string) {
  return await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();
}