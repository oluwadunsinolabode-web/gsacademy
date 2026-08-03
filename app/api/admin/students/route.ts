import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Generate a temporary password
    const temporaryPassword =
      Math.random().toString(36).slice(-8) + "Gs@1";

    // Create Auth user
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: body.email,
        password: temporaryPassword,
        email_confirm: true,
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Save student
    const { data: student, error: studentError } =
      await supabaseAdmin
        .from("students")
        .insert({
          full_name: body.full_name,
          email: body.email,
          phone: body.phone,
          parent_name: body.parent_name,
          parent_phone: body.parent_phone,
          country: body.country,
          academic_level: body.academic_level,
          package: body.package,
          tutor_id: body.tutor_id,
          subjects: body.subjects,
          amount_paid: body.amount_paid,
          outstanding_balance: body.outstanding_balance,
          payment_due_date: body.payment_due_date,
          google_meet_link: body.google_meet_link,
          lesson_schedule: body.lesson_schedule,
          status: "Active",
          auth_id: authUser.user.id,
        })
        .select()
        .single();

    if (studentError) {
      return NextResponse.json(
        { error: studentError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      student,
      temporaryPassword,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}