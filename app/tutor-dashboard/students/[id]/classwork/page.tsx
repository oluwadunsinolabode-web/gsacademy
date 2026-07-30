import Link from "next/link";
import {
  ClipboardCheck,
  Eye,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function StudentClassworkPage() {
  return (
    <div className="mx-auto max-w-7xl">

      <h1 className="text-4xl font-extrabold text-slate-900">
        Student Classwork
      </h1>

      <p className="mt-3 text-slate-600">
        Review all classwork submitted by this student.
      </p>

      <div className="mt-10 space-y-8">

        {/* Awaiting Marking */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="font-semibold text-yellow-600">
                Mathematics
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Classwork 1
              </h2>

              <p className="mt-4 text-slate-600">
                Submitted: <strong>28 July 2026</strong>
              </p>

              <div className="mt-4 flex items-center gap-2 text-orange-600 font-semibold">

                <Clock size={18} />

                Awaiting Marking

              </div>

            </div>

            <div className="flex flex-col gap-4">

              <button className="rounded-xl bg-slate-900 px-8 py-4 font-bold text-white hover:bg-slate-800">

                <Eye className="mr-2 inline" size={18} />

                View Submission

              </button>

              <Link
                href="/tutor-dashboard/students/1/classwork/1"
                className="rounded-xl bg-yellow-500 px-8 py-4 text-center font-bold text-slate-900 hover:bg-yellow-400"
              >
                Mark Classwork
              </Link>

            </div>

          </div>

        </div>





        {/* Already Marked */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="font-semibold text-yellow-600">
                Mathematics
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Classwork 2
              </h2>

              <p className="mt-4 text-slate-600">
                Submitted: <strong>21 July 2026</strong>
              </p>

              <div className="mt-4 flex items-center gap-2 text-green-600 font-semibold">

                <CheckCircle size={18} />

                Marked

              </div>

            </div>

            <div className="flex flex-col gap-4">

              <button className="rounded-xl bg-slate-900 px-8 py-4 font-bold text-white hover:bg-slate-800">

                <Eye className="mr-2 inline" size={18} />

                View Submission

              </button>

              <button className="rounded-xl bg-green-600 px-8 py-4 font-bold text-white hover:bg-green-700">
                View Result
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}