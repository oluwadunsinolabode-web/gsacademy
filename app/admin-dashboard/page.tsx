import {
  GraduationCap,
  Users,
  CalendarDays,
  CreditCard,
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <>

      <h1 className="text-4xl font-extrabold text-slate-900">
        Admin Dashboard
      </h1>

      <p className="mt-3 text-slate-700">
        Welcome to the GS Academy Management Portal.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <GraduationCap
            size={34}
            className="text-yellow-600"
          />

          <p className="mt-5 font-semibold text-slate-700">
            Total Students
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            0
          </h2>

        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <Users
            size={34}
            className="text-yellow-600"
          />

          <p className="mt-5 font-semibold text-slate-700">
            Total Tutors
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            0
          </h2>

        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <CalendarDays
            size={34}
            className="text-yellow-600"
          />

          <p className="mt-5 font-semibold text-slate-700">
            Today's Classes
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            0
          </h2>

        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <CreditCard
            size={34}
            className="text-yellow-600"
          />

          <p className="mt-5 font-semibold text-slate-700">
            Pending Payments
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            0
          </h2>

        </div>

      </div>

    </>
  );
}