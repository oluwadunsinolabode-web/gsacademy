import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">

        <section className="mx-auto max-w-7xl px-8 py-20">

          <h1 className="text-5xl font-extrabold text-slate-900">
            Why Choose GS Academy?
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            More than tutoring. We provide a complete learning experience
            designed to help every student succeed.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2">

            <div className="rounded-3xl bg-white p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Personal Learning Plans
              </h2>

              <p className="mt-4 text-slate-600 leading-8">
                Every student receives a learning plan tailored to their
                strengths, weaknesses and academic goals.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                One-to-One Live Lessons
              </h2>

              <p className="mt-4 text-slate-600 leading-8">
                Individual online lessons that focus completely on your child.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Monthly Mock Assessments
              </h2>

              <p className="mt-4 text-slate-600 leading-8">
                Regular assessments help measure progress and prepare students
                for examinations.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Progress Reports
              </h2>

              <p className="mt-4 text-slate-600 leading-8">
                Parents receive regular reports showing improvement and areas
                that need more attention.
              </p>
            </div>

          </div>

        </section>

      </main>
    </>
  );
}