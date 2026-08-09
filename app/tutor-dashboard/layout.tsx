"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function TutorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-slate-100 lg:py-6">

        <div className="w-full overflow-hidden bg-white lg:mx-auto lg:max-w-7xl lg:rounded-3xl lg:shadow-lg">

          {/* Mobile Header */}

          <div className="flex items-center justify-between bg-slate-950 p-5 text-white lg:hidden">

            <div>
              <h2 className="text-xl font-extrabold text-yellow-500">
                GS Academy
              </h2>

              <p className="text-xs tracking-[0.2em]">
                TUTOR PORTAL
              </p>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-xl bg-slate-800 px-4 py-2 text-2xl"
            >
              ☰
            </button>

          </div>

          {/* Mobile Menu */}

          {menuOpen && (

            <div className="bg-slate-950 p-5 text-white lg:hidden">

              <nav className="space-y-2">

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/tutor-dashboard"
                  className="block rounded-xl bg-yellow-500 px-5 py-3 font-bold text-slate-900"
                >
                  Dashboard
                </Link>

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/tutor-dashboard/classes"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  My Classes
                </Link>

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/tutor-dashboard/students"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Students
                </Link>

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/tutor-dashboard/classwork"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Classwork
                </Link>

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/tutor-dashboard/homework"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Homework
                </Link>

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/tutor-dashboard/attendance"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Attendance
                </Link>

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/tutor-dashboard/performance"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Performance
                </Link>

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/tutor-dashboard/resources"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Resources
                </Link>

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/tutor-dashboard/settings"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Settings
                </Link>

                <Link
                  href="/"
                  className="block rounded-xl px-5 py-3 text-red-300 hover:bg-red-600 hover:text-white"
                >
                  Logout
                </Link>

              </nav>

            </div>

          )}

          <div className="flex">

            {/* Desktop Sidebar */}

            <aside className="hidden w-72 bg-slate-950 p-8 text-white lg:block">

              <div className="mb-10 border-b border-slate-800 pb-8">

                <h2 className="text-3xl font-extrabold text-yellow-500">
                  GS Academy
                </h2>

                <p className="mt-3 text-base font-bold tracking-[0.25em]">
                  TUTOR PORTAL
                </p>

              </div>

              <nav className="space-y-2">

                <Link
                  href="/tutor-dashboard"
                  className="block rounded-xl bg-yellow-500 px-5 py-4 font-semibold text-slate-900"
                >
                  Dashboard
                </Link>

                <Link
                  href="/tutor-dashboard/classes"
                  className="block rounded-xl px-5 py-4 hover:bg-slate-800"
                >


                <Link
                  href="/tutor-dashboard/students"
                  className="block rounded-xl px-5 py-4 hover:bg-slate-800"
                >
                  Students
                </Link>

                <Link
                  href="/tutor-dashboard/classwork"
                  className="block rounded-xl px-5 py-4 hover:bg-slate-800"
                >
                  Classwork
                </Link>

                <Link
                  href="/tutor-dashboard/homework"
                  className="block rounded-xl px-5 py-4 hover:bg-slate-800"
                >
                  Homework
                </Link>

                <Link
                  href="/tutor-dashboard/attendance"
                  className="block rounded-xl px-5 py-4 hover:bg-slate-800"
                >
                  Attendance
                </Link>

                <Link
                  href="/tutor-dashboard/performance"
                  className="block rounded-xl px-5 py-4 hover:bg-slate-800"
                >
                  Performance
                </Link>

                <Link
                  href="/tutor-dashboard/resources"
                  className="block rounded-xl px-5 py-4 hover:bg-slate-800"
                >
                  Resources
                </Link>

                <Link
                  href="/tutor-dashboard/settings"
                  className="block rounded-xl px-5 py-4 hover:bg-slate-800"
                >
                  Settings
                </Link>

              </nav>

            </aside>

            {/* Main Content */}

            <section className="min-h-screen flex-1 bg-white p-5 sm:p-8">
              {children}
            </section>

          </div>

        </div>

      </main>

      <Footer />

    </>
  );
}