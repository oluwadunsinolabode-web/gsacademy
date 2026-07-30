import Link from "next/link";
import {
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
  User,
  ArrowLeft,
} from "lucide-react";

export default function StudentProfilePage() {
  return (
    <div className="mx-auto max-w-7xl">

      <Link
        href="/admin-dashboard/students"
        className="inline-flex items-center gap-2 text-yellow-600 hover:underline"
      >
        <ArrowLeft size={18} />
        Back to Students
      </Link>

      <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">

        <div className="flex flex-col gap-8 lg:flex-row">

          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-yellow-100">

            <GraduationCap
              size={55}
              className="text-yellow-600"
            />

          </div>

          <div className="flex-1">

            <h1 className="text-4xl font-extrabold text-slate-900">
              Samuel Johnson
            </h1>

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              <p className="flex items-center gap-3">
                <Mail size={18} />
                samuel@email.com
              </p>

              <p className="flex items-center gap-3">
                <Phone size={18} />
                +234xxxxxxxxxx
              </p>

              <p className="flex items-center gap-3">
                <BookOpen size={18} />
                Mathematics
              </p>

              <p className="flex items-center gap-3">
                <User size={18} />
                Package 2
              </p>

            </div>

          </div>

        </div>

      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">

        <Link
          href="/admin-dashboard/students/1/classwork"
          className="rounded-3xl bg-white p-8 shadow-sm hover:shadow-md"
        >
          <h2 className="text-xl font-bold">
            Classwork
          </h2>

          <p className="mt-3 text-slate-600">
            View submissions
          </p>

        </Link>

        <Link
          href="/admin-dashboard/students/1/homework"
          className="rounded-3xl bg-white p-8 shadow-sm hover:shadow-md"
        >
          <h2 className="text-xl font-bold">
            Homework
          </h2>

          <p className="mt-3 text-slate-600">
            View homework
          </p>

        </Link>

        <Link
          href="/admin-dashboard/students/1/progress"
          className="rounded-3xl bg-white p-8 shadow-sm hover:shadow-md"
        >
          <h2 className="text-xl font-bold">
            Progress
          </h2>

          <p className="mt-3 text-slate-600">
            Academic report
          </p>

        </Link>

      </div>

    </div>
  );
}