import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SubjectsPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">

        <section className="mx-auto max-w-7xl px-8 py-20">

          <div className="max-w-3xl">
            <h1 className="text-5xl font-extrabold text-slate-900">
              Subjects We Teach
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              We provide high-quality online tutoring across a wide range of
              academic subjects, helping students build confidence, improve
              performance and achieve outstanding results.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Mathematics
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                Primary Mathematics, Secondary Mathematics, GCSE, IGCSE,
                WAEC, NECO and exam preparation.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Science
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                Integrated Science, Basic Science and preparation for
                secondary school examinations.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Physics
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                Secondary school Physics, WAEC, NECO, GCSE and IGCSE.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Chemistry
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                Build strong foundations and prepare confidently for exams.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Biology
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                Interactive lessons that make Biology simple and enjoyable.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                English Language
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                Develop strong reading, writing, grammar and communication
                skills while preparing confidently for school assessments,
                WAEC, NECO, GCSE and IGCSE examinations.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Other Subjects
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                Additional subjects are available on request through our
                network of qualified tutors.
              </p>
            </div>

          </div>

          <div className="mt-20 rounded-3xl bg-slate-900 p-10 text-center text-white">

            <h2 className="text-3xl font-bold">
              Need a subject not listed?
            </h2>

            <p className="mt-4 text-lg text-slate-300">
              Contact us and we'll match your child with the right tutor.
            </p>

          </div>

        </section>

      </main>

      <Footer />

    </>
  );
}