import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ResourcesPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-100">

        <div className="mx-auto max-w-7xl px-8 py-12">

          <h1 className="text-4xl font-extrabold text-slate-900">
            Learning Resources
          </h1>

          <p className="mt-3 text-slate-600">
            Access lesson notes, worksheets, videos and revision materials uploaded by your tutor.
          </p>

          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {/* Resource 1 */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="text-5xl">📄</div>

              <h2 className="mt-5 text-2xl font-bold text-slate-900">
                Algebra Notes
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Complete lesson notes covering Algebra fundamentals.
              </p>

              <button className="mt-8 w-full rounded-xl bg-yellow-500 py-3 font-bold text-slate-900 hover:bg-yellow-400 transition">
                Download PDF
              </button>

            </div>

            {/* Resource 2 */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="text-5xl">🎥</div>

              <h2 className="mt-5 text-2xl font-bold text-slate-900">
                Video Lesson
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Watch the recorded explanation of today's class.
              </p>

              <button className="mt-8 w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-800 transition">
                Watch Video
              </button>

            </div>

            {/* Resource 3 */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="text-5xl">📝</div>

              <h2 className="mt-5 text-2xl font-bold text-slate-900">
                Past Questions
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Practice with previous examination questions.
              </p>

              <button className="mt-8 w-full rounded-xl bg-yellow-500 py-3 font-bold text-slate-900 hover:bg-yellow-400 transition">
                Download
              </button>

            </div>

          </div>

        </div>

      </main>

      <Footer />

    </>
  );
}