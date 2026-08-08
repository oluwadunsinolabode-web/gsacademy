"use client";

import Link from "next/link";
import {
  CalendarDays,
  ClipboardCheck,
  BookOpen,
  Users,
  Bell,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export default function TutorDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">

      {/* Header */}

      <h1 className="text-4xl font-extrabold text-slate-900">
        Welcome Back, Great Sam 👋
      </h1>

      <p className="mt-3 text-slate-700">
        Here's everything happening in your classroom today.
      </p>

      {/* Summary Cards */}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <CalendarDays
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 font-semibold text-slate-600">
            Today's Classes
          </p>

          <h2 className="mt-2 text-4xl font-extrabold text-slate-900">
            3
          </h2>

        </div>



        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <ClipboardCheck
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 font-semibold text-slate-600">
            Pending Classwork
          </p>

          <h2 className="mt-2 text-4xl font-extrabold text-red-600">
            7
          </h2>

        </div>



        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <BookOpen
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 font-semibold text-slate-600">
            Homework Waiting
          </p>

          <h2 className="mt-2 text-4xl font-extrabold text-slate-900">
            4
          </h2>

        </div>



        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <Users
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 font-semibold text-slate-600">
            Students
          </p>

          <h2 className="mt-2 text-4xl font-extrabold text-green-600">
            18
          </h2>

        </div>

      </div>



      {/* Main Section */}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        {/* Today's Schedule */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold text-slate-900">
              Today's Schedule
            </h2>

            <CalendarDays
              className="text-yellow-500"
              size={28}
            />

          </div>



          {/* Lesson */}

          <div className="mt-8 rounded-2xl border p-5">

            <p className="font-semibold text-yellow-600">
              6:00 PM
            </p>

            <h3 className="mt-2 text-xl font-bold">
              Mathematics
            </h3>

            <p className="mt-2 text-slate-600">
              Samuel Johnson
            </p>

            <p className="text-sm text-slate-500">
              Package 2
            </p>

            <button className="mt-5 rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-900 hover:bg-yellow-400">
              Start Class
            </button>

          </div>



          <div className="mt-5 rounded-2xl border p-5">

            <p className="font-semibold text-yellow-600">
              7:30 PM
            </p>

            <h3 className="mt-2 text-xl font-bold">
              Mathematics Small Group
            </h3>

            <p className="mt-2 text-slate-600">
              4 Students
            </p>

            <button className="mt-5 rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-900 hover:bg-yellow-400">
              Start Class
            </button>

          </div>

        </div>





        {/* Quick Actions */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Quick Actions
          </h2>

          <div className="mt-8 grid gap-5">

            <Link
              href="/tutor-dashboard/homework"
              className="flex items-center justify-between rounded-2xl border p-5 transition hover:bg-yellow-50"
            >

              <span className="font-semibold">
                Assign Homework
              </span>

              <ArrowRight size={20} />

            </Link>



            <Link
              href="/tutor-dashboard/resources"
              className="flex items-center justify-between rounded-2xl border p-5 transition hover:bg-yellow-50"
            >

              <span className="font-semibold">
                Upload Learning Resource
              </span>

              <ArrowRight size={20} />

            </Link>



            <Link
              href="/tutor-dashboard/students"
              className="flex items-center justify-between rounded-2xl border p-5 transition hover:bg-yellow-50"
            >

              <span className="font-semibold">
                Open Students Workspace
              </span>

              <ArrowRight size={20} />

            </Link>



            <Link
              href="/tutor-dashboard/classwork"
              className="flex items-center justify-between rounded-2xl border p-5 transition hover:bg-yellow-50"
            >

              <span className="font-semibold">
                Create Classwork
              </span>

              <ArrowRight size={20} />

            </Link>

          </div>

        </div>

      </div>





      {/* Bottom Section */}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        {/* Notifications */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center gap-3">

            <Bell
              size={28}
              className="text-yellow-500"
            />

            <h2 className="text-2xl font-bold">
              Recent Activity
            </h2>

          </div>

          <div className="mt-8 space-y-5">

            <p>✅ Samuel submitted Mathematics CW.</p>

            <p>✅ Esther completed Homework.</p>

            <p>📝 Four classwork submissions are waiting for marking.</p>

            <p>📚 Physics homework has been published successfully.</p>

          </div>

        </div>



        {/* Performance */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center gap-3">

            <TrendingUp
              size={28}
              className="text-yellow-500"
            />

            <h2 className="text-2xl font-bold">
              Weekly Overview
            </h2>

          </div>

          <div className="mt-8 space-y-5">

            <div className="flex justify-between">

              <span>Lessons Completed</span>

              <strong>12</strong>

            </div>

            <div className="flex justify-between">

              <span>Homework Published</span>

              <strong>8</strong>

            </div>

            <div className="flex justify-between">

              <span>Assignments Marked</span>

              <strong>31</strong>

            </div>

            <div className="flex justify-between">

              <span>Average Student Score</span>

              <strong>82%</strong>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}