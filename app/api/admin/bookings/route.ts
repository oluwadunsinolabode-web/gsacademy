import { NextResponse } from "next/server";
import { getBookings } from "@/lib/services/bookings";

export async function GET() {
  const { data, error } = await getBookings();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json(data);
}