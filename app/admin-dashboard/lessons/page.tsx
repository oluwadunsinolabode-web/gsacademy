export default function LessonsPage() {
  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-extrabold text-slate-900">
            Lesson Management
          </h1>

          <p className="mt-3 text-slate-600">
            Manage live lessons, lesson notes and meeting links.
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
          + New Lesson
        </button>

      </div>

      <div className="rounded-3xl bg-white p-10 shadow-sm">

        <p className="text-slate-500">
          No lessons have been created yet.
        </p>

      </div>

    </div>
  );
}