import { supabase } from "@/lib/supabase";

export async function getTutors() {
  return await supabase
    .from("tutors")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function createTutor(tutor: any) {
  return await supabase
    .from("tutors")
    .insert(tutor)
    .select()
    .single();
}

export async function getTutor(id: string) {
  return await supabase
    .from("tutors")
    .select("*")
    .eq("id", id)
    .single();
}