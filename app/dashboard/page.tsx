import {
  CalendarDays,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Bell,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <>

      <h1 className="text-4xl font-extrabold text-slate-900">
        Welcome
      </h1>

      <p className="mt-3 text-slate-700">
        Here is an overview of your learning activities.
      </p>



      {/* Summary Cards */}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">


        {/* Lesson */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <CalendarDays className="text-yellow-600" size={32}/>

          <p className="mt-5 font-bold text-slate-700">
            Next Lesson
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            No upcoming lesson
          </h3>

          <p className="mt-3 text-slate-700">
            Your next class will appear here.
          </p>

        </div>




        {/* Homework */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <BookOpen className="text-yellow-600" size={32}/>

          <p className="mt-5 font-bold text-slate-700">
            Homework Due
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            No homework
          </h3>

          <p className="mt-3 text-slate-700">
            Homework will appear here.
          </p>

        </div>




        {/* Attendance */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <ClipboardCheck className="text-yellow-600" size={32}/>

          <p className="mt-5 font-bold text-slate-700">
            Attendance
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            No records yet
          </h3>

          <p className="mt-3 text-slate-700">
            Attendance will appear after your first lesson.
          </p>

        </div>




        {/* Progress */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <TrendingUp className="text-yellow-600" size={32}/>

          <p className="mt-5 font-bold text-slate-700">
            Academic Progress
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            No assessments yet
          </h3>

          <p className="mt-3 text-slate-700">
            Progress will appear after assessments.
          </p>

        </div>


      </div>





      {/* Lower Section */}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">



        <div className="rounded-3xl bg-white p-6 shadow-sm">


          <div className="flex items-center gap-3">

            <CalendarDays
              size={30}
              className="text-yellow-600"
            />

            <h2 className="text-2xl font-bold text-slate-900">
              Upcoming Lesson
            </h2>

          </div>



          <p className="mt-5 leading-8 text-slate-700">
            Your next live class will appear here once your timetable
            has been published.
          </p>



          <button
            className="
            mt-8 w-full rounded-xl 
            bg-yellow-500 px-8 py-4
            font-bold text-slate-900
            transition hover:bg-yellow-400
            sm:w-auto
            "
          >
            Join Class
          </button>


        </div>





        <div className="rounded-3xl bg-white p-6 shadow-sm">


          <div className="flex items-center gap-3">

            <Bell
              size={30}
              className="text-yellow-600"
            />

            <h2 className="text-2xl font-bold text-slate-900">
              Latest Updates
            </h2>

          </div>



          <p className="mt-5 leading-8 text-slate-700">
            Important announcements, class updates and reminders from
            GS Academy will appear here.
          </p>


        </div>



      </div>


    </>
  );
}