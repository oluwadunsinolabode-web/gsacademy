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
    {/* Call To Action */}

<section className="bg-slate-900 py-24 text-center text-white">

  <div className="mx-auto max-w-4xl px-8">

    <h2 className="text-4xl font-extrabold md:text-5xl">
      Ready to Help Your Child Succeed?
    </h2>

    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
      Give your child the confidence to excel through personalised online
      tutoring in Mathematics, Science and other core academic subjects.
      Start with a completely FREE one-week trial.
    </p>

    <div className="mt-12">

      <Link
        href="/book"
        className="inline-block rounded-xl bg-yellow-500 px-10 py-4 text-lg font-bold text-slate-900 transition hover:bg-yellow-400"
      >
        Book Your FREE Week
      </Link>

    </div>

  </div>

</section>
</main>

<Footer />

</>
);
}