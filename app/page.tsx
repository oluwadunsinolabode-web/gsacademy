 "use client";
 import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
export default function Home() {
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
    Mathematics, Science and other academic
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
      Mathematics, Science & More
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
      {/* How It Works */}

<section className="bg-slate-50 py-24">
  <div className="mx-auto max-w-7xl px-8">

    <div className="text-center">
      <h2 className="text-4xl font-extrabold text-slate-900 md:text-5xl">
        How It Works
      </h2>

      <p className="mt-5 text-lg text-slate-600">
        Getting started is simple.
      </p>
    </div>

    <div className="mt-16 grid gap-8 md:grid-cols-3">

      {/* Step 1 */}
      <div className="rounded-3xl bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500 text-2xl font-bold text-slate-900">
          1
        </div>

        <h3 className="text-2xl font-bold text-slate-900">
          Book Your Free Week
        </h3>

        <p className="mt-4 leading-8 text-slate-600">
          Start with a FREE one-week trial and discover how GS Academy can support your child's success.
        </p>

      </div>

      {/* Step 2 */}
      <div className="rounded-3xl bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500 text-2xl font-bold text-slate-900">
          2
        </div>

        <h3 className="text-2xl font-bold text-slate-900">
          Attend Live Lessons
        </h3>

        <p className="mt-4 leading-8 text-slate-600">
          Join engaging live online lessons designed around your child's learning needs and academic goals.
        </p>

      </div>

      {/* Step 3 */}
      <div className="rounded-3xl bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500 text-2xl font-bold text-slate-900">
          3
        </div>

        <h3 className="text-2xl font-bold text-slate-900">
          Track Progress
        </h3>

        <p className="mt-4 leading-8 text-slate-600">
          Follow your child's progress with regular assessments and performance reports throughout their learning journey.
        </p>

      </div>

    </div>

  </div>
</section>
    </main>

<Footer />

</>
);
}