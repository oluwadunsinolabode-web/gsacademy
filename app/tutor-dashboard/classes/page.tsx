import {
  CalendarDays,
  Clock3,
  Users,
  ArrowRight,
} from "lucide-react";

export default function TutorClassesPage() {
  return (
    <>
      <h1 className="text-4xl font-extrabold text-slate-900">
        My Classes
      </h1>

      <p className="mt-3 text-slate-700">
        All classes assigned to you will appear here.
      </p>

      <div className="mt-10 space-y-8">

        {/* Class Card */}

        <div className="rounded-3xl bg-white p-8 shadow-sm transition hover:shadow-lg">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex-1">

              <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-700">
                Package 1 • Small Group
              </span>

              <h2 className="mt-5 text-3xl font-extrabold text-slate-900">
                Mathematics
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-3">

                <div className="flex items-center gap-3">

                  <CalendarDays
                    className="text-yellow-600"
                    size={22}
                  />

                  <div>

                    <p className="text-sm text-slate-500">
                      Date
                    </p>

                    <p className="font-bold text-slate-900">
                      Tuesday, 28 July
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <Clock3
                    className="text-yellow-600"
                    size={22}
                  />

                  <div>

                    <p className="text-sm text-slate-500">
                      Time
                    </p>

                    <p className="font-bold text-slate-900">
                      6:00 PM
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <Users
                    className="text-yellow-600"
                    size={22}
                  />

                  <div>

                    <p className="text-sm text-slate-500">
                      Students
                    </p>

                    <p className="font-bold text-slate-900">
                      6 Students
                    </p>

                  </div>

                </div>

              </div>

            </div>

            <div>

              <button
                className="
                flex items-center gap-2
                rounded-xl
                bg-slate-900
                px-8
                py-4
                font-bold
                text-white
                transition
                hover:bg-slate-800
                "
              >
                Open Class

                <ArrowRight size={20} />

              </button>

            </div>

          </div>

        </div>

        {/* Second Example */}

        <div className="rounded-3xl bg-white p-8 shadow-sm transition hover:shadow-lg">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
                International • One-on-One
              </span>

              <h2 className="mt-5 text-3xl font-extrabold text-slate-900">
                Physics
              </h2>

              <p className="mt-4 text-slate-700">
                Friday • 8:00 PM
              </p>

            </div>

            <button
              className="
              flex items-center gap-2
              rounded-xl
              bg-slate-900
              px-8
              py-4
              font-bold
              text-white
              transition
              hover:bg-slate-800
              "
            >
              Open Class

              <ArrowRight size={20} />

            </button>

          </div>

        </div>

      </div>
    </>
  );
}