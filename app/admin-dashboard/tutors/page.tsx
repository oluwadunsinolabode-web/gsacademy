import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function TutorsPage() {
  return (
    <div className="mx-auto max-w-7xl">

      <div className="flex items-end justify-between">

        <div>

          <h1 className="text-4xl font-extrabold">
            Tutors
          </h1>

          <p className="mt-3 text-slate-700">
            Manage all tutors.
          </p>

        </div>

        <Link
          href="/admin-dashboard/tutors/new"
          className="rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900"
        >
          <UserPlus className="mr-2 inline" />
          Add Tutor
        </Link>

      </div>

      <div className="mt-10 rounded-3xl bg-white p-10 shadow-sm">

        Tutor list will appear here.

      </div>

    </div>
  );
}
