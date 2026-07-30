import { supabase } from "@/lib/supabase";

export async function assignTutor(data: any) {
  return await supabase
    .from("tutor_assignments")
    .insert(data)
    .select()
    .single();
}

export async function getTutorAssignments() {
  return await supabase
    .from("tutor_assignments")
    .select(
      `
      *,
      students(*),
      tutors(*),
      subjects(*)
      `
    );
}