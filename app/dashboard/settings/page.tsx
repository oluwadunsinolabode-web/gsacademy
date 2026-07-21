export default function SettingsPage() {
  return (
    <>

      <h1 className="text-4xl font-extrabold text-slate-900">
        Account Settings
      </h1>

      <p className="mt-3 text-slate-600">
        Update your account information and preferences.
      </p>


      <div className="mt-10 rounded-3xl bg-white p-10 shadow-sm">

        <div className="space-y-8">


          <div>

            <label className="mb-2 block font-semibold text-slate-900">
              Full Name
            </label>

            <input
              type="text"
              defaultValue="Student Name"
              className="w-full rounded-xl border border-slate-300 px-5 py-4 text-slate-900 focus:border-yellow-500 focus:outline-none"
            />

          </div>



          <div>

            <label className="mb-2 block font-semibold text-slate-900">
              Email Address
            </label>

            <input
              type="email"
              defaultValue="student@email.com"
              className="w-full rounded-xl border border-slate-300 px-5 py-4 text-slate-900 focus:border-yellow-500 focus:outline-none"
            />

          </div>



          <div>

            <label className="mb-2 block font-semibold text-slate-900">
              Phone Number
            </label>

            <input
              type="text"
              defaultValue="+44 0000 000000"
              className="w-full rounded-xl border border-slate-300 px-5 py-4 text-slate-900 focus:border-yellow-500 focus:outline-none"
            />

          </div>



          <div>

            <label className="mb-2 block font-semibold text-slate-900">
              Change Password
            </label>

            <input
              type="password"
              placeholder="Enter new password"
              className="w-full rounded-xl border border-slate-300 px-5 py-4 text-slate-900 focus:border-yellow-500 focus:outline-none"
            />

          </div>



          <button
            className="rounded-xl bg-slate-900 px-10 py-4 font-bold text-white transition hover:bg-slate-800"
          >
            Save Changes
          </button>


        </div>


      </div>


    </>
  );
}