export default function TimetablePage() {
  return (
    <>

      <h1 className="text-4xl font-extrabold text-slate-900">
        My Timetable
      </h1>

      <p className="mt-3 text-slate-700">
        View your upcoming weekly lessons.
      </p>


      {/* Responsive Table */}

      <div className="mt-10 overflow-hidden rounded-3xl bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-[700px] w-full">

            <thead className="bg-slate-900 text-white">

              <tr>

                <th className="px-6 py-5 text-left text-sm sm:text-base">
                  Day
                </th>

                <th className="px-6 py-5 text-left text-sm sm:text-base">
                  Subject
                </th>

                <th className="px-6 py-5 text-left text-sm sm:text-base">
                  Tutor
                </th>

                <th className="px-6 py-5 text-left text-sm sm:text-base">
                  Time
                </th>

                <th className="px-6 py-5 text-left text-sm sm:text-base">
                  Status
                </th>

              </tr>

            </thead>



            <tbody>


              <tr className="border-b border-slate-200">


                <td className="px-6 py-5 font-medium text-slate-800">
                  Tuesday
                </td>


                <td className="px-6 py-5 font-medium text-slate-800">
                  Mathematics
                </td>


                <td className="px-6 py-5 text-slate-700">
                  Great Sam
                </td>


                <td className="px-6 py-5 text-slate-700">
                  6:00 PM
                </td>


                <td className="px-6 py-5">

                  <span className="inline-block rounded-full bg-green-100 px-4 py-2 font-semibold text-green-700">
                    Upcoming
                  </span>

                </td>


              </tr>





              <tr>


                <td className="px-6 py-5 font-medium text-slate-800">
                  Thursday
                </td>


                <td className="px-6 py-5 font-medium text-slate-800">
                  Science
                </td>


                <td className="px-6 py-5 text-slate-700">
                  Great Sam
                </td>


                <td className="px-6 py-5 text-slate-700">
                  6:00 PM
                </td>


                <td className="px-6 py-5">

                  <span className="inline-block rounded-full bg-yellow-100 px-4 py-2 font-semibold text-yellow-700">
                    Scheduled
                  </span>

                </td>


              </tr>



            </tbody>


          </table>

        </div>

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