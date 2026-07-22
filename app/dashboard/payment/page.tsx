export default function PaymentsPage() {
  return (
    <>

      <h1 className="text-4xl font-extrabold text-slate-900">
        Payment History
      </h1>

      <p className="mt-3 text-slate-700">
        View your tuition payment history and receipts.
      </p>


      {/* Payment Cards */}

      <div className="mt-10 space-y-6">


        {/* Paid Payment */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">


          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">


            <div>

              <p className="text-sm font-semibold text-slate-600">
                Month
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                July 2026
              </h2>


            </div>



            <div>

              <p className="text-sm font-semibold text-slate-600">
                Amount
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                £120
              </p>


            </div>



            <span className="w-fit rounded-full bg-green-100 px-5 py-2 font-semibold text-green-700">
              Paid
            </span>


          </div>



          <button
            className="
            mt-6 w-full rounded-xl 
            bg-yellow-500 px-5 py-3
            font-bold text-slate-900
            transition hover:bg-yellow-400
            sm:w-auto
            "
          >
            Download Receipt
          </button>


        </div>





        {/* Pending Payment */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">


          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">


            <div>

              <p className="text-sm font-semibold text-slate-600">
                Month
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                August 2026
              </h2>

            </div>



            <div>

              <p className="text-sm font-semibold text-slate-600">
                Amount
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                £120
              </p>

            </div>



            <span className="w-fit rounded-full bg-yellow-100 px-5 py-2 font-semibold text-yellow-700">
              Pending
            </span>



          </div>


        </div>


      </div>





      {/* Help Section */}

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">


        <h2 className="text-2xl font-bold text-slate-900">
          Need Help?
        </h2>


        <p className="mt-4 leading-8 text-slate-700">
          If you have any questions regarding your tuition payments,
          receipts or invoices, please contact the GS Academy
          administration team.
        </p>


      </div>


    </>
  );
}