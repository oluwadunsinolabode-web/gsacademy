"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-slate-100 lg:py-6">
        <div className="w-full overflow-hidden bg-white lg:mx-auto lg:max-w-7xl lg:rounded-3xl lg:shadow-lg">

          {/* =====================================================
              MOBILE DASHBOARD HEADER
          ===================================================== */}

          <div className="flex items-center justify-between bg-slate-950 p-5 text-white lg:hidden">

            <div>
              <h2 className="text-xl font-extrabold text-yellow-500">
                GS Academy
              </h2>

              <p className="text-xs tracking-widest text-white">
                STUDENT PORTAL
              </p>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-xl bg-slate-800 px-4 py-2 text-2xl text-white"
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>

          {/* =====================================================
              MOBILE MENU
          ===================================================== */}

          {menuOpen && (
            <div className="bg-slate-950 p-5 text-white lg:hidden">

              <nav className="space-y-2">

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/dashboard"
                  className="block rounded-xl bg-yellow-500 px-5 py-3 font-bold text-slate-900"
                >
                  Dashboard
                </Link>

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/dashboard/resources"
                  className="block rounded-xl px-5 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  Learning Resources
                </Link>

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/dashboard/timetable"
                  className="block rounded-xl px-5 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  Timetable
                </Link>

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/dashboard/progress"
                  className="block rounded-xl px-5 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  Progress Report
                </Link>

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/dashboard/payment"
                  className="block rounded-xl px-5 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  Payments
                </Link>

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/dashboard/settings"
                  className="block rounded-xl px-5 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  Settings
                </Link>

                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/login"
                  className="block rounded-xl px-5 py-3 font-semibold text-red-300 hover:bg-red-600 hover:text-white"
                >
                  Logout
                </Link>

              </nav>
            </div>
          )}

          {/* =====================================================
              DASHBOARD BODY
          ===================================================== */}

          <div className="flex">

            {/* =================================================
                DESKTOP SIDEBAR
            ================================================= */}

            <aside className="hidden w-72 shrink-0 bg-slate-950 p-8 text-white lg:block">

              <div className="mb-10 border-b border-slate-800 pb-8">

                <h2 className="text-3xl font-extrabold text-yellow-500">
                  GS Academy
                </h2>

                <p className="mt-3 text-base font-bold tracking-[0.25em] text-white">
                  STUDENT PORTAL
                </p>

              </div>

              <nav className="space-y-2">

                <Link
                  href="/dashboard"
                  className="block rounded-xl bg-yellow-500 px-5 py-4 font-semibold text-slate-900"
                >
                  Dashboard
                </Link>

                <Link
                  href="/dashboard/resources"
                  className="block rounded-xl px-5 py-4 font-semibold text-white hover:bg-slate-800"
                >
                  Learning Resources
                </Link>

                <Link
                  href="/dashboard/timetable"
                  className="block rounded-xl px-5 py-4 font-semibold text-white hover:bg-slate-800"
                >
                  Timetable
                </Link>

                <Link
                  href="/dashboard/progress"
                  className="block rounded-xl px-5 py-4 font-semibold text-white hover:bg-slate-800"
                >
                  Progress Report
                </Link>

                <Link
                  href="/dashboard/payment"
                  className="block rounded-xl px-5 py-4 font-semibold text-white hover:bg-slate-800"
                >
                  Payments
                </Link>

                <Link
                  href="/dashboard/settings"
                  className="block rounded-xl px-5 py-4 font-semibold text-white hover:bg-slate-800"
                >
                  Settings
                </Link>

              </nav>
            </aside>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <section className="min-h-screen min-w-0 flex-1 bg-white p-5 text-slate-950 sm:p-8">

              {children}

            </section>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}