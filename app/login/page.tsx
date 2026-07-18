import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-md px-8 py-20">

          <div className="rounded-3xl bg-white p-10 shadow-lg">

            <h1 className="text-center text-4xl font-extrabold text-slate-900">
              Student Login
            </h1>

            <p className="mt-4 text-center text-slate-600">
              Sign in to access your learning portal.
            </p>

            <form className="mt-10 space-y-6">

              <div>
                <label className="mb-2 block font-semibold text-slate-900">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="student@email.com"
                  className="w-full rounded-xl border border-slate-300 px-5 py-4 focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-slate-900">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Password"
                  className="w-full rounded-xl border border-slate-300 px-5 py-4 focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white transition hover:bg-slate-800"
              >
                Login
              </button>

            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have login details yet?
            </p>

            <p className="mt-2 text-center text-sm">
              Please{" "}
              <Link
                href="/contact"
                className="font-semibold text-yellow-600 hover:underline"
              >
                contact GS Academy
              </Link>
            </p>

          </div>

        </section>
      </main>
    </>
  );
}