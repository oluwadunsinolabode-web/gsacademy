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
              Personalized Mathematics and Science tutoring for Primary,
              Secondary, WAEC, NECO, GCSE and IGCSE students. Helping
              learners gain confidence, improve grades and achieve
              academic excellence.
            </p>

            <div className="mt-10 flex flex-wrap gap-5">

              <button className="rounded-xl bg-slate-900 px-8 py-4 font-semibold text-white transition hover:bg-slate-800">
                Book a Discovery Session
              </button>

              <button className="rounded-xl border border-slate-300 px-8 py-4 font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white">
                Explore Subjects
              </button>

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