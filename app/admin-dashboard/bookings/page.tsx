import Link from "next/link";
import { getBookings } from "@/lib/services/bookings";

export default async function AdminBookingsPage() {
  const { data: bookings } = await getBookings();

  return (
    <div className="mx-auto max-w-7xl">

      <h1 className="text-4xl font-extrabold">
        Booking Requests
      </h1>

      <p className="mt-3 text-slate-600">
        Discovery session requests submitted from the website.
      </p>

      <div className="mt-10 rounded-3xl bg-white shadow">

        {bookings?.length ? (

          bookings.map((booking: any) => (

            <Link
              key={booking.id}
              href={`/admin-dashboard/bookings/${booking.id}`}
              className="flex items-center justify-between border-b p-6 hover:bg-slate-50"
            >

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  {booking.student_name}
                </h2>

               <p className="text-slate-800 font-medium">
  {booking.email}
</p>

               <p className="text-slate-700">
  {booking.country}
</p>
              </div>

             <span
  className={`rounded-full px-4 py-2 text-sm font-bold ${
    booking.booking_status === "Pending"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-green-100 text-green-700"
  }`}
>
  {booking.booking_status}
</span>

            </Link>

          ))

        ) : (

          <div className="p-10 text-center">

            No bookings yet.

          </div>

        )}

      </div>

    </div>
  );
}