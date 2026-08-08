import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Get the currently logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 2. Find the tutor record belonging to this Auth user
    const { data: tutor, error: tutorError } = await supabase
      .from("tutors")
      .select("id, full_name, email, subjects, status")
      .eq("auth_id", user.id)
      .single();

    if (tutorError || !tutor) {
      return NextResponse.json(
        { error: "Tutor profile not found" },
        { status: 404 }
      );
    }

    // 3. Get students assigned to this tutor
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("*")
      .eq("tutor_id", tutor.id)
      .order("full_name", { ascending: true });

    if (studentsError) {
      console.error("Students query error:", studentsError);

      return NextResponse.json(
        { error: studentsError.message },
        { status: 500 }
      );
    }

    // 4. Return tutor + assigned students
    return NextResponse.json({
      tutor,
      students: students || [],
      totalStudents: students?.length || 0,
    });
  } catch (error) {
    console.error("Tutor students API error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}