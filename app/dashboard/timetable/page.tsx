export default function TimetablePage() {
  const timetable = [
    {
      day: "Tuesday",
      subject: "Mathematics",
      tutor: "Great Sam",
      time: "6:00 PM",
      status: "Upcoming",
      color: "bg-green-100 text-green-700",
    },
    {
      day: "Thursday",
      subject: "Science",
      tutor: "Great Sam",
      time: "6:00 PM",
      status: "Scheduled",
      color: "bg-yellow-100 text-yellow-700",
    },
  ];

  return (
    <>
      <h1 className="text-4xl font-extrabold text-slate-900">
        My Timetable
      </h1>

      <p className="mt-3 text-slate-700">
        View your upcoming weekly lessons.
      </p>

      {/* ================= MOBILE CARDS ================= */}

      <div className="mt-10 space-y-5 lg:hidden">
        {timetable.map((lesson) => (
          <div
            key={lesson.day}
            className="rounded-3xl bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {lesson.subject}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${lesson.color}`}
              >
                {lesson.status}
              </span>
            </div>

            <div className="mt-5 space-y-3 text-slate-700">

              <div className="flex justify-between">
                <span className="font-semibold">Day</span>
                <span>{lesson.day}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold">Tutor</span>
                <span>{lesson.tutor}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold">Time</span>
                <span>{lesson.time}</span>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP TABLE ================= */}

      <div className="mt-10 hidden overflow-hidden rounded-3xl bg-white shadow-sm lg:block">

        <table className="w-full">

          <thead className="bg-slate-900 text-white">

            <tr>

              <th className="px-6 py-5 text-left">Day</th>
              <th className="px-6 py-5 text-left">Subject</th>
              <th className="px-6 py-5 text-left">Tutor</th>
              <th className="px-6 py-5 text-left">Time</th>
              <th className="px-6 py-5 text-left">Status</th>

            </tr>

          </thead>

          <tbody>

            {timetable.map((lesson) => (

              <tr
                key={lesson.day}
                className="border-b border-slate-200"
              >

                <td className="px-6 py-5 font-medium">
                  {lesson.day}
                </td>

                <td className="px-6 py-5 font-medium">
                  {lesson.subject}
                </td>

                <td className="px-6 py-5">
                  {lesson.tutor}
                </td>

                <td className="px-6 py-5">
                  {lesson.time}
                </td>

                <td className="px-6 py-5">

                  <span
                    className={`inline-block rounded-full px-4 py-2 font-semibold ${lesson.color}`}
                  >
                    {lesson.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Reminder */}

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <h2 className="text-2xl font-bold text-slate-900">
          Class Reminder
        </h2>

        <p className="mt-4 leading-8 text-slate-700">
          Your lesson schedule will automatically update here once your
          timetable has been confirmed by GS Academy.
        </p>

      </div>
    </>
  );
}