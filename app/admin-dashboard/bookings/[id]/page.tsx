import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function BookingDetails({
  params,
}: {
  params: { id: string };
}) {
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!booking) {
    return (
      <div className="p-10">
        Booking not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">

      <h1 className="text-4xl font-extrabold">
        Booking Details
      </h1>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow">

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <p className="font-bold">Student Name</p>
            <p>{booking.student_name}</p>

          </div>

          <div>

            <p className="font-bold">Email</p>
            <p>{booking.email}</p>

          </div>

          <div>

            <p className="font-bold">Phone</p>
            <p>{booking.phone}</p>

          </div>

          <div>

            <p className="font-bold">Country</p>
            <p>{booking.country}</p>

          </div>

          <div>

            <p className="font-bold">Academic Level</p>
            <p>{booking.academic_level}</p>

          </div>

          <div>

            <p className="font-bold">Package</p>
            <p>{booking.package}</p>

          </div>

        </div>

        <div className="mt-10 flex gap-4">

          <Link
            href={`/admin-dashboard/bookings/${booking.id}/approve`}
            className="rounded-xl bg-green-600 px-8 py-4 font-bold text-white"
          >
            Approve Booking
          </Link>

          <button className="rounded-xl bg-red-600 px-8 py-4 font-bold text-white">
            Reject
          </button>

        </div>

      </div>

    </div>
  );
}