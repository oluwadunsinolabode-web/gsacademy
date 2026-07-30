export default function NewTutorPage() {
  return (
    <div className="mx-auto max-w-5xl">

      <h1 className="text-4xl font-extrabold">
        Add Tutor
      </h1>

      <p className="mt-3 text-slate-700">
        Register a tutor into GS Academy.
      </p>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <div className="grid gap-6 md:grid-cols-2">

          <input
            placeholder="Tutor Name"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

          <input
            placeholder="Tutor Email"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

          <input
            placeholder="Phone Number"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

          <input
            placeholder="Subjects"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

        </div>

        <button className="mt-8 rounded-xl bg-yellow-500 px-10 py-4 font-bold text-slate-900">
          Save Tutor
        </button>

      </div>

    </div>
  );
}