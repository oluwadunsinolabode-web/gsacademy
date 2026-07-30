import Link from "next/link";
import {
  Search,
  UserPlus,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

export default function AdminStudentsPage() {
  return (
    <div className="mx-auto max-w-7xl">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <h1 className="text-4xl font-extrabold text-slate-900">
            Students
          </h1>

          <p className="mt-3 text-slate-700">
            Manage all students registered in GS Academy.
          </p>

        </div>

        <Link
          href="/admin-dashboard/students/new"
          className="inline-flex items-center gap-3 rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900 hover:bg-yellow-400"
        >
          <UserPlus size={22} />
          Add Student
        </Link>

      </div>

      <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

        <div className="relative">

          <Search
            size={22}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search student..."
            className="w-full rounded-2xl border border-slate-200 py-4 pl-14 pr-5 outline-none focus:border-yellow-500"
          />

        </div>

      </div>

      <div className="mt-10 rounded-3xl bg-white shadow-sm">

        <div className="border-b border-slate-200 p-6">

          <h2 className="text-2xl font-bold text-slate-900">
            Registered Students
          </h2>

        </div>

        <Link
          href="/admin-dashboard/students/1"
          className="flex items-center justify-between p-6 hover:bg-slate-50"
        >

          <div className="flex items-center gap-5">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">

              <GraduationCap
                className="text-yellow-600"
                size={28}
              />

            </div>

            <div>

              <h3 className="text-xl font-bold text-slate-900">
                Samuel Johnson
              </h3>

              <p className="text-slate-600">
                Mathematics • Package 2
              </p>

            </div>

          </div>

          <ChevronRight className="text-slate-400" />

        </Link>

      </div>

    </div>
  );
}