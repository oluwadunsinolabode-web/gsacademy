 "use client";
 import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/Footer";
export default function Home() {
  const [showWhy, setShowWhy] = useState(false);
 return (
  <>
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-white">
<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 px-8 py-10 md:flex-row">

         {/* LEFT */}
<div className="flex-1">

  <h1 className="max-w-2xl text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl">
    Unlock Your Child's
    <br />
    Academic Potential
  </h1>

  <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600">
    Expert one-to-one Mathematics, Science and other academic
    subjects delivered online by experienced tutors.
  </p>

  {/* Highlights */}
  <div className="mt-10 space-y-5">

  <div className="flex items-center gap-4">
    <div className="h-6 w-1 rounded-full bg-yellow-500"></div>
    <span className="text-lg font-medium text-slate-700">
      Start with a <span className="font-bold text-slate-900">FREE Week</span>
    </span>
  </div>

  <div className="flex items-center gap-4">
    <div className="h-6 w-1 rounded-full bg-yellow-500"></div>
    <span className="text-lg font-medium text-slate-700">
      Expert Mathematics, Science & More
    </span>
  </div>

  <div className="flex items-center gap-4">
    <div className="h-6 w-1 rounded-full bg-yellow-500"></div>
    <span className="text-lg font-medium text-slate-700">
      Monthly Mock Assessments
    </span>
  </div>

  <div className="flex items-center gap-4">
    <div className="h-6 w-1 rounded-full bg-yellow-500"></div>
    <span className="text-lg font-medium text-slate-700">
      Progress Reports for Parents
    </span>
  </div>

</div>

  {/* Buttons */}
 <div className="mt-12 flex flex-wrap gap-5">

  <Link
    href="/book"
    className="rounded-xl bg-slate-900 px-8 py-4 font-semibold text-white transition hover:bg-slate-800"
  >
    Book Now
  </Link>

  <Link
    href="/subjects"
    className="rounded-xl border border-slate-300 px-8 py-4 font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
  >
    Explore Subjects
  </Link>

</div>

  <p className="mt-5 text-sm text-slate-500">
    *Continue on a flexible monthly tuition plan after enrolment.
  </p>

</div>

          {/* RIGHT */}
          <div className="flex flex-1 items-start justify-center md:-mt-16">

           <Image
  src="/images/greatsam-hero.png"
  alt="Great Sam - Founder of GS Academy"
  width={700}
  height={850}
  priority
  className="rounded-3xl object-cover shadow-2xl"
/>

          </div>

        </div>
      </section>
      {/* Trust Strip */}
      <section className="border-y bg-slate-50 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-10 px-6 text-sm font-semibold tracking-wide text-slate-700">
          <span>✓ WAEC</span>
          <span>✓ NECO</span>
          <span>✓ GCSE</span>
          <span>✓ IGCSE</span>
          <span>✓ Cambridge</span>
          <span>✓ Online Worldwide</span>
        </div>
      </section>
{/* Why GS Academy */}

<section className="bg-slate-50 py-24">

  <div className="mx-auto max-w-7xl px-8">

    <div className="mx-auto max-w-3xl text-center">

      <h2 className="text-4xl font-extrabold text-slate-900 md:text-5xl">
  Why Choose GS Academy?
</h2>

<p className="mt-6 text-lg leading-8 text-slate-600">
  A complete learning experience designed to help every student succeed.
</p>
      <button
        onClick={() => setShowWhy(!showWhy)}
        className="mt-10 rounded-full border border-slate-300 px-8 py-4 font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
      >
        {showWhy ? "Hide Details ↑" : "Learn Why ↓"}
      </button>

    </div>

    {showWhy && (

  <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

    {/* Card 1 */}
    <div className="rounded-3xl bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="mb-6 h-1 w-16 rounded-full bg-yellow-500"></div>

      <h3 className="text-2xl font-bold text-slate-900">
        Personal Learning Plans
      </h3>

      <p className="mt-5 leading-8 text-slate-600">
        Every student follows a structured learning plan tailored to
        their strengths, weaknesses and academic goals.
      </p>

    </div>

    {/* Card 2 */}
    <div className="rounded-3xl bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="mb-6 h-1 w-16 rounded-full bg-yellow-500"></div>

      <h3 className="text-2xl font-bold text-slate-900">
        One-to-One Live Lessons
      </h3>

      <p className="mt-5 leading-8 text-slate-600">
        Individual online lessons ensure every student receives the
        attention, guidance and support they deserve.
      </p>

    </div>

    {/* Card 3 */}
    <div className="rounded-3xl bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="mb-6 h-1 w-16 rounded-full bg-yellow-500"></div>

      <h3 className="text-2xl font-bold text-slate-900">
        Monthly Mock Assessments
      </h3>

      <p className="mt-5 leading-8 text-slate-600">
        Students complete monthly assessments to monitor progress,
        identify improvement areas and prepare for examinations.
      </p>

    </div>

    {/* Card 4 */}
    <div className="rounded-3xl bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="mb-6 h-1 w-16 rounded-full bg-yellow-500"></div>

      <h3 className="text-2xl font-bold text-slate-900">
        Parent Progress Reports
      </h3>

      <p className="mt-5 leading-8 text-slate-600">
        Regular progress updates keep parents informed about attendance,
        performance and overall academic development.
      </p>

    </div>

    {/* Card 5 */}
    <div className="rounded-3xl bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="mb-6 h-1 w-16 rounded-full bg-yellow-500"></div>

      <h3 className="text-2xl font-bold text-slate-900">
        Student Learning Portal
      </h3>

      <p className="mt-5 leading-8 text-slate-600">
        Enrolled students receive secure access to their personal portal
        where they can join live classes, download learning materials,
        submit assignments and monitor their academic progress.
      </p>

    </div>

    {/* Card 6 */}
    <div className="rounded-3xl bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="mb-6 h-1 w-16 rounded-full bg-yellow-500"></div>

      <h3 className="text-2xl font-bold text-slate-900">
        Parent Dashboard
      </h3>

      <p className="mt-5 leading-8 text-slate-600">
        Parents can monitor attendance, view academic reports,
        receive tutor feedback and stay connected throughout their
        child's learning journey.
      </p>

    </div>

  </div>

)}

  </div>

</section>

</main>

<Footer />

</>
);
}