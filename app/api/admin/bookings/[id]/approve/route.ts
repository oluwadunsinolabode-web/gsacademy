import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Get booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Create student
    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        full_name: booking.student_name,
        email: booking.email,
        phone: booking.phone,
        country: booking.country,
        academic_level: booking.academic_level,
      })
      .select()
      .single();

    if (studentError) {
      return NextResponse.json(
        { error: studentError.message },
        { status: 400 }
      );
    }

    // Update booking status
    await supabase
      .from("bookings")
      .update({
        status: "Approved",
      })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      student,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}