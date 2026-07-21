export default function HomeworkPage() {
  return (
    <>
      <h1 className="text-4xl font-extrabold text-slate-900">
        Homework
      </h1>

      <p className="mt-3 text-slate-600">
        Complete your assignments before the due date.
      </p>

      <div className="mt-10 space-y-8">

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex flex-col justify-between gap-6 md:flex-row">

            <div>

              <p className="font-semibold text-yellow-600">
                No homework available
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                You're all caught up!
              </h2>

              <p className="mt-4 text-slate-600">
                New homework assigned by your tutor will appear here automatically.
              </p>

            </div>

          </div>

        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Submission Status
          </h2>

          <p className="mt-6 text-slate-500">
            Your homework submissions will appear here once assignments have been published.
          </p>

        </div>

      </div>
    </>
  );
}