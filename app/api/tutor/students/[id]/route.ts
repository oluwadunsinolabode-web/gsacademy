import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get logged-in tutor
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

    // Find tutor
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

    // Get student ID
    const { id } = await params;

    // Get student ONLY if assigned to this tutor
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .eq("tutor_id", tutor.id)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: "Student not found or not assigned to you" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tutor,
      student,
    });
  } catch (error) {
    console.error("Tutor student API error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}