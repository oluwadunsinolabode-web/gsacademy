import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================
// SAVE TUTOR ASSIGNMENTS
// ==========================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    // Delete old assignments
    const { error: deleteError } = await supabaseAdmin
      .from("tutor_assignments")
      .delete()
      .eq("student_id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      );
    }

    // Insert new assignments
    if (
      Array.isArray(body.assignments) &&
      body.assignments.length > 0
    ) {
      const assignments = body.assignments.map((item: any) => ({
        student_id: id,
        subject_id: item.subject_id,
        tutor_id: item.tutor_id,
        active: true,
      }));

      const { error } = await supabaseAdmin
        .from("tutor_assignments")
        .insert(assignments);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}