import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      full_name,
      email,
      phone,
      subjects,
    } = body;

    const temporaryPassword = "GS123456";

    const subjectsArray = subjects
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);

    // Create Supabase Auth account
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Save tutor
    const { error } = await supabaseAdmin
      .from("tutors")
      .insert([
        {
          full_name,
          email,
          phone,
          subjects: subjectsArray,
          status: "active",

          auth_id: authData.user.id,
          temporary_password: temporaryPassword,
          password_changed: false,
        },
      ]);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      temporaryPassword,
    });

  } catch (err) {
    console.log(err);

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