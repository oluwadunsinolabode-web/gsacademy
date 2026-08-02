"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Bell,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getStudentByAuthId } from "@/lib/services/student";


export default function DashboardPage() {

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    async function loadStudent() {

      const {
        data: { user },
      } = await supabase.auth.getUser();


      console.log("AUTH USER:", user);


      if (!user) {
        setLoading(false);
        return;
      }


      const { data, error } = await getStudentByAuthId(user.id);


      console.log("STUDENT DATA:", data);
      console.log("STUDENT ERROR:", error);


      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }


      setStudent(data);
      setLoading(false);

    }


    loadStudent();

  }, []);



  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-lg font-semibold text-slate-600">
          Loading dashboard...
        </p>
      </div>
    );
  }



  return (
    <>


      <h1 className="text-4xl font-extrabold text-slate-900">
        Welcome {student?.full_name || ""}
      </h1>


      <p className="mt-3 text-slate-700">
        Here is an overview of your learning activities.
      </p>



      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">


        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <CalendarDays className="text-yellow-600" size={32}/>

          <p className="mt-5 font-bold text-slate-700">
            Next Lesson
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            {student?.lesson_schedule || "No upcoming lesson"}
          </h3>

        </div>




        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <BookOpen className="text-yellow-600" size={32}/>

          <p className="mt-5 font-bold text-slate-700">
            Package
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            {student?.package || "Not assigned"}
          </h3>

        </div>




        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <ClipboardCheck className="text-yellow-600" size={32}/>

          <p className="mt-5 font-bold text-slate-700">
            Tutor
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            {student?.tutors?.full_name || "Not assigned"}
          </h3>

        </div>




        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <TrendingUp className="text-yellow-600" size={32}/>

          <p className="mt-5 font-bold text-slate-700">
            Progress
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            Getting started
          </h3>

        </div>


      </div>





      <div className="mt-10 grid gap-8 lg:grid-cols-2">



        <div className="rounded-3xl bg-white p-6 shadow-sm">


          <div className="flex items-center gap-3">

            <CalendarDays
              size={30}
              className="text-yellow-600"
            />

            <h2 className="text-2xl font-bold text-slate-900">
              Upcoming Lesson
            </h2>

          </div>



          <p className="mt-5 leading-8 text-slate-700">

            {student?.lesson_schedule ||
            "Your next live class will appear here."}

          </p>



          {
            student?.google_meet_link ? (

              <a
                href={student.google_meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="
                mt-8 inline-block rounded-xl
                bg-yellow-500 px-8 py-4
                font-bold text-slate-900
                transition hover:bg-yellow-400
                "
              >
                Join Class
              </a>

            ) : (

              <button
                disabled
                className="
                mt-8 rounded-xl
                bg-slate-300 px-8 py-4
                font-bold text-slate-600
                "
              >
                Class Link Not Available
              </button>

            )
          }


        </div>





        <div className="rounded-3xl bg-white p-6 shadow-sm">


          <div className="flex items-center gap-3">

            <Bell
              size={30}
              className="text-yellow-600"
            />

            <h2 className="text-2xl font-bold text-slate-900">
              Latest Updates
            </h2>

          </div>



          <p className="mt-5 leading-8 text-slate-700">

            Welcome to GS Academy. Your lessons and updates
            will appear here.

          </p>


        </div>



      </div>


    </>
  );
}