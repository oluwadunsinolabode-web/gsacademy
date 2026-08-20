import { createClient } from "@/lib/supabase/client";

export async function getTutors() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("CURRENT AUTH USER:", user?.id);
  console.log("AUTH USER ERROR:", userError);

  if (!user) {
    return {
      data: [],
      error: new Error("No authenticated user found"),
    };
  }

  const { data, error } = await supabase
    .from("tutors")
    .select("*")
    .order("created_at", { ascending: false });

  console.log("TUTOR DATA:", data);
  console.log("TUTOR ERROR:", error);

  return {
    data: data || [],
    error,
  };
}

export async function createTutor(tutor: any) {
  const supabase = createClient();

  return await supabase
    .from("tutors")
    .insert(tutor)
    .select()
    .single();
}

export async function getTutor(id: string) {
  const supabase = createClient();

  return await supabase
    .from("tutors")
    .select("*")
    .eq("id", id)
    .single();
}