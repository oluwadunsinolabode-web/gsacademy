export default function ResourcesPage() {
  return (
    <>

      <h1 className="text-4xl font-extrabold text-slate-900">
        Learning Resources
      </h1>

      <p className="mt-3 text-slate-700">
        Access lesson notes, class activities, homework and assessments provided by your tutor.
      </p>


      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">


        {/* Lesson Notes */}

        <div className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

          <div className="h-1 w-16 rounded-full bg-yellow-500"></div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Lesson Notes
          </h2>

          <p className="mt-4 leading-7 text-slate-700">
            View and download notes from topics covered during your lessons.
          </p>

          <button className="mt-8 w-full rounded-xl bg-yellow-500 py-3 font-bold text-slate-900 transition hover:bg-yellow-400">
            View Notes
          </button>

        </div>



        {/* Classwork */}

        <div className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

          <div className="h-1 w-16 rounded-full bg-slate-900"></div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Classwork
          </h2>

          <p className="mt-4 leading-7 text-slate-700">
            Access questions given during lessons and submit your answers to your tutor.
          </p>

          <button className="mt-8 w-full rounded-xl bg-slate-900 py-3 font-bold text-white transition hover:bg-slate-800">
            View Classwork
          </button>

        </div>



        {/* Homework */}

        <div className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

          <div className="h-1 w-16 rounded-full bg-yellow-500"></div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Homework
          </h2>

          <p className="mt-4 leading-7 text-slate-700">
            Complete assignments provided by your tutor and submit your solutions.
          </p>

          <button className="mt-8 w-full rounded-xl bg-yellow-500 py-3 font-bold text-slate-900 transition hover:bg-yellow-400">
            View Homework
          </button>

        </div>



        {/* Monthly Mock Exam */}

        <div className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

          <div className="h-1 w-16 rounded-full bg-slate-900"></div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Monthly Mock Exam
          </h2>

          <p className="mt-4 leading-7 text-slate-700">
            Take scheduled monthly assessments and monitor your academic progress.
          </p>

          <button className="mt-8 w-full rounded-xl bg-slate-900 py-3 font-bold text-white transition hover:bg-slate-800">
            View Exams
          </button>

        </div>



        {/* My Submissions */}

        <div className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

          <div className="h-1 w-16 rounded-full bg-yellow-500"></div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            My Submissions
          </h2>

          <p className="mt-4 leading-7 text-slate-700">
            View your uploaded answers, homework submissions and tutor feedback.
          </p>

          <button className="mt-8 w-full rounded-xl bg-yellow-500 py-3 font-bold text-slate-900 transition hover:bg-yellow-400">
            View Submissions
          </button>

        </div>


      </div>


    </>
  );
}