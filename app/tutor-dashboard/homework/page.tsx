export default function TutorHomeworkPage() {
  return (
    <div className="mx-auto max-w-7xl">

      <h1 className="text-4xl font-extrabold text-slate-900">
        Homework
      </h1>

      <p className="mt-3 text-slate-600">
        Create and publish homework for your assigned students.
      </p>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <h2 className="text-2xl font-bold text-slate-900">
          Homework Management
        </h2>

        <p className="mt-6 text-slate-600">
          This page will allow you to:
        </p>

        <ul className="mt-6 list-disc space-y-3 pl-6 text-slate-700">
          <li>Create homework</li>
          <li>Set submission deadlines</li>
          <li>Publish homework to assigned students</li>
          <li>Track homework submissions</li>
          <li>Review submission status</li>
        </ul>

      </div>

    </div>
  );
}