"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkRecoverySession() {
      try {
        /*
         * Supabase places the recovery information in the URL.
         * Give Supabase a moment to establish the session.
         */

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError(
            "This password reset link is invalid or has expired. Please request a new password reset email."
          );
        }
      } catch (err) {
        console.error("RESET SESSION ERROR:", err);

        setError(
          "Unable to verify your password reset session."
        );
      } finally {
        setCheckingSession(false);
      }
    }

    checkRecoverySession();
  }, []);

  async function handleResetPassword() {
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      /*
       * Update the existing Supabase Auth account.
       */

      const { data, error: passwordError } =
        await supabase.auth.updateUser({
          password,
        });

      if (passwordError) {
        console.error(
          "PASSWORD UPDATE ERROR:",
          passwordError
        );

        setError(passwordError.message);
        setLoading(false);
        return;
      }

      /*
       * Get the authenticated user.
       */

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(
          "Password was not updated because your recovery session could not be verified."
        );

        setLoading(false);
        return;
      }

      /*
       * Mark the student's temporary-password requirement
       * as completed.
       */

      const { error: studentUpdateError } =
        await supabase
          .from("students")
          .update({
            password_changed: true,
            temporary_password: null,
          })
          .eq("auth_id", user.id);

      if (studentUpdateError) {
        console.error(
          "STUDENT PROFILE UPDATE ERROR:",
          studentUpdateError
        );

        setError(
          `Your password was changed, but your student profile could not be updated: ${studentUpdateError.message}`
        );

        setLoading(false);
        return;
      }

      setMessage(
        "Your password has been changed successfully. Redirecting to your dashboard..."
      );

      /*
       * Give the success message a moment to display.
       */

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error(
        "PASSWORD RESET ERROR:",
        err
      );

      setError(
        "Something went wrong while changing your password."
      );

      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-yellow-500" />

          <p className="mt-5 text-slate-600">
            Verifying your password reset link...
          </p>
        </div>
      </div>
    );
  }

  if (error && !message) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Password Reset
          </h1>

          <div className="mt-6 rounded-2xl bg-red-50 p-5 text-red-700">
            {error}
          </div>

          <button
            onClick={() =>
              router.push("/login")
            }
            className="mt-6 w-full rounded-xl bg-slate-900 px-6 py-4 font-bold text-white hover:bg-slate-800"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Set New Password
        </h1>

        <p className="mt-3 text-slate-600">
          Create a new password for your GS Academy
          student portal.
        </p>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="mt-6 w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-yellow-500"
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          className="mt-4 w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-yellow-500"
        />

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <button
          onClick={handleResetPassword}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-yellow-500 px-6 py-4 font-bold text-slate-900 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Updating Password..."
            : "Set New Password"}
        </button>
      </div>
    </div>
  );
}