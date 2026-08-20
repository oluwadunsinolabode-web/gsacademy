import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Online Mathematics Tutoring | GCSE, IGCSE & WAEC | GS Academy",
  description:
    "Online Mathematics tutoring for primary and secondary students, including GCSE, IGCSE, WAEC and NECO exam preparation. Learn with experienced tutors at GS Academy.",
  keywords: [
    "online maths tutor",
    "online mathematics tutor",
    "maths tutor online",
    "IGCSE maths tutor",
    "GCSE maths tutor",
    "WAEC maths tutor",
    "NECO maths tutor",
    "online maths tutoring Nigeria",
  ],
  openGraph: {
    title: "Online Mathematics Tutoring | GS Academy",
    description:
      "Build confidence and improve Mathematics performance with GS Academy online tutoring.",
    url: "https://gsacademyhub.com/subjects/mathematics",
    siteName: "GS Academy",
    type: "website",
  },
};

export default function MathematicsPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">

        {/* HERO */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-8 py-20">

            <div className="max-w-4xl">

              <p className="font-bold uppercase tracking-wide text-yellow-600">
                GS Academy Mathematics
              </p>

              <h1 className="mt-4 text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl">
                Online Mathematics Tutoring for Students
              </h1>

              <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600">
                Help your child build confidence in Mathematics, understand
                difficult topics and prepare effectively for school and
                international examinations with GS Academy.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">

                <Link
                  href="/book"
                  className="rounded-xl bg-slate-900 px-8 py-4 font-bold text-white transition hover:bg-slate-800"
                >
                  Enroll for Mathematics
                </Link>

                <Link
                  href="/contact"
                  className="rounded-xl border border-slate-300 bg-white px-8 py-4 font-bold text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  Talk to Us
                </Link>

              </div>

            </div>

          </div>
        </section>

        {/* WHAT WE TEACH */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-8">

            <div className="max-w-3xl">

              <h2 className="text-4xl font-extrabold text-slate-900">
                Mathematics Tutoring for Different Levels
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Our Mathematics lessons are adapted to the student's level,
                curriculum and examination goals.
              </p>

            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">
                  Primary Mathematics
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Build strong foundations in arithmetic, fractions,
                  geometry, problem solving and other essential Mathematics
                  skills.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">
                  Secondary Mathematics
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Strengthen understanding of algebra, geometry, statistics,
                  trigonometry and other secondary-school Mathematics topics.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">
                  IGCSE Mathematics
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Targeted tutoring and examination preparation for students
                  following the IGCSE Mathematics curriculum.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">
                  GCSE Mathematics
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Support with GCSE Mathematics topics, revision,
                  examination technique and problem solving.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">
                  WAEC Mathematics
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Examination-focused Mathematics preparation covering
                  important WAEC topics, past-question practice and revision.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">
                  NECO Mathematics
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Structured revision and practice designed to help students
                  prepare confidently for NECO Mathematics examinations.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* WHY GS ACADEMY */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-8">

            <div className="max-w-3xl">

              <h2 className="text-4xl font-extrabold text-slate-900">
                More Than Just Mathematics Lessons
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                GS Academy combines live tutoring with regular assessment and
                progress monitoring to give students a structured learning
                experience.
              </p>

            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">

              <div className="rounded-3xl bg-slate-50 p-8">
                <h3 className="text-xl font-bold text-slate-900">
                  Live Online Lessons
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Students learn directly with their tutors through live
                  online lessons.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-8">
                <h3 className="text-xl font-bold text-slate-900">
                  Monthly Mock Assessments
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Regular assessments help students practise what they have
                  learned and identify areas that need improvement.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-8">
                <h3 className="text-xl font-bold text-slate-900">
                  Parent Progress Reports
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Parents can monitor academic progress and receive feedback
                  about their child's learning.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-8">

            <div className="rounded-3xl bg-slate-900 p-10 text-center text-white md:p-14">

              <h2 className="text-4xl font-extrabold">
                Ready to Improve in Mathematics?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Give your child structured Mathematics support from GS
                Academy and help them develop the confidence to succeed.
              </p>

              <Link
                href="/book"
                className="mt-8 inline-block rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900 transition hover:bg-yellow-400"
              >
                Enroll Now
              </Link>

            </div>

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}