"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {

  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleChangePassword() {

    if(password !== confirmPassword){

      alert("Passwords do not match");
      return;

    }


    if(password.length < 6){

      alert("Password must be at least 6 characters");
      return;

    }


    setLoading(true);


    const {
      error
    } = await supabase.auth.updateUser({

      password: password

    });



    if(error){

      alert(error.message);
      setLoading(false);
      return;

    }



    alert("Password changed successfully");


    router.push("/dashboard");


  }



  return (

    <div className="flex min-h-screen items-center justify-center bg-slate-100">


      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow">


        <h1 className="text-3xl font-extrabold text-slate-900">
          Change Password
        </h1>


        <p className="mt-3 text-slate-600">
          Please create a new password before accessing your student dashboard.
        </p>



        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="mt-6 w-full rounded-xl border p-4"
        />



        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e)=>setConfirmPassword(e.target.value)}
          className="mt-4 w-full rounded-xl border p-4"
        />



        <button

          onClick={handleChangePassword}

          disabled={loading}

          className="
          mt-6 w-full rounded-xl
          bg-yellow-500 px-6 py-4
          font-bold text-slate-900
          "

        >

          {loading ? "Updating..." : "Change Password"}

        </button>


      </div>


    </div>

  );

}