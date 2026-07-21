import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-100 py-10">
        <div className="mx-auto flex max-w-7xl overflow-hidden rounded-3xl shadow-lg">

          {/* Sidebar */}

          <aside className="hidden w-72 bg-slate-950 p-8 text-white lg:block">

            <div className="mb-10 border-b border-slate-800 pb-8">

              <h2 className="text-3xl font-extrabold tracking-wide text-yellow-500">
                GS Academy
              </h2>

              <p className="mt-3 text-base font-bold tracking-[0.25em] text-white">
                STUDENT PORTAL
              </p>

            </div>

            <nav className="space-y-2">

              <Link
                href="/dashboard"
                className="block rounded-xl bg-yellow-500 px-5 py-4 font-semibold text-slate-900 transition hover:bg-yellow-400"
              >
                Dashboard
              </Link>

              <Link
                href="/dashboard/classes"
                className="block rounded-xl px-5 py-4 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                My Classes
              </Link>

              <Link
                href="/dashboard/homework"
                className="block rounded-xl px-5 py-4 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Homework
              </Link>

              <Link
                href="/dashboard/resources"
                className="block rounded-xl px-5 py-4 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Learning Resources
              </Link>

              <Link
                href="/dashboard/timetable"
                className="block rounded-xl px-5 py-4 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Timetable
              </Link>

              <Link
                href="/dashboard/progress"
                className="block rounded-xl px-5 py-4 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Progress Report
              </Link>

              <Link
                href="/dashboard/payments"
                className="block rounded-xl px-5 py-4 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Payments
              </Link>

              <Link
                href="/dashboard/settings"
                className="block rounded-xl px-5 py-4 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Settings
              </Link>

              <div className="pt-8">

                <Link
                  href="/login"
                  className="block rounded-xl px-5 py-4 text-red-300 transition hover:bg-red-600 hover:text-white"
                >
                  Logout
                </Link>

              </div>

            </nav>

          </aside>

          {/* Page Content */}

          <section className="flex-1 bg-slate-50 p-8">
            {children}
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}