import Link from "next/link";

export default function ClassesPage() {
  return (
    <>
      <h1 className="text-4xl font-extrabold text-slate-900">
        My Classes
      </h1>

      <p className="mt-3 text-slate-600">
        View your upcoming lessons and access today's classwork.
      </p>

      <div className="mt-10 space-y-8">

        {/* Upcoming Lesson */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex flex-col justify-between gap-8 lg:flex-row">

            <div>

              <p className="font-semibold text-yellow-600">
                Upcoming Lesson
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Mathematics
              </h2>

              <div className="mt-5 space-y-2 text-slate-600">

                <p>
                  <strong>Tutor:</strong> Great Sam
                </p>

                <p>
                  <strong>Date:</strong> Tuesday, 28 July
                </p>

                <p>
                  <strong>Time:</strong> 6:00 PM
                </p>

                <p>
                  <strong>Duration:</strong> 1 Hour
                </p>

              </div>

            </div>

            <div className="flex flex-col gap-4">

              <button className="rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900 transition hover:bg-yellow-400">
                Join Class
              </button>

              <Link
                href="/dashboard/classwork"
                className="rounded-xl bg-slate-900 px-8 py-4 text-center font-bold text-white transition hover:bg-slate-800"
              >
                Open Today's Classwork
              </Link>

            </div>

          </div>

        </div>

        {/* Previous Lesson */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <p className="font-semibold text-slate-500">
            Previous Lesson
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            English Language
          </h2>

          <p className="mt-4 text-green-600 font-semibold">
            ✓ Completed Successfully
          </p>

        </div>

      </div>
    </>
  );
}