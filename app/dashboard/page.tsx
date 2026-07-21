export default function DashboardPage() {
  return (
    <>
      <h1 className="text-4xl font-extrabold text-slate-900">
        Welcome
      </h1>

      <p className="mt-3 text-slate-600">
        Here is an overview of your learning activities.
      </p>

      {/* Summary Cards */}

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="font-semibold text-slate-500">
            Next Lesson
          </p>

          <h3 className="mt-4 text-2xl font-bold text-slate-900">
            No upcoming lesson
          </h3>

          <p className="mt-2 text-slate-500">
            Your next class will appear here.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="font-semibold text-slate-500">
            Homework Due
          </p>

          <h3 className="mt-4 text-2xl font-bold text-slate-900">
            No homework
          </h3>

          <p className="mt-2 text-slate-500">
            Homework will appear here.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="font-semibold text-slate-500">
            Attendance
          </p>

          <h3 className="mt-4 text-2xl font-bold text-slate-900">
            No records yet
          </h3>

          <p className="mt-2 text-slate-500">
            Attendance will appear after your first lesson.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="font-semibold text-slate-500">
            Academic Progress
          </p>

          <h3 className="mt-4 text-2xl font-bold text-slate-900">
            No assessments yet
          </h3>

          <p className="mt-2 text-slate-500">
            Your academic progress will appear after your first assessment.
          </p>
        </div>

      </div>

      {/* Lower Section */}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Upcoming Lesson
          </h2>

          <p className="mt-4 leading-8 text-slate-600">
            Your next live class will appear here once your timetable has been published.
          </p>

          <button className="mt-8 rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900 transition hover:bg-yellow-400">
            Join Class
          </button>

        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Latest Updates
          </h2>

          <p className="mt-4 leading-8 text-slate-600">
            Important announcements, class updates and reminders from GS Academy will appear here.
          </p>

        </div>

      </div>
    </>
  );
}