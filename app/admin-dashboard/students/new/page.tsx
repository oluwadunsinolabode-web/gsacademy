export default function AddStudentPage() {
  return (
    <div className="mx-auto max-w-4xl">

      <h1 className="text-4xl font-extrabold text-slate-900">
        Add Student
      </h1>

      <p className="mt-3 text-slate-700">
        Register a new student into GS Academy.
      </p>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <div className="grid gap-6 md:grid-cols-2">

          <input
            placeholder="Student Full Name"
            className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
          />

          <input
            placeholder="Email Address"
            className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
          />

          <input
            placeholder="Parent Name"
            className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
          />

          <input
            placeholder="Parent Phone Number"
            className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
          />

        </div>

        <button className="mt-8 rounded-xl bg-yellow-500 px-10 py-4 font-bold text-slate-900 hover:bg-yellow-400">
          Save Student
        </button>

      </div>

    </div>
  );
}