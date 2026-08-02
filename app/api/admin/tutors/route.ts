import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const body = await request.json();

  const { full_name, email, phone, subjects } = body;

  const { error } = await supabase.from("tutors").insert([
    {
      full_name,
      email,
      phone,
      subjects,
      status: "active",
    },
  ]);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}