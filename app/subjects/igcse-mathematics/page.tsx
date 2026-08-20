import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Online IGCSE Mathematics Tutor | GS Academy",
  description:
    "Online IGCSE Mathematics tutoring for students preparing for IGCSE exams. Get live lessons, topic support, exam practice and monthly mock assessments with GS Academy.",
  keywords: [
    "IGCSE Mathematics tutor",
    "IGCSE maths tutor",
    "IGCSE maths tutor online",
    "online IGCSE Mathematics tutor",
    "IGCSE Mathematics tutoring",
    "IGCSE maths online tutoring",
    "IGCSE Mathematics exam preparation",
    "IGCSE maths lessons",
  ],
  openGraph: {
    title: "Online IGCSE Mathematics Tutor | GS Academy",
    description:
      "Build confidence and prepare for IGCSE Mathematics with structured online tutoring, exam practice and monthly assessments.",
    url: "https://gsacademyhub.com/subjects/igcse-mathematics",
    siteName: "GS Academy",
    type: "website",
  },
};

export default function IGCSEMathematicsPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">

        {/* HERO */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-8 py-20">

            <div className="max-w-4xl">

              <p className="font-bold uppercase tracking-wide text-yellow-600">
                GS Academy IGCSE Mathematics
              </p>

              <h1 className="mt-4 text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl">
                Online IGCSE Mathematics Tutor for Students
              </h1>

              <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600">
                Structured online IGCSE Mathematics tutoring designed to help
                students understand difficult topics, practise exam-style
                questions and build confidence before their examinations.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">

                <Link
                  href="/book"
                  className="rounded-xl bg-slate-900 px-8 py-4 font-bold text-white transition hover:bg-slate-800"
                >
                  Enroll for IGCSE Mathematics
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

        {/* WHO THIS IS FOR */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-8">

            <div className="max-w-3xl">

              <h2 className="text-4xl font-extrabold text-slate-900">
                IGCSE Mathematics Support
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Our online IGCSE Mathematics lessons can support students at
                different stages of their preparation, whether they are
                learning new topics, revising for examinations or working to
                improve their performance.
              </p>

            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">
                  Topic Understanding
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Get help understanding challenging IGCSE Mathematics topics
                  instead of simply memorising procedures.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">
                  Exam Practice
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Practise applying Mathematics knowledge to structured and
                  exam-style questions.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">
                  Revision Support
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Review important topics systematically and identify areas
                  that require more attention.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">
                  Problem Solving
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Develop the ability to interpret questions, select suitable
                  methods and present solutions clearly.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">
                  Exam Preparation
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Prepare with structured lessons, revision and regular
                  assessment as the examination approaches.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">
                  Confidence Building
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Build confidence through guided practice and feedback on
                  areas where the student needs improvement.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* TOPIC AREAS */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-8">

            <div className="max-w-3xl">

              <h2 className="text-4xl font-extrabold text-slate-900">
                IGCSE Mathematics Topics
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Students can receive support across the Mathematics topics
                required by their IGCSE programme and examination preparation.
              </p>

            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-3xl bg-slate-50 p-7">
                <h3 className="text-xl font-bold text-slate-900">
                  Number
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Fractions, percentages, ratio, proportion, indices and
                  standard form.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-7">
                <h3 className="text-xl font-bold text-slate-900">
                  Algebra
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Equations, inequalities, sequences, graphs and algebraic
                  manipulation.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-7">
                <h3 className="text-xl font-bold text-slate-900">
                  Geometry
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Angles, shapes, transformations, similarity and geometric
                  problem solving.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-7">
                <h3 className="text-xl font-bold text-slate-900">
                  Trigonometry
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Right-angled triangles, trigonometric ratios and
                  problem-solving applications.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-7">
                <h3 className="text-xl font-bold text-slate-900">
                  Statistics
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Data representation, averages, probability and statistical
                  problem solving.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-7">
                <h3 className="text-xl font-bold text-slate-900">
                  Mensuration
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Perimeter, area, volume, circles and measurement problems.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-7">
                <h3 className="text-xl font-bold text-slate-900">
                  Graphs
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Coordinates, linear graphs, quadratic graphs and interpreting
                  mathematical relationships.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-7">
                <h3 className="text-xl font-bold text-slate-900">
                  Probability
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Probability concepts, representations and examination
                  questions.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* GS ACADEMY SYSTEM */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-8">

            <div className="max-w-3xl">

              <h2 className="text-4xl font-extrabold text-slate-900">
                A Structured Approach to IGCSE Preparation
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                GS Academy combines live tutoring with regular practice and
                assessment so students can see where they are improving and
                where they need more support.
              </p>

            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">
                  Live Online Lessons
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Students work directly with their tutor during live online
                  lessons.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">
                  Monthly Mock Assessments
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Regular mock assessments help students practise under
                  assessment conditions and identify topics that need
                  improvement.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">
                  Progress Monitoring
                </h3>

                <p className="mt-4 leading-8 text-slate-600">
                  Students and parents can monitor academic performance and
                  receive feedback as learning progresses.
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
                Looking for an IGCSE Mathematics Tutor?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Give your child structured online Mathematics support with GS
                Academy.
              </p>

              <Link
                href="/book"
                className="mt-8 inline-block rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900 transition hover:bg-yellow-400"
              >
                Enroll for IGCSE Mathematics
              </Link>

            </div>

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}