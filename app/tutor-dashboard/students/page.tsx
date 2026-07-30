"use client";

import Link from "next/link";
import {
  Search,
  Users,
  ClipboardCheck,
  BookOpen,
  TrendingUp,
  ChevronRight,
  User,
} from "lucide-react";

export default function TutorStudentsPage() {
  return (
    <div className="mx-auto max-w-7xl">

      {/* Header */}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <h1 className="text-4xl font-extrabold text-slate-900">
            My Students
          </h1>

          <p className="mt-3 text-slate-600">
            Manage every student currently assigned to you.
          </p>

        </div>

      </div>



      {/* Search */}

      <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

        <div className="relative">

          <Search
            size={22}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search student..."
            className="w-full rounded-2xl border border-slate-200 py-4 pl-14 pr-5 outline-none transition focus:border-yellow-500"
          />

        </div>

      </div>



      {/* Package Filter */}

      <div className="mt-6 flex flex-wrap gap-3">

        <button className="rounded-full bg-yellow-500 px-6 py-3 font-semibold text-slate-900">
          All
        </button>

        <button className="rounded-full bg-white px-6 py-3 font-semibold shadow hover:bg-slate-100">
          Package 1
        </button>

        <button className="rounded-full bg-white px-6 py-3 font-semibold shadow hover:bg-slate-100">
          Package 2
        </button>

        <button className="rounded-full bg-white px-6 py-3 font-semibold shadow hover:bg-slate-100">
          Package 3
        </button>

        <button className="rounded-full bg-white px-6 py-3 font-semibold shadow hover:bg-slate-100">
          International
        </button>

      </div>



      {/* Statistics */}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <Users
            size={34}
            className="text-yellow-500"
          />

          <p className="mt-5 text-slate-600">
            Total Students
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            18
          </h2>

        </div>



        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <ClipboardCheck
            size={34}
            className="text-yellow-500"
          />

          <p className="mt-5 text-slate-600">
            Waiting For Marking
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-red-600">
            7
          </h2>

        </div>



        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <BookOpen
            size={34}
            className="text-yellow-500"
          />

          <p className="mt-5 text-slate-600">
            Homework Pending
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            4
          </h2>

        </div>



        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <TrendingUp
            size={34}
            className="text-yellow-500"
          />

          <p className="mt-5 text-slate-600">
            Average Progress
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-green-600">
            82%
          </h2>

        </div>

      </div>



      {/* Student Cards */}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        {/* Student */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="flex gap-5">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">

                <User
                  size={32}
                  className="text-yellow-600"
                />

              </div>

              <div>

                <h2 className="text-2xl font-bold text-slate-900">
                  Samuel Johnson
                </h2>

                <p className="mt-1 font-semibold text-yellow-600">
                  Package 2
                </p>

                <p className="mt-2 text-slate-600">
                  Mathematics • Physics
                </p>

              </div>

            </div>

            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              Active
            </span>

          </div>



          <div className="mt-8 grid grid-cols-2 gap-5">

            <div className="rounded-2xl bg-slate-50 p-4">

              <p className="text-sm text-slate-500">
                Attendance
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                96%
              </h3>

            </div>



            <div className="rounded-2xl bg-slate-50 p-4">

              <p className="text-sm text-slate-500">
                Homework
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                8
              </h3>

            </div>



            <div className="rounded-2xl bg-slate-50 p-4">

              <p className="text-sm text-slate-500">
                Waiting Mark
              </p>

              <h3 className="mt-2 text-2xl font-bold text-red-600">
                2
              </h3>

            </div>



            <div className="rounded-2xl bg-slate-50 p-4">

              <p className="text-sm text-slate-500">
                Progress
              </p>

              <h3 className="mt-2 text-2xl font-bold text-green-600">
                84%
              </h3>

            </div>

          </div>



          <Link
            href="/tutor-dashboard/students/1"
            className="mt-8 flex items-center justify-center gap-3 rounded-xl bg-slate-900 py-4 font-bold text-white transition hover:bg-slate-800"
          >

            Open Workspace

            <ChevronRight size={20} />

          </Link>

        </div>



        {/* Student */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="flex gap-5">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">

                <User
                  size={32}
                  className="text-yellow-600"
                />

              </div>

              <div>

                <h2 className="text-2xl font-bold text-slate-900">
                  Esther Williams
                </h2>

                <p className="mt-1 font-semibold text-yellow-600">
                  Small Group
                </p>

                <p className="mt-2 text-slate-600">
                  Mathematics
                </p>

              </div>

            </div>

            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              Active
            </span>

          </div>



          <div className="mt-8 grid grid-cols-2 gap-5">

            <div className="rounded-2xl bg-slate-50 p-4">

              <p className="text-sm text-slate-500">
                Attendance
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                92%
              </h3>

            </div>



            <div className="rounded-2xl bg-slate-50 p-4">

              <p className="text-sm text-slate-500">
                Homework
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                6
              </h3>

            </div>



            <div className="rounded-2xl bg-slate-50 p-4">

              <p className="text-sm text-slate-500">
                Waiting Mark
              </p>

              <h3 className="mt-2 text-2xl font-bold text-red-600">
                1
              </h3>

            </div>



            <div className="rounded-2xl bg-slate-50 p-4">

              <p className="text-sm text-slate-500">
                Progress
              </p>

              <h3 className="mt-2 text-2xl font-bold text-green-600">
                78%
              </h3>

            </div>

          </div>



          <Link
            href="/tutor-dashboard/students/2"
            className="mt-8 flex items-center justify-center gap-3 rounded-xl bg-slate-900 py-4 font-bold text-white transition hover:bg-slate-800"
          >

            Open Workspace

            <ChevronRight size={20} />

          </Link>

        </div>

      </div>

    </div>
  );
}