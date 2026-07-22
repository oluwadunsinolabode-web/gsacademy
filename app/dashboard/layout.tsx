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

      <main className="min-h-screen bg-slate-100 py-6">

        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl shadow-lg">


          {/* Mobile Dashboard Header */}

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
                  href="/dashboard"
                  className="block rounded-xl bg-yellow-500 px-5 py-3 font-bold text-slate-900"
                >
                  Dashboard
                </Link>


                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/dashboard/classes"
                  className="block rounded-xl px-5 py-3 text-slate-200 hover:bg-slate-800"
                >
                  My Classes
                </Link>


                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/dashboard/classwork"
                  className="block rounded-xl px-5 py-3 text-slate-200 hover:bg-slate-800"
                >
                  Submit Classwork
                </Link>


                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/dashboard/homework"
                  className="block rounded-xl px-5 py-3 text-slate-200 hover:bg-slate-800"
                >
                  Homework
                </Link>


                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/dashboard/resources"
                  className="block rounded-xl px-5 py-3 text-slate-200 hover:bg-slate-800"
                >
                  Learning Resources
                </Link>


                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/dashboard/timetable"
                  className="block rounded-xl px-5 py-3 text-slate-200 hover:bg-slate-800"
                >
                  Timetable
                </Link>


                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/dashboard/progress"
                  className="block rounded-xl px-5 py-3 text-slate-200 hover:bg-slate-800"
                >
                  Progress Report
                </Link>


                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/dashboard/payment"
                  className="block rounded-xl px-5 py-3 text-slate-200 hover:bg-slate-800"
                >
                  Payments
                </Link>


                <Link
                  onClick={() => setMenuOpen(false)}
                  href="/dashboard/settings"
                  className="block rounded-xl px-5 py-3 text-slate-200 hover:bg-slate-800"
                >
                  Settings
                </Link>


                <Link
                  href="/login"
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
                  href="/dashboard/classes"
                  className="block rounded-xl px-5 py-4 text-slate-200 hover:bg-slate-800"
                >
                  My Classes
                </Link>


                <Link
                  href="/dashboard/classwork"
                  className="block rounded-xl px-5 py-4 text-slate-200 hover:bg-slate-800"
                >
                  Submit Classwork
                </Link>


                <Link
                  href="/dashboard/homework"
                  className="block rounded-xl px-5 py-4 text-slate-200 hover:bg-slate-800"
                >
                  Homework
                </Link>


                <Link
                  href="/dashboard/resources"
                  className="block rounded-xl px-5 py-4 text-slate-200 hover:bg-slate-800"
                >
                  Learning Resources
                </Link>


                <Link
                  href="/dashboard/timetable"
                  className="block rounded-xl px-5 py-4 text-slate-200 hover:bg-slate-800"
                >
                  Timetable
                </Link>


                <Link
                  href="/dashboard/progress"
                  className="block rounded-xl px-5 py-4 text-slate-200 hover:bg-slate-800"
                >
                  Progress Report
                </Link>


                <Link
                  href="/dashboard/payment"
                  className="block rounded-xl px-5 py-4 text-slate-200 hover:bg-slate-800"
                >
                  Payments
                </Link>


                <Link
                  href="/dashboard/settings"
                  className="block rounded-xl px-5 py-4 text-slate-200 hover:bg-slate-800"
                >
                  Settings
                </Link>


              </nav>


            </aside>




            {/* Main Content */}

            <section className="min-h-screen flex-1 bg-slate-50 p-5 sm:p-8">

              {children}

            </section>


          </div>


        </div>


      </main>


      <Footer />

    </>
  );
}