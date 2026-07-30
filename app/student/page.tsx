"use client";

import { Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("LOGIN DATA:", data);
    console.log("LOGIN ERROR:", error);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    router.push("/dashboard");
  };


  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">

        <section className="mx-auto flex max-w-md px-6 py-20">

          <div className="w-full rounded-3xl bg-white p-10 shadow-xl">


            <h1 className="text-center text-4xl font-bold tracking-tight text-slate-900">
              Student Login
            </h1>


            <p className="mt-4 text-center text-base text-slate-600">
              Sign in to access your GS Academy learning portal.
            </p>


            <form
              onSubmit={handleLogin}
              className="mt-10 space-y-7"
            >


              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Email Address
                </label>


                <input
                  type="email"
                  placeholder="student@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-5 py-4 text-slate-900 placeholder:text-slate-500 focus:border-yellow-500 focus:outline-none"
                  required
                />

              </div>



              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Password
                </label>


                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-5 py-4 pr-14 text-slate-900 placeholder:text-slate-500 focus:border-yellow-500 focus:outline-none"
                    required
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
                  >

                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}

                  </button>


                </div>

              </div>



              {error && (

                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </p>

              )}



              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? "Signing in..." : "Login"}

              </button>


            </form>



            <div className="mt-8 text-center">

              <p className="text-sm text-slate-600">
                Do not have login details yet?
              </p>


              <p className="mt-2 text-sm text-slate-700">

                Please{" "}

                <Link
                  href="/contact"
                  className="font-semibold text-yellow-600 hover:text-yellow-700 hover:underline"
                >
                  contact GS Academy
                </Link>

              </p>


            </div>


          </div>

        </section>


      </main>

    </>
  );
}