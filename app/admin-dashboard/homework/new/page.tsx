export default function NewHomeworkPage() {
  return (
    <div className="mx-auto max-w-5xl">

      <h1 className="text-4xl font-extrabold text-slate-900">
        Create Homework
      </h1>

      <p className="mt-3 text-slate-700">
        Publish homework for a class or package.
      </p>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <div className="grid gap-6">

          <input
            placeholder="Homework Title"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

          <textarea
            rows={8}
            placeholder="Homework Instructions..."
            className="rounded-xl border border-slate-300 p-5"
          />

          <button className="rounded-xl bg-yellow-500 py-4 font-bold text-slate-900">
            Publish Homework
          </button>

        </div>

      </div>

    </div>
  );
}