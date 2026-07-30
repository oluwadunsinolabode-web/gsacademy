export default function AssignTutorPage() {
  return (
    <div className="mx-auto max-w-6xl">

      <h1 className="text-4xl font-extrabold text-slate-900">
        Assign Tutors
      </h1>

      <p className="mt-3 text-slate-700">
        Assign students, subjects and packages to tutors.
      </p>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <div className="grid gap-6 md:grid-cols-2">

          <select className="rounded-xl border border-slate-300 px-5 py-4">
            <option>Select Tutor</option>
          </select>

          <select className="rounded-xl border border-slate-300 px-5 py-4">
            <option>Select Student</option>
          </select>

          <select className="rounded-xl border border-slate-300 px-5 py-4">
            <option>Select Subject</option>
          </select>

          <select className="rounded-xl border border-slate-300 px-5 py-4">
            <option>Select Package</option>
          </select>

        </div>

        <button className="mt-8 rounded-xl bg-yellow-500 px-10 py-4 font-bold text-slate-900">
          Assign Tutor
        </button>

      </div>

    </div>
  );
}