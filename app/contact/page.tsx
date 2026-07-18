import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">

        <section className="mx-auto max-w-7xl px-8 py-20">

          <div className="mx-auto max-w-3xl text-center">

            <h1 className="text-5xl font-extrabold text-slate-900">
              Contact GS Academy
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Have questions about our lessons, subjects, or learning plans?
              We are ready to help you find the right programme for your child.
            </p>

          </div>


          <div className="mt-16 grid gap-8 md:grid-cols-3">


            {/* Email */}
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500 text-2xl">
                ✉️
              </div>

              <h2 className="mt-6 text-2xl font-bold text-slate-900">
                Email Us
              </h2>

              <p className="mt-3 text-slate-600">
                gsacademyadmin@gmail.com
              </p>

            </div>


            {/* WhatsApp */}
            <a
              href="https://wa.me/2347064586878"
              target="_blank"
              className="rounded-3xl bg-white p-8 text-center shadow-sm transition hover:-translate-y-1"
            >

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500 text-2xl">
                💬
              </div>

              <h2 className="mt-6 text-2xl font-bold text-slate-900">
                WhatsApp
              </h2>

              <p className="mt-3 text-slate-600">
                +234 706 459 6878
              </p>

            </a>


            {/* Worldwide */}
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500 text-2xl">
                🌍
              </div>

              <h2 className="mt-6 text-2xl font-bold text-slate-900">
                Worldwide Learning
              </h2>

              <p className="mt-3 text-slate-600">
                Online lessons available for students worldwide.
              </p>

            </div>


          </div>


          <section className="mt-20 rounded-3xl bg-slate-900 px-8 py-14 text-center text-white">

            <h2 className="text-3xl font-bold md:text-4xl">
              Ready to Start Your Learning Journey?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
              Book a free discovery session and let us create a personalised
              learning plan for your academic goals.
            </p>


            <Link
              href="/book"
              className="mt-8 inline-block rounded-xl bg-yellow-500 px-10 py-4 font-bold text-slate-900 transition hover:bg-yellow-400"
            >
              Book a Discovery Session
            </Link>


          </section>


        </section>

      </main>
    </>
  );
}