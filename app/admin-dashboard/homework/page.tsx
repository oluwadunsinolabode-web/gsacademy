import Link from "next/link";
import { Plus } from "lucide-react";

export default function HomeworkPage() {
  return (
    <div className="mx-auto max-w-7xl">

      <div className="flex items-end justify-between">

        <div>

          <h1 className="text-4xl font-extrabold text-slate-900">
            Homework
          </h1>

          <p className="mt-3 text-slate-700">
            Publish homework for students.
          </p>

        </div>

        <Link
          href="/admin-dashboard/homework/new"
          className="rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900 hover:bg-yellow-400"
        >
          <Plus className="inline mr-2" size={18} />
          New Homework
        </Link>

      </div>

      <div className="mt-10 rounded-3xl bg-white p-10 shadow-sm">

        <p className="text-slate-600">
          Published homework will appear here.
        </p>

      </div>

    </div>
  );
}