export default function TimetablePage() {
  return (
    <div className="mx-auto max-w-7xl">

      <h1 className="text-4xl font-extrabold text-slate-900">
        Class Timetable
      </h1>

      <p className="mt-3 text-slate-700">
        Schedule classes for tutors and students.
      </p>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <div className="grid gap-6 md:grid-cols-2">

          <select className="rounded-xl border border-slate-300 px-5 py-4">
            <option>Select Tutor</option>
          </select>

          <select className="rounded-xl border border-slate-300 px-5 py-4">
            <option>Select Student / Group</option>
          </select>

          <input
            type="date"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

          <input
            type="time"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

        </div>

        <button className="mt-8 rounded-xl bg-yellow-500 px-10 py-4 font-bold text-slate-900">
          Save Timetable
        </button>

      </div>

    </div>
  );
}