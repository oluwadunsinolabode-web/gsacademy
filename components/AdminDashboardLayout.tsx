"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  CalendarDays,
  BookOpen,
  ClipboardCheck,
  FolderOpen,
  Bell,
  CreditCard,
  BarChart3,
  Settings,
  FileText,
} from "lucide-react";

export default function AdminDashboardLayout({
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

              <p className="text-xs tracking-[0.25em]">
                ADMIN PANEL
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
                  href="/admin-dashboard"
                  className="block rounded-xl bg-yellow-500 px-5 py-3 font-bold text-slate-900"
                >
                  Dashboard
                </Link>

                <Link
                  href="/admin-dashboard/students"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Students
                </Link>

                <Link
                  href="/admin-dashboard/bookings"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Booking Requests
                </Link>

                <Link
                  href="/admin-dashboard/tutors"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Tutors
                </Link>

                <Link
                  href="/admin-dashboard/assignments"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Assign Tutors
                </Link>

                <Link
                  href="/admin-dashboard/timetable"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Timetable
                </Link>

                <Link
                  href="/admin-dashboard/classwork"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Classwork
                </Link>

                <Link
                  href="/admin-dashboard/homework"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Homework
                </Link>

                <Link
                  href="/admin-dashboard/resources"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Resources
                </Link>

                {/* MONTHLY MOCK EXAMS */}

                <Link
                  href="/admin-dashboard/monthly-mock"
                  className="flex items-center gap-3 rounded-xl px-5 py-3 font-semibold text-yellow-400 transition hover:bg-slate-800"
                >
                  <FileText size={19} />
                  Monthly Mock Exams
                </Link>

                <Link
                  href="/admin-dashboard/announcements"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Announcements
                </Link>

                <Link
                  href="/admin-dashboard/payments"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Payments
                </Link>

                <Link
                  href="/admin-dashboard/reports"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Reports
                </Link>

                <Link
                  href="/admin-dashboard/settings"
                  className="block rounded-xl px-5 py-3 hover:bg-slate-800"
                >
                  Settings
                </Link>

              </nav>
            </div>
          )}

          <div className="flex">

            {/* Desktop Sidebar */}

            <aside className="hidden w-80 bg-slate-950 p-8 text-white lg:block">
              <div className="mb-10 border-b border-slate-800 pb-8">
                <h2 className="text-3xl font-extrabold text-yellow-500">
                  GS Academy
                </h2>

                <p className="mt-3 text-base font-bold tracking-[0.25em]">
                  ADMIN PANEL
                </p>
              </div>

              <nav className="space-y-2">

                <MenuItem
                  href="/admin-dashboard"
                  icon={<LayoutDashboard size={20} />}
                  title="Dashboard"
                />

                <MenuItem
                  href="/admin-dashboard/students"
                  icon={<GraduationCap size={20} />}
                  title="Students"
                />

                <MenuItem
                  href="/admin-dashboard/bookings"
                  icon={<ClipboardCheck size={20} />}
                  title="Booking Requests"
                />

                <MenuItem
                  href="/admin-dashboard/tutors"
                  icon={<Users size={20} />}
                  title="Tutors"
                />

                <MenuItem
                  href="/admin-dashboard/assignments"
                  icon={<UserCheck size={20} />}
                  title="Assign Tutors"
                />

                <MenuItem
                  href="/admin-dashboard/timetable"
                  icon={<CalendarDays size={20} />}
                  title="Timetable"
                />

                <MenuItem
                  href="/admin-dashboard/classwork"
                  icon={<ClipboardCheck size={20} />}
                  title="Classwork"
                />

                <MenuItem
                  href="/admin-dashboard/homework"
                  icon={<BookOpen size={20} />}
                  title="Homework"
                />

                <MenuItem
                  href="/admin-dashboard/resources"
                  icon={<FolderOpen size={20} />}
                  title="Resources"
                />

                {/* MONTHLY MOCK EXAMS */}

                <MenuItem
                  href="/admin-dashboard/monthly-mock"
                  icon={<FileText size={20} />}
                  title="Monthly Mock Exams"
                />

                <MenuItem
                  href="/admin-dashboard/announcements"
                  icon={<Bell size={20} />}
                  title="Announcements"
                />

                <MenuItem
                  href="/admin-dashboard/payments"
                  icon={<CreditCard size={20} />}
                  title="Payments"
                />

                <MenuItem
                  href="/admin-dashboard/reports"
                  icon={<BarChart3 size={20} />}
                  title="Reports"
                />

                <MenuItem
                  href="/admin-dashboard/settings"
                  icon={<Settings size={20} />}
                  title="Settings"
                />

              </nav>
            </aside>

            {/* Main */}

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

function MenuItem({
  href,
  icon,
  title,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-5 py-4 text-slate-200 transition hover:bg-slate-800"
    >
      {icon}
      {title}
    </Link>
  );
}