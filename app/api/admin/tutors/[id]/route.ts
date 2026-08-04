import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ======================
// GET SINGLE TUTOR
// ======================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const { id } = await params;

  const { data, error } = await supabase
    .from("tutors")
    .select("*")
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

// ======================
// UPDATE TUTOR
// ======================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const { id } = await params;

  const body = await request.json();

  const { error } = await supabase
    .from("tutors")
    .update({
      full_name: body.full_name,
      email: body.email,
      phone: body.phone,
      subjects: body.subjects,
      status: body.status,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}