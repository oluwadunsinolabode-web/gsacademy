 import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function Home() {
  return (
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
  <div className="mt-10 space-y-4">

    <div className="flex items-center gap-3">
      <span className="text-xl text-green-600">✓</span>
      <span className="text-lg font-medium text-slate-700">
        Start with a <span className="font-bold text-slate-900">FREE Week*</span>
      </span>
    </div>

    <div className="flex items-center gap-3">
      <span className="text-xl text-green-600">✓</span>
      <span className="text-lg font-medium text-slate-700">
        Expert Mathematics, Science & More
      </span>
    </div>

    <div className="flex items-center gap-3">
      <span className="text-xl text-green-600">✓</span>
      <span className="text-lg font-medium text-slate-700">
        Monthly Mock Assessments
      </span>
    </div>

    <div className="flex items-center gap-3">
      <span className="text-xl text-green-600">✓</span>
      <span className="text-lg font-medium text-slate-700">
        Progress Reports for Parents
      </span>
    </div>

  </div>

  {/* Buttons */}
  <div className="mt-12 flex flex-wrap gap-5">

    <button className="rounded-xl bg-slate-900 px-8 py-4 font-semibold text-white transition hover:bg-slate-800">
      Book Now
    </button>

    <button className="rounded-xl border border-slate-300 px-8 py-4 font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white">
      Explore Subjects
    </button>

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

    </main>
  );
} 