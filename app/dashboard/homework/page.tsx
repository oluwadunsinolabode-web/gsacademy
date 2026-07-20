import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomeworkPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-100">

        <div className="mx-auto max-w-7xl px-8 py-12">

          <h1 className="text-4xl font-extrabold text-slate-900">
            Homework
          </h1>

          <p className="mt-3 text-slate-600">
            Complete your assignments before the due date.
          </p>

          <div className="mt-10 space-y-8">

            {/* Homework Card */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="flex flex-col justify-between gap-6 md:flex-row">

                <div>

                  <p className="font-semibold text-yellow-600">
                    Mathematics
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    Algebra Worksheet
                  </h2>

                  <p className="mt-4 text-slate-600">
                    Solve Questions 1–20.
                  </p>

                  <p className="mt-2 text-slate-500">
                    Due Date: Friday, 31 July
                  </p>

                </div>

                <div className="flex items-center">

                  <button className="rounded-xl bg-slate-900 px-8 py-4 font-bold text-white transition hover:bg-slate-800">
                    Download
                  </button>

                </div>

              </div>

            </div>

            {/* Homework Status */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-slate-900">
                Submission Status
              </h2>

              <div className="mt-6 flex items-center justify-between">

                <span className="font-medium text-slate-700">
                  Algebra Worksheet
                </span>

                <span className="rounded-full bg-red-100 px-5 py-2 font-semibold text-red-600">
                  Not Submitted
                </span>

              </div>

            </div>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}