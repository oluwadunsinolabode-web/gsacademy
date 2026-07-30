export default function NewAnnouncementPage() {
  return (
    <div className="mx-auto max-w-5xl">

      <h1 className="text-4xl font-extrabold">
        New Announcement
      </h1>

      <p className="mt-3 text-slate-700">
        Send a notice to students or tutors.
      </p>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <div className="grid gap-6">

          <input
            placeholder="Announcement Title"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

          <textarea
            rows={8}
            placeholder="Write your announcement..."
            className="rounded-xl border border-slate-300 p-5"
          />

          <button className="rounded-xl bg-yellow-500 py-4 font-bold text-slate-900">
            Publish Announcement
          </button>

        </div>

      </div>

    </div>
  );
}