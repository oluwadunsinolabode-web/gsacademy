import Link from "next/link";

export default function ResourcesPage() {
  return (
    <>
      <h1 className="text-4xl font-extrabold text-slate-900">
        Learning Resources
      </h1>

      <p className="mt-3 text-slate-700">
        Access lesson notes and assessments provided by your tutor.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

        {/* =====================================================
            LESSON NOTES
        ===================================================== */}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

          <div className="h-1 w-16 rounded-full bg-yellow-500"></div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Lesson Notes
          </h2>

          <p className="mt-4 leading-7 text-slate-700">
            View and download notes from topics covered during your lessons.
          </p>

          <Link
            href="/dashboard/resources/lesson-notes"
            className="mt-8 block w-full rounded-xl bg-yellow-500 py-3 text-center font-bold text-slate-900 transition hover:bg-yellow-400"
          >
            View Notes
          </Link>

        </div>

        {/* =====================================================
            MONTHLY MOCK EXAM
        ===================================================== */}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

          <div className="h-1 w-16 rounded-full bg-slate-900"></div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Monthly Mock Exam
          </h2>

          <p className="mt-4 leading-7 text-slate-700">
            Take scheduled monthly assessments and monitor your academic
            progress.
          </p>

          <Link
            href="/dashboard/resources/mock-exams"
            className="mt-8 block w-full rounded-xl bg-slate-900 py-3 text-center font-bold text-white transition hover:bg-slate-800"
          >
            View Exams
          </Link>

        </div>

      </div>
    </>
  );
}