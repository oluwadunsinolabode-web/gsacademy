"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { GraduationCap, Users } from "lucide-react";

export default function LoginPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">

        <div className="max-w-5xl w-full">

          <div className="text-center mb-14">

            <h1 className="text-5xl font-black text-slate-900">
              Welcome Back
            </h1>

           <p className="mt-5 text-lg text-slate-600">
  Access your learning or teaching workspace.
</p>

          </div>

          <div className="grid gap-8 md:grid-cols-2">

            {/* Student */}

            <div className="rounded-3xl bg-white p-10 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100">

                <GraduationCap
                  size={50}
                  className="text-yellow-600"
                />

              </div>

              <h2 className="mt-8 text-center text-3xl font-extrabold text-slate-900">
                Student Portal
              </h2>

              <p className="mt-5 text-center leading-8 text-slate-600">
                Access your lessons, homework,
                classwork, learning resources,
                timetable and academic progress.
              </p>

              <Link
                href="/login/student"
                className="mt-10 block rounded-xl bg-yellow-500 py-4 text-center font-bold text-slate-900 transition hover:bg-yellow-400"
              >
                Continue as Student
              </Link>

            </div>

            {/* Tutor */}

            <div className="rounded-3xl bg-white p-10 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">

                <Users
                  size={50}
                  className="text-slate-900"
                />

              </div>

              <h2 className="mt-8 text-center text-3xl font-extrabold text-slate-900">
                Tutor Portal
              </h2>

              <p className="mt-5 text-center leading-8 text-slate-600">
                Manage students,
                lessons, homework,
                assessments,
                attendance and reports.
              </p>

              <Link
                href="/login/tutor"
                className="mt-10 block rounded-xl bg-slate-900 py-4 text-center font-bold text-white transition hover:bg-slate-800"
              >
                Continue as Tutor
              </Link>

            </div>

          </div>

        </div>

      </main>
    </>
  );
}