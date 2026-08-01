"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

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

window.location.href = "/admin-dashboard";
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">

        <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">

          <h1 className="text-center text-4xl font-extrabold text-slate-900">
            Admin Login
          </h1>

          <p className="mt-4 text-center text-slate-600">
            GS Academy Administration Portal
          </p>

          <form
            onSubmit={handleLogin}
            className="mt-10 space-y-6"
          >

            <div>

              <label className="mb-2 block font-semibold">
                Email
              </label>

              <input
                type="email"
                className="w-full rounded-xl border px-5 py-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>

            <div>

              <label className="mb-2 block font-semibold">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-xl border px-5 py-4 pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2"
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
              <p className="rounded-xl bg-red-50 p-4 text-red-600">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white"
            >
              {loading ? "Signing in..." : "Login"}
            </button>

          </form>

        </div>

      </main>
    </>
  );
}