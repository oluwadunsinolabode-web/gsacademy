"use client";

import {
  CalendarDays,
  Clock3,
  Users,
  Video,
} from "lucide-react";

export default function TutorTimetablePage() {
  return (
    <div className="mx-auto max-w-7xl">

      <h1 className="text-4xl font-extrabold text-slate-900">
        My Timetable
      </h1>

      <p className="mt-3 text-slate-600">
        View your scheduled classes for the week.
      </p>

      <div className="mt-10 space-y-8">

        {/* Monday */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center gap-3">

            <CalendarDays
              size={30}
              className="text-yellow-500"
            />

            <h2 className="text-2xl font-bold">
              Monday
            </h2>

          </div>

          <div className="mt-8 space-y-5">

            <div className="rounded-2xl border p-5">

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <h3 className="text-xl font-bold">
                    Mathematics
                  </h3>

                  <p className="mt-2 text-slate-600">
                    Samuel Johnson
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-slate-500">
                    <Clock3 size={18}/>
                    6:00 PM - 7:00 PM
                  </p>

                </div>

                <button className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-900 hover:bg-yellow-400">

                  <Video size={18} className="inline mr-2"/>

                  Start Class

                </button>

              </div>

            </div>



            <div className="rounded-2xl border p-5">

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <h3 className="text-xl font-bold">
                    Small Group Mathematics
                  </h3>

                  <p className="mt-2 flex items-center gap-2 text-slate-600">

                    <Users size={18}/>

                    4 Students

                  </p>

                  <p className="mt-2 flex items-center gap-2 text-slate-500">

                    <Clock3 size={18}/>

                    7:30 PM - 8:30 PM

                  </p>

                </div>

                <button className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-900 hover:bg-yellow-400">

                  <Video size={18} className="inline mr-2"/>

                  Start Class

                </button>

              </div>

            </div>

          </div>

        </div>



        {/* Tuesday */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center gap-3">

            <CalendarDays
              size={30}
              className="text-yellow-500"
            />

            <h2 className="text-2xl font-bold">
              Tuesday
            </h2>

          </div>

          <p className="mt-8 text-slate-500">
            No lessons scheduled.
          </p>

        </div>



        {/* Wednesday */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center gap-3">

            <CalendarDays
              size={30}
              className="text-yellow-500"
            />

            <h2 className="text-2xl font-bold">
              Wednesday
            </h2>

          </div>

          <p className="mt-8 text-slate-500">
            No lessons scheduled.
          </p>

        </div>

      </div>

    </div>
  );
}