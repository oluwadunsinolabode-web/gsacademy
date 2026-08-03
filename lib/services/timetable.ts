import { supabase } from "@/lib/supabase";

export async function getTimetable() {
  return await supabase
    .from("timetable")
    .select("*")
    .order("lesson_date", { ascending: true })
    .order("lesson_time", { ascending: true });
}