import { createClient } from "@/lib/supabase/server";

export async function createStudent(student: any) {
  const supabase = await createClient();

  return await supabase
    .from("students")
    .insert(student)
    .select()
    .single();
}