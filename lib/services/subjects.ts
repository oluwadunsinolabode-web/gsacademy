import { supabase } from "@/lib/supabase";

export async function getSubjects() {
  return await supabase
    .from("subjects")
    .select("*")
    .order("name", { ascending: true });
}