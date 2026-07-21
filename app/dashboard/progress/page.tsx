export default function ProgressPage() {
  return (
    <>

      <h1 className="text-4xl font-extrabold text-slate-900">
        Academic Progress
      </h1>

      <p className="mt-3 text-slate-600">
        Monitor your academic performance and tutor feedback.
      </p>


      <div className="mt-10 grid gap-8 lg:grid-cols-3">


        {/* Mathematics */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Mathematics
          </h2>

          <p className="mt-6 text-5xl font-extrabold text-green-600">
            92%
          </p>

          <p className="mt-3 text-slate-600">
            Excellent Progress
          </p>

        </div>



        {/* Science */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Science
          </h2>

          <p className="mt-6 text-5xl font-extrabold text-yellow-500">
            84%
          </p>

          <p className="mt-3 text-slate-600">
            Very Good
          </p>

        </div>



        {/* Attendance */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Attendance
          </h2>

          <p className="mt-6 text-5xl font-extrabold text-blue-600">
            100%
          </p>

          <p className="mt-3 text-slate-600">
            Outstanding
          </p>

        </div>


      </div>



      {/* Tutor Feedback */}

      <div className="mt-10 rounded-3xl bg-white p-10 shadow-sm">

        <h2 className="text-3xl font-bold text-slate-900">
          Tutor Feedback
        </h2>


        <p className="mt-6 leading-8 text-slate-600">
          Your tutor feedback, assessment results and academic
          recommendations will appear here after your lessons and
          assessments.
        </p>


      </div>



      {/* Assessment History */}

      <div className="mt-10 rounded-3xl bg-white p-10 shadow-sm">

        <h2 className="text-3xl font-bold text-slate-900">
          Assessment History
        </h2>


        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">

          <table className="w-full">

            <thead className="bg-slate-900 text-white">

              <tr>

                <th className="px-6 py-4 text-left">
                  Assessment
                </th>

                <th className="px-6 py-4 text-left">
                  Subject
                </th>

                <th className="px-6 py-4 text-left">
                  Score
                </th>

                <th className="px-6 py-4 text-left">
                  Date
                </th>

              </tr>

            </thead>


            <tbody>

              <tr className="border-b">

                <td className="px-6 py-4">
                  No assessment yet
                </td>

                <td className="px-6 py-4">
                  -
                </td>

                <td className="px-6 py-4">
                  -
                </td>

                <td className="px-6 py-4">
                  -
                </td>

              </tr>


            </tbody>


          </table>


        </div>


      </div>


    </>
  );
}