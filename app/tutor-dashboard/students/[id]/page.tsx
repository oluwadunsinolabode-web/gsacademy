import Link from "next/link";
import {
  User,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  TrendingUp,
  Upload,
} from "lucide-react";

export default function StudentWorkspace() {
  return (
    <div className="mx-auto max-w-7xl">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-4xl font-extrabold text-slate-900">
            Samuel Johnson
          </h1>

          <p className="mt-3 text-slate-600">
            Mathematics • Package 2
          </p>

        </div>

        <span className="rounded-full bg-green-100 px-5 py-3 font-semibold text-green-700">
          Active Student
        </span>

      </div>



      {/* Statistics */}

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <GraduationCap
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 text-slate-600">
            Average Score
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            --
          </h2>

        </div>



        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <ClipboardCheck
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 text-slate-600">
            Submitted Classwork
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            0
          </h2>

        </div>



        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <BookOpen
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 text-slate-600">
            Homework
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            0
          </h2>

        </div>



        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <TrendingUp
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 text-slate-600">
            Progress
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            --
          </h2>

        </div>

      </div>




      {/* Actions */}

      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

        <Link
          href="/tutor-dashboard/students/1/classwork"
          className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >

          <ClipboardCheck
            size={42}
            className="text-yellow-500"
          />

          <h2 className="mt-6 text-2xl font-bold">
            View Classwork
          </h2>

          <p className="mt-3 text-slate-600">
            Review submissions, score work and send feedback.
          </p>

        </Link>




        <Link
          href="/tutor-dashboard/students/1/homework"
          className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >

          <BookOpen
            size={42}
            className="text-yellow-500"
          />

          <h2 className="mt-6 text-2xl font-bold">
            Homework
          </h2>

          <p className="mt-3 text-slate-600">
            Assign homework and review completed work.
          </p>

        </Link>




        <Link
          href="/tutor-dashboard/students/1/resources"
          className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >

          <Upload
            size={42}
            className="text-yellow-500"
          />

          <h2 className="mt-6 text-2xl font-bold">
            Send Resources
          </h2>

          <p className="mt-3 text-slate-600">
            Upload corrections, notes and extra learning materials.
          </p>

        </Link>




        <Link
          href="/tutor-dashboard/students/1/report"
          className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >

          <FileText
            size={42}
            className="text-yellow-500"
          />

          <h2 className="mt-6 text-2xl font-bold">
            Progress Report
          </h2>

          <p className="mt-3 text-slate-600">
            View performance history and assessment records.
          </p>

        </Link>




        <Link
          href="/tutor-dashboard/students/1/profile"
          className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >

          <User
            size={42}
            className="text-yellow-500"
          />

          <h2 className="mt-6 text-2xl font-bold">
            Student Profile
          </h2>

          <p className="mt-3 text-slate-600">
            Contact information, package and enrolled subjects.
          </p>

        </Link>

      </div>

    </div>
  );
}