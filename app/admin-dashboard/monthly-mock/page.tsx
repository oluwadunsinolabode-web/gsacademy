export default function MonthlyMockPage() {
  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-extrabold text-slate-900">
            Monthly Mock CBT
          </h1>

          <p className="mt-3 text-slate-600">
            Create monthly mock examinations for all students.
          </p>

        </div>

        <button
          className="
          rounded-xl
          bg-yellow-500
          px-6
          py-3
          font-bold
          text-slate-900
          hover:bg-yellow-400
          "
        >
          + New Mock Exam
        </button>

      </div>

      <div className="rounded-3xl bg-white p-10 shadow-sm">

        <p className="text-slate-500">
          No monthly mock examination has been published.
        </p>

      </div>

    </div>
  );
}