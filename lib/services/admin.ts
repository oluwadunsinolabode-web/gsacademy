import { createClient } from "@/lib/supabase/server";


// ========================================
// CHECK IF CURRENT USER IS AN ADMIN
// ========================================

export async function isAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No logged-in user
  if (!user) {
    return {
      authenticated: false,
      admin: false,
    };
  }

  // Check whether this authenticated user
  // actually exists in the admins table
  // and is active.
  const { data: admin } = await supabase
    .from("admins")
    .select("id, auth_id, active")
    .eq("auth_id", user.id)
    .eq("active", true)
    .maybeSingle();

  return {
    authenticated: true,
    admin: !!admin,
  };
}


// ========================================
// CREATE STUDENT
// ========================================

export async function createStudent(student: any) {
  const supabase = await createClient();

  return await supabase
    .from("students")
    .insert(student)
    .select()
    .single();
}


// ========================================
// CREATE TUTOR
// ========================================

export async function createTutor(tutor: any) {
  const supabase = await createClient();

  return await supabase
    .from("tutors")
    .insert(tutor)
    .select()
    .single();
}


// ========================================
// GET ALL STUDENTS
// ========================================

export async function getStudents() {
  const supabase = await createClient();

  return await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });
}


// ========================================
// GET ALL TUTORS
// ========================================

export async function getTutors() {
  const supabase = await createClient();

  return await supabase
    .from("tutors")
    .select("*")
    .order("created_at", { ascending: false });
}