import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ProgressPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-100">

        <div className="mx-auto max-w-7xl px-8 py-12">

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

            {/* English */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-slate-900">
                English
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

          {/* Tutor Comment */}

          <div className="mt-10 rounded-3xl bg-white p-10 shadow-sm">

            <h2 className="text-3xl font-bold text-slate-900">
              Tutor's Comment
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              John has shown remarkable improvement in Mathematics over the
              past few weeks. His confidence has increased significantly, and
              he participates actively during lessons. Continued practice with
              homework will help him achieve even higher results.
            </p>

          </div>

        </div>

      </main>

      <Footer />

    </>
  );
}