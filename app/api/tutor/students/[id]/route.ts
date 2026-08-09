import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Get the student directly from the UUID in the URL
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select(`
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
      `)
      .eq("id", id)
      .single();

    if (studentError || !student) {
      console.error("Student lookup error:", studentError);

      return NextResponse.json(
        {
          error: "Student not found",
          details: studentError?.message || null,
          studentId: id,
        },
        { status: 404 }
      );
    }

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