"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ChangeTutorPasswordPage() {

  const router = useRouter();


  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);





  async function changePassword() {


    if(password.length < 6){

      alert(
        "Password must be at least 6 characters."
      );

      return;

    }




    if(password !== confirmPassword){

      alert(
        "Passwords do not match."
      );

      return;

    }




    setLoading(true);





    // Get current user

    const {
      data:{
        user
      }

    } = await supabase.auth.getUser();





    if(!user){

      alert(
        "No logged in user found."
      );

      setLoading(false);

      return;

    }







    // Update password permanently

    const { error } =
      await supabase.auth.updateUser({

        password,

        data:{

          role:"tutor",

          must_change_password:false,

        }

      });







    if(error){

      alert(error.message);

      setLoading(false);

      return;

    }








    // Update tutor record

    const { error:updateError } =
      await supabase

        .from("tutors")

        .update({

          password_changed:true,

          temporary_password:null,

        })

        .eq(
          "auth_id",
          user.id
        );







    if(updateError){

      alert(updateError.message);

      setLoading(false);

      return;

    }







    alert(
      "Password changed successfully."
    );



    router.push(
      "/tutor-dashboard"
    );



  }







  return (

    <div className="flex min-h-screen items-center justify-center bg-slate-100">


      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">



        <h1 className="text-3xl font-extrabold text-slate-900">

          Change Password

        </h1>




        <p className="mt-3 text-slate-600">

          You must change your temporary password before continuing.

        </p>






        <input

          type="password"

          placeholder="New Password"

          className="mt-8 w-full rounded-xl border border-slate-300 px-5 py-4"

          value={password}

          onChange={(e)=>
            setPassword(e.target.value)
          }

        />






        <input

          type="password"

          placeholder="Confirm Password"

          className="mt-5 w-full rounded-xl border border-slate-300 px-5 py-4"

          value={confirmPassword}

          onChange={(e)=>
            setConfirmPassword(e.target.value)
          }

        />







        <button

          onClick={changePassword}

          disabled={loading}


          className="mt-8 w-full rounded-xl bg-yellow-500 py-4 font-bold text-slate-900 hover:bg-yellow-400 disabled:opacity-50"

        >

          {
            loading
            ?
            "Updating..."
            :
            "Update Password"
          }


        </button>





      </div>



    </div>

  );

}