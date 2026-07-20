import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">

        <section className="mx-auto max-w-7xl px-8 py-20">

          <div className="mx-auto max-w-3xl text-center">

            <h1 className="text-5xl font-extrabold text-slate-900">
              Why Choose GS Academy?
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              We provide a complete one-to-one learning experience designed to
              help every student build confidence, achieve academic excellence
              and reach their full potential.
            </p>

          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {/* Card 1 */}
            <div className="rounded-3xl bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

              <div className="mb-6 h-1 w-16 rounded-full bg-yellow-500"></div>

              <h2 className="text-2xl font-bold text-slate-900">
                Personal Learning Plans
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                Every student receives a learning plan tailored to their
                strengths, weaknesses and academic goals.
              </p>

            </div>

            {/* Card 2 */}
            <div className="rounded-3xl bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

              <div className="mb-6 h-1 w-16 rounded-full bg-yellow-500"></div>

              <h2 className="text-2xl font-bold text-slate-900">
                One-to-One Live Lessons
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                Individual online lessons that focus completely on each
                student's learning needs, helping them learn with confidence
                and achieve better results.
              </p>

            </div>

            {/* Card 3 */}
            <div className="rounded-3xl bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

              <div className="mb-6 h-1 w-16 rounded-full bg-yellow-500"></div>

              <h2 className="text-2xl font-bold text-slate-900">
                Monthly Mock Assessments
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                Regular assessments help measure progress, identify areas for
                improvement and prepare students confidently for examinations.
              </p>

            </div>

            {/* Card 4 */}
            <div className="rounded-3xl bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

              <div className="mb-6 h-1 w-16 rounded-full bg-yellow-500"></div>

              <h2 className="text-2xl font-bold text-slate-900">
                Parent Progress Reports
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                Parents receive regular progress reports with feedback on
                attendance, academic performance and areas requiring additional
                support.
              </p>

            </div>

            {/* Card 5 */}
            <div className="rounded-3xl bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

              <div className="mb-6 h-1 w-16 rounded-full bg-yellow-500"></div>

              <h2 className="text-2xl font-bold text-slate-900">
                Student Learning Portal
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                Enrolled students receive secure access to their personal
                learning portal where they can join lessons, access learning
                resources, submit homework and monitor their academic progress.
              </p>

            </div>

            {/* Card 6 */}
            <div className="rounded-3xl bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

              <div className="mb-6 h-1 w-16 rounded-full bg-yellow-500"></div>

              <h2 className="text-2xl font-bold text-slate-900">
                Parent Dashboard
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                Parents stay informed through attendance tracking, progress
                reports, payment records and direct communication with GS
                Academy tutors.
              </p>

            </div>

          </div>

        </section>

      </main>

      <Footer />

    </>
  );
}