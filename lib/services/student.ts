import { supabase } from "@/lib/supabase";

export async function getStudents() {
  return await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function createStudent(student: {
  full_name: string;
  email: string;
  parent_name: string;
  parent_phone: string;
}) {
  return await supabase
    .from("students")
    .insert({
      full_name: student.full_name,
      email: student.email,
      parent_name: student.parent_name,
      parent_phone: student.parent_phone,
    })
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

export async function updateStudent(id: string, updates: any) {
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