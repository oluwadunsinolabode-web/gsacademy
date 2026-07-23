import Navbar from "@/components/Navbar";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function PricingPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">

        <section className="mx-auto max-w-7xl px-6 py-20">

          <div className="text-center">

            <h1 className="text-5xl font-extrabold text-slate-900">
              Choose Your Learning Plan
            </h1>

            <p className="mt-6 text-lg text-slate-600">
              Flexible coaching packages designed to suit every learner's needs and every parent's budget.
            </p>

          </div>

          {/* FREE WEEK */}

<Link
  href="/book"
  className="mx-auto mt-16 block max-w-3xl cursor-pointer rounded-3xl bg-slate-900 p-10 text-center shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-2xl"
>

  

    <p className="text-lg font-bold uppercase tracking-widest text-yellow-500">
      FREE TRIAL
    </p>

    <h2 className="mt-3 text-5xl font-extrabold text-white">
      1 Week
    </h2>

    <p className="mt-5 text-lg text-slate-300">
      Experience GS Academy completely FREE before enrolling.
    </p>

    <div className="mt-8 inline-flex items-center rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900 transition hover:bg-yellow-400">
      Book Your FREE Week →
    </div>
  
</Link>
          {/* NIGERIA */}

          <h2 className="mt-20 text-4xl font-extrabold text-slate-900">
            🇳🇬 Nigeria
          </h2>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">

            {/* Package 1 */}

            <div className="rounded-3xl bg-white p-10 shadow-lg">

              <h3 className="text-3xl font-bold text-slate-900">
                Package 1
              </h3>

              <p className="mt-2 text-yellow-600 font-semibold">
                Small Group Coaching
              </p>

              <div className="mt-8">

                <p className="text-4xl font-extrabold text-slate-900">
                  ₦7,000
                </p>

                <p className="text-slate-600">
                  per subject / month
                </p>

              </div>

              <div className="mt-6 rounded-xl bg-slate-100 p-4">

                <p className="font-semibold text-slate-900">
                  Bulk Discount
                </p>

                <p className="mt-2 text-slate-700">
                  Applies when enrolling for <strong>5 subjects or more.</strong>
                </p>

              </div>

              <div className="mt-6 rounded-xl bg-yellow-50 p-4">

                <p className="font-semibold text-slate-900">
                  Less than 5 Subjects?
                </p>

                <p className="mt-2 text-slate-700">
                  ₦10,000 per subject/month.
                </p>

              </div>

              <ul className="mt-8 space-y-3 text-slate-700">

                <li>✔ 5–7 students per class</li>
                <li>✔ Live interactive lessons</li>
                <li>✔ Homework & Classwork</li>
                <li>✔ Monthly Mock Assessment</li>
                <li>✔ Parent Progress Reports</li>
                <li>✔ Learning Resources</li>

              </ul>

            </div>

            {/* Package 2 */}

            <div className="rounded-3xl border-4 border-yellow-500 bg-white p-10 shadow-xl">

              <div className="mb-4 inline-block rounded-full bg-yellow-500 px-4 py-2 text-sm font-bold text-slate-900">
                MOST POPULAR
              </div>

              <h3 className="text-3xl font-bold text-slate-900">
                Package 2
              </h3>

              <p className="mt-2 text-yellow-600 font-semibold">
                Private Coaching
              </p>

              <div className="mt-8">

                <p className="text-4xl font-extrabold text-slate-900">
                  ₦40,000
                </p>

                <p className="text-slate-600">
                  per subject / month
                </p>

              </div>

              <ul className="mt-8 space-y-3 text-slate-700">

                <li>✔ One-on-One Coaching</li>
                <li>✔ Flexible Schedule</li>
                <li>✔ Personalised Lessons</li>
                <li>✔ Homework & Classwork</li>
                <li>✔ Monthly Mock Assessment</li>
                <li>✔ Parent Progress Reports</li>

              </ul>

            </div>

            {/* Package 3 */}

            <div className="rounded-3xl bg-white p-10 shadow-lg">

              <h3 className="text-3xl font-bold text-slate-900">
                Package 3
              </h3>

              <p className="mt-2 text-yellow-600 font-semibold">
                Premium Coaching
              </p>

              <div className="mt-8">

                <p className="text-4xl font-extrabold text-slate-900">
                  ₦50,000
                </p>

                <p className="text-slate-600">
                  per subject / month
                </p>

              </div>

              <ul className="mt-8 space-y-3 text-slate-700">

                <li>✔ One-on-One Coaching</li>
                <li>✔ Extended Lesson Duration</li>
                <li>✔ Intensive Exam Preparation</li>
                <li>✔ Priority Tutor Support</li>
                <li>✔ Personalised Academic Mentoring</li>

              </ul>

            </div>

          </div>

          {/* INTERNATIONAL */}

          <h2 className="mt-20 text-4xl font-extrabold text-slate-900">
            🌍 International Students
          </h2>

          <div className="mt-10 rounded-3xl bg-white p-10 shadow-lg">

            <h3 className="text-3xl font-bold text-slate-900">
              One-on-One Coaching
            </h3>

            <div className="mt-8 flex flex-col gap-6 md:flex-row">

              <div className="flex-1 rounded-2xl bg-slate-100 p-6">

                <p className="text-4xl font-extrabold text-slate-900">
                  $30
                </p>

                <p className="mt-2 text-slate-600">
                  per subject/month
                </p>

                <p className="mt-3 text-slate-700">
                  Applies when enrolling for <strong>3 subjects or more.</strong>
                </p>

              </div>

              <div className="flex-1 rounded-2xl bg-yellow-50 p-6">

                <p className="text-4xl font-extrabold text-slate-900">
                  $35
                </p>

                <p className="mt-2 text-slate-600">
                  per subject/month
                </p>

                <p className="mt-3 text-slate-700">
                  Applies when enrolling for <strong>fewer than 3 subjects.</strong>
                </p>

              </div>

            </div>

            <ul className="mt-8 space-y-3 text-slate-700">

              <li>✔ One-on-One Coaching</li>
              <li>✔ Flexible Scheduling</li>
              <li>✔ Homework & Classwork</li>
              <li>✔ Monthly Mock Assessment</li>
              <li>✔ Parent Progress Reports</li>

            </ul>

          </div>

          <div className="mt-16 text-center">

            <Link
              href="/book"
              className="inline-block rounded-xl bg-yellow-500 px-10 py-5 text-lg font-bold text-slate-900 transition hover:bg-yellow-400"
            >
              Book Your FREE Week
            </Link>

          </div>

        </section>

      </main>

      <Footer />

    </>
  );
}