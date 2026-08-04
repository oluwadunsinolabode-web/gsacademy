"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function TutorLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: tutor } = await supabase
      .from("tutors")
      .select("*")
      .eq("auth_id", user?.id)
      .single();

    if (!tutor) {
      alert("Tutor record not found.");
      setLoading(false);
      return;
    }

    if (!tutor.password_changed) {
      router.push("/change-password-tutor");
      return;
    }

    router.push("/tutor-dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow">

        <h1 className="text-3xl font-extrabold text-slate-900">
          Tutor Login
        </h1>

        <p className="mt-3 text-slate-600">
          Sign in to your GS Academy tutor account.
        </p>

        <input
          className="mt-8 w-full rounded-xl border p-4"
          placeholder="Email Address"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          className="mt-4 w-full rounded-xl border p-4"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={login}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-yellow-500 py-4 font-bold text-slate-900"
        >
          {loading ? "Signing In..." : "Login"}
        </button>

      </div>

    </div>
  );
}