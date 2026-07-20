import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClassesPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-100">

        <div className="mx-auto max-w-7xl px-8 py-12">

          <h1 className="text-4xl font-extrabold text-slate-900">
            My Classes
          </h1>

          <p className="mt-3 text-slate-600">
            Your upcoming and previous lessons.
          </p>

          <div className="mt-10 space-y-8">

            {/* Class Card */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="flex flex-col justify-between gap-6 md:flex-row">

                <div>

                  <p className="text-yellow-600 font-semibold">
                    Upcoming Lesson
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    Mathematics
                  </h2>

                  <p className="mt-4 text-slate-600">
                    Tutor: Great Sam
                  </p>

                  <p className="text-slate-600">
                    Date: Tuesday, 28 July
                  </p>

                  <p className="text-slate-600">
                    Time: 6:00 PM
                  </p>

                  <p className="text-slate-600">
                    Duration: 1 Hour
                  </p>

                </div>

                <div className="flex items-center">

                  <button className="rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900 transition hover:bg-yellow-400">
                    Join Class
                  </button>

                </div>

              </div>

            </div>

            {/* Previous Lesson */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <p className="text-slate-500 font-semibold">
                Previous Lesson
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                English Language
              </h2>

              <p className="mt-4 text-slate-600">
                Completed Successfully
              </p>

            </div>

          </div>

        </div>

      </main>

      <Footer />

    </>
  );
}