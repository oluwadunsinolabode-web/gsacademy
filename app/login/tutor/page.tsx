"use client";

import Navbar from "@/components/Navbar";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TutorLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    const role = user?.user_metadata?.role;

    if (role !== "tutor") {
      await supabase.auth.signOut();

      setError("This account is not registered as a tutor.");
      setLoading(false);
      return;
    }

    router.push("/tutor-dashboard");
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">

        <section className="mx-auto flex max-w-md px-6 py-20">

          <div className="w-full rounded-3xl bg-white p-10 shadow-xl">

            <h1 className="text-center text-4xl font-bold text-slate-900">
              Tutor Login
            </h1>

            <p className="mt-4 text-center text-slate-600">
              Sign in to manage your classes, students and assessments.
            </p>

            <form
              onSubmit={handleLogin}
              className="mt-10 space-y-7"
            >

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Tutor Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tutor@gsacademyhub.com"
                  className="w-full rounded-xl border border-slate-300 px-5 py-4 focus:border-yellow-500 focus:outline-none"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-300 px-5 py-4 pr-14 focus:border-yellow-500 focus:outline-none"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
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
                className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>

            </form>

          </div>

        </section>

      </main>

    </>
  );
}