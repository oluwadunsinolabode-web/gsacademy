import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // 1. Get currently logged-in user
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

    // 2. Get student ID from URL
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // 3. Find the tutor belonging to the logged-in user
    const { data: tutor, error: tutorError } = await supabase
      .from("tutors")
      .select("id, full_name, email, status")
      .eq("auth_id", user.id)
      .single();

    if (tutorError || !tutor) {
      console.error("Tutor lookup error:", tutorError);

      return NextResponse.json(
        { error: "Tutor profile not found" },
        { status: 404 }
      );
    }

    // 4. Get the student
    // IMPORTANT:
    // We check tutor_id as well so a tutor cannot open
    // another tutor's student.
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select(
        `
        id,
        auth_id,
        full_name,
        email,
        phone,
        parent_name,
        parent_phone,
        country,
        academic_level,
        created_at,
        amount_paid,
        outstanding_balance,
        lesson_schedule,
        google_meet_link,
        tutor_id,
        subjects,
        package,
        status,
        payment_due_date,
        password_changed
        `
      )
      .eq("id", id)
      .eq("tutor_id", tutor.id)
      .single();

    if (studentError || !student) {
      console.error("Student lookup error:", studentError);

      return NextResponse.json(
        { error: "Student not found or not assigned to you" },
        { status: 404 }
      );
    }

    // 5. Return student
    return NextResponse.json({
      student,
    });
  } catch (error) {
    console.error("Tutor student API error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}