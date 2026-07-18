import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function PricingPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">

        <section className="mx-auto max-w-7xl px-8 py-20">

          <div className="mx-auto max-w-3xl text-center">

            <h1 className="text-5xl font-extrabold text-slate-900">
              Tuition Fees
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Simple and affordble pricing.
            </p>

          </div>

          <div className="mx-auto mt-16 max-w-2xl rounded-3xl bg-white p-10 shadow-lg">

            <div className="text-center">

              <p className="text-lg font-semibold text-yellow-600">
                FREE TRIAL
              </p>

              <h2 className="mt-3 text-5xl font-extrabold text-slate-900">
                1 Week
              </h2>

              <p className="mt-5 text-lg text-slate-600">
                Experience our teaching before committing to a monthly plan.
              </p>

            </div>

            <div className="my-10 h-px bg-slate-200"></div>

            <div className="space-y-5 text-lg text-slate-700">

              <p>• Live one-to-one lessons each week</p>

              <p>• Personal learning plan</p>

              <p>• Monthly mock assessments</p>

              <p>• Parent progress reports</p>

              <p>• Flexible online schedule</p>

            </div>

            <div className="mt-12 rounded-2xl bg-slate-100 p-6">

              <h3 className="text-2xl font-bold text-slate-900">
                Monthly Tuition
              </h3>

              <p className="mt-4 text-slate-600 leading-8">
                Tuition fees depend on the student's academic level,
                country and selected subjects.
              </p>

              <p className="mt-4 font-semibold text-slate-900">
                Contact us for a personalised quotation.
              </p>

            </div>

            <div className="mt-12 text-center">

              <Link
                href="/book"
                className="inline-block rounded-xl bg-yellow-500 px-10 py-4 font-bold text-slate-900 transition hover:bg-yellow-400"
              >
                Book Your FREE Week
              </Link>

            </div>

          </div>

        </section>

      </main>
    </>
  );
}