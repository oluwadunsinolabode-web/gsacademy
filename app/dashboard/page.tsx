import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-100">

        <div className="mx-auto flex max-w-7xl">

          {/* Sidebar */}

          <aside className="hidden min-h-screen w-72 bg-slate-900 p-8 text-white lg:block">

            <h2 className="mb-10 text-3xl font-extrabold text-yellow-500">
              GS Academy
            </h2>

            <nav className="space-y-3">

              <Link
                href="/dashboard"
                className="block rounded-xl bg-yellow-500 px-5 py-4 font-semibold text-slate-900"
              >
                🏠 Dashboard
              </Link>

              <Link
                href="/dashboard/classes"
                className="block rounded-xl px-5 py-4 transition hover:bg-slate-800"
              >
                📚 My Classes
              </Link>

              <Link
                href="/dashboard/homework"
                className="block rounded-xl px-5 py-4 transition hover:bg-slate-800"
              >
                📝 Homework
              </Link>

              <Link
                href="/dashboard/resources"
                className="block rounded-xl px-5 py-4 transition hover:bg-slate-800"
              >
                📁 Resources
              </Link>

              <Link
                href="/dashboard/timetable"
                className="block rounded-xl px-5 py-4 transition hover:bg-slate-800"
              >
                📅 Timetable
              </Link>

              <Link
                href="/dashboard/progress"
                className="block rounded-xl px-5 py-4 transition hover:bg-slate-800"
              >
                📊 Progress
              </Link>

              <Link
                href="/dashboard/payments"
                className="block rounded-xl px-5 py-4 transition hover:bg-slate-800"
              >
                💳 Payments
              </Link>

              <Link
                href="/dashboard/settings"
                className="block rounded-xl px-5 py-4 transition hover:bg-slate-800"
              >
                ⚙ Settings
              </Link>

              <Link
                href="/login"
                className="block rounded-xl px-5 py-4 text-red-300 transition hover:bg-red-600 hover:text-white"
              >
                🚪 Logout
              </Link>

            </nav>

          </aside>

          {/* Main Content */}

          <section className="flex-1 p-8">

            <h1 className="text-4xl font-extrabold text-slate-900">
              Welcome back 👋
            </h1>

            <p className="mt-3 text-slate-600">
              Here's an overview of your learning activities.
            </p>

            {/* Top Cards */}

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-3xl bg-white p-8 shadow-sm">

                <h3 className="text-lg font-semibold text-slate-500">
                  Next Lesson
                </h3>

                <p className="mt-4 text-3xl font-bold text-slate-900">
                  Mathematics
                </p>

                <p className="mt-2 text-slate-500">
                  Tomorrow • 6:00 PM
                </p>

              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">

                <h3 className="text-lg font-semibold text-slate-500">
                  Homework Due
                </h3>

                <p className="mt-4 text-3xl font-bold text-slate-900">
                  2 Tasks
                </p>

                <p className="mt-2 text-slate-500">
                  Complete before Friday
                </p>

              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">

                <h3 className="text-lg font-semibold text-slate-500">
                  Attendance
                </h3>

                <p className="mt-4 text-3xl font-bold text-green-600">
                  100%
                </p>

                <p className="mt-2 text-slate-500">
                  Excellent attendance
                </p>

              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">

                <h3 className="text-lg font-semibold text-slate-500">
                  Progress
                </h3>

                <p className="mt-4 text-3xl font-bold text-yellow-500">
                  A
                </p>

                <p className="mt-2 text-slate-500">
                  Keep it up!
                </p>

              </div>

            </div>

            {/* Bottom */}

            <div className="mt-10 grid gap-8 lg:grid-cols-2">

              <div className="rounded-3xl bg-white p-8 shadow-sm">

                <h2 className="text-2xl font-bold text-slate-900">
                  Join Your Next Lesson
                </h2>

                <p className="mt-4 leading-8 text-slate-600">
                  Your next Mathematics lesson starts tomorrow at
                  6:00 PM.
                </p>

                <button className="mt-8 rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900 transition hover:bg-yellow-400">
                  Join Class
                </button>

              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">

                <h2 className="text-2xl font-bold text-slate-900">
                  Latest Announcement
                </h2>

                <p className="mt-4 leading-8 text-slate-600">
                  Welcome to GS Academy! Your personalised learning
                  resources will appear here once your tutor uploads
                  them.
                </p>

              </div>

            </div>

          </section>

        </div>

      </main>

      <Footer />

    </>
  );
}