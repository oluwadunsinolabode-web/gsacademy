import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TimetablePage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-100">

        <div className="mx-auto max-w-7xl px-8 py-12">

          <h1 className="text-4xl font-extrabold text-slate-900">
            My Timetable
          </h1>

          <p className="mt-3 text-slate-600">
            View your upcoming weekly lessons.
          </p>

          <div className="mt-10 overflow-hidden rounded-3xl bg-white shadow-sm">

            <table className="w-full">

              <thead className="bg-slate-900 text-white">

                <tr>

                  <th className="px-6 py-5 text-left">Day</th>

                  <th className="px-6 py-5 text-left">Subject</th>

                  <th className="px-6 py-5 text-left">Tutor</th>

                  <th className="px-6 py-5 text-left">Time</th>

                  <th className="px-6 py-5 text-left">Status</th>

                </tr>

              </thead>

              <tbody>

                <tr className="border-b">

                  <td className="px-6 py-5">Tuesday</td>

                  <td className="px-6 py-5">Mathematics</td>

                  <td className="px-6 py-5">Great Sam</td>

                  <td className="px-6 py-5">6:00 PM</td>

                  <td className="px-6 py-5">

                    <span className="rounded-full bg-green-100 px-4 py-2 font-semibold text-green-700">
                      Upcoming
                    </span>

                  </td>

                </tr>

                <tr>

                  <td className="px-6 py-5">Thursday</td>

                  <td className="px-6 py-5">English</td>

                  <td className="px-6 py-5">Mrs Grace</td>

                  <td className="px-6 py-5">6:00 PM</td>

                  <td className="px-6 py-5">

                    <span className="rounded-full bg-yellow-100 px-4 py-2 font-semibold text-yellow-700">
                      Scheduled
                    </span>

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </main>

      <Footer />

    </>
  );
}