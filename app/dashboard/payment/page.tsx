export default function PaymentsPage() {
  return (
    <>

      <h1 className="text-4xl font-extrabold text-slate-900">
        Payment History
      </h1>

      <p className="mt-3 text-slate-600">
        View your tuition payment history and receipts.
      </p>


      <div className="mt-10 overflow-hidden rounded-3xl bg-white shadow-sm">

        <table className="w-full">

          <thead className="bg-slate-900 text-white">

            <tr>

              <th className="px-6 py-5 text-left">
                Month
              </th>

              <th className="px-6 py-5 text-left">
                Amount
              </th>

              <th className="px-6 py-5 text-left">
                Status
              </th>

              <th className="px-6 py-5 text-left">
                Receipt
              </th>

            </tr>

          </thead>


          <tbody>


            <tr className="border-b">

              <td className="px-6 py-5">
                July 2026
              </td>

              <td className="px-6 py-5">
                £120
              </td>

              <td className="px-6 py-5">

                <span className="rounded-full bg-green-100 px-4 py-2 font-semibold text-green-700">
                  Paid
                </span>

              </td>

              <td className="px-6 py-5">

                <button
                  className="rounded-lg bg-yellow-500 px-5 py-2 font-semibold text-slate-900 hover:bg-yellow-400"
                >
                  Download
                </button>

              </td>

            </tr>



            <tr>

              <td className="px-6 py-5">
                August 2026
              </td>

              <td className="px-6 py-5">
                £120
              </td>

              <td className="px-6 py-5">

                <span className="rounded-full bg-yellow-100 px-4 py-2 font-semibold text-yellow-700">
                  Pending
                </span>

              </td>

              <td className="px-6 py-5">
                —
              </td>

            </tr>


          </tbody>


        </table>


      </div>



      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <h2 className="text-2xl font-bold text-slate-900">
          Need Help?
        </h2>

        <p className="mt-4 leading-8 text-slate-600">
          If you have any questions regarding your tuition payments,
          receipts or invoices, please contact the GS Academy
          administration team.
        </p>

      </div>


    </>
  );
}