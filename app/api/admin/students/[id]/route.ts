import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================
// GET SINGLE STUDENT
// ==========================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

 const { data, error } = await supabaseAdmin
  .from("students")
 .select(`
  *,
  tutor_assignments(
    subject_id,
    tutor_id,
    tutors(
      full_name,
      email,
      phone
    ),
    subjects(
      name
    )
  )
`)
  .eq("id", id)
  .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json(data);
}

// ==========================
// UPDATE STUDENT
// ==========================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const { error } = await supabaseAdmin
      .from("students")
      .update({
        full_name: body.full_name,
        phone: body.phone,
        parent_name: body.parent_name,
        parent_phone: body.parent_phone,
        country: body.country,
        academic_level: body.academic_level,
        package: body.package,
        subjects: body.subjects,
        lesson_schedule: body.lesson_schedule,
        google_meet_link: body.google_meet_link,
        amount_paid: body.amount_paid,
        outstanding_balance: body.outstanding_balance,
        payment_due_date: body.payment_due_date,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Delete old tutor assignments
    await supabaseAdmin
      .from("tutor_assignments")
      .delete()
      .eq("student_id", id);

    // Insert new tutor assignments
    if (body.assignments?.length > 0) {
      const assignments = body.assignments.map((item: any) => ({
        student_id: id,
        tutor_id: item.tutor_id,
        subject_id: item.subject_id,
        active: true,
      }));

      await supabaseAdmin
        .from("tutor_assignments")
        .insert(assignments);
    }

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.log(error);

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