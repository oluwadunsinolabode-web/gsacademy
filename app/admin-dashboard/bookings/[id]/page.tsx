import { getBooking } from "@/lib/services/bookings";
import Link from "next/link";

export default async function BookingDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: booking, error } = await getBooking(id);

  if (error) {
    return (
      <div className="p-10">
        <h1 className="text-3xl font-bold text-red-600">
          Database Error
        </h1>

        <pre className="mt-6">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-10 text-xl font-bold">
        Booking not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">

      <h1 className="text-4xl font-extrabold text-slate-900">
        Booking Details
      </h1>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow">

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <p className="font-bold">Student Name</p>
            <p>{booking.student_name}</p>
          </div>

          <div>
            <p className="font-bold">Parent Name</p>
            <p>{booking.parent_name}</p>
          </div>

          <div>
            <p className="font-bold">Email</p>
            <p>{booking.email}</p>
          </div>

          <div>
            <p className="font-bold">WhatsApp</p>
            <p>{booking.whatsapp}</p>
          </div>

          <div>
            <p className="font-bold">Country</p>
            <p>{booking.country}</p>
          </div>

          <div>
            <p className="font-bold">Academic Level</p>
            <p>{booking.student_level}</p>
          </div>

          <div>
            <p className="font-bold">Package</p>
            <p>{booking.package}</p>
          </div>

          <div>
            <p className="font-bold">Status</p>
            <p>{booking.booking_status}</p>
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