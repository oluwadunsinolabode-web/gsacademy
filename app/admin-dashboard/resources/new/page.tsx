export default function UploadResourcePage() {
  return (
    <div className="mx-auto max-w-5xl">

      <h1 className="text-4xl font-extrabold">
        Upload Resource
      </h1>

      <p className="mt-3 text-slate-700">
        Upload lesson notes, worksheets, corrections or formula sheets.
      </p>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <div className="grid gap-6">

          <input
            placeholder="Resource Title"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

          <select className="rounded-xl border border-slate-300 px-5 py-4">
            <option>Select Subject</option>
          </select>

          <input
            type="file"
            className="rounded-xl border border-slate-300 p-5"
          />

          <button className="rounded-xl bg-yellow-500 py-4 font-bold text-slate-900">
            Upload Resource
          </button>

        </div>

      </div>

    </div>
  );
}