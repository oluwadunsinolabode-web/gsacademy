"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  CheckCircle,
  Clock,
} from "lucide-react";

import { supabase } from "@/lib/supabase";


export default function StudentClassworkPage() {


  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {


    async function loadSubmissions(){


      const { data, error } = await supabase
        .from("classwork_submissions")
        .select("*")
        .order(
          "submitted_at",
          {
            ascending:false
          }
        );



      if(!error){

        setSubmissions(data || []);

      }


      setLoading(false);

    }



    loadSubmissions();


  }, []);





  if(loading){

    return (
      <p className="text-slate-600">
        Loading submissions...
      </p>
    );

  }






  return (

    <div className="mx-auto max-w-7xl">


      <h1 className="text-4xl font-extrabold text-slate-900">
        Student Classwork
      </h1>


      <p className="mt-3 text-slate-600">
        Review student submissions and mark their work.
      </p>




      <div className="mt-10 space-y-8">



        {
          submissions.length === 0 && (

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <p className="text-slate-500">
                No submissions available yet.
              </p>

            </div>

          )
        }






        {
          submissions.map((submission)=>(


            <div
              key={submission.id}
              className="rounded-3xl bg-white p-8 shadow-sm"
            >



              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">



                <div>


                  <p className="font-semibold text-yellow-600">

                    {submission.subject || "Classwork"}

                  </p>



                  <h2 className="mt-2 text-3xl font-bold text-slate-900">

                    {submission.title}

                  </h2>



                  <p className="mt-4 text-slate-600">

                    Student:

                    {" "}

                    <strong>
                      {submission.student_email}
                    </strong>

                  </p>




                  <p className="mt-2 text-slate-600">

                    Submitted:

                    {" "}

                    {
                      new Date(
                        submission.submitted_at
                      ).toLocaleDateString()
                    }

                  </p>






                  <div className="mt-5">


                    {
                      submission.status === "Marked" ?


                      (

                        <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 font-semibold text-green-700">

                          <CheckCircle size={18}/>

                          Marked

                        </span>


                      )

                      :

                      (

                        <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 font-semibold text-yellow-700">

                          <Clock size={18}/>

                          Awaiting Marking

                        </span>


                      )

                    }


                  </div>




                </div>






                <div className="flex flex-col gap-4">



                  <a
                    href={submission.image_url}
                    target="_blank"
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 font-bold text-white hover:bg-slate-800"
                  >

                    <Eye size={18}/>

                    View Submission

                  </a>





                  <Link

                    href={`/tutor-dashboard/mark-classwork/${submission.id}`}

                    className="rounded-xl bg-yellow-500 px-8 py-4 text-center font-bold text-slate-900 hover:bg-yellow-400"

                  >

                    Mark Classwork

                  </Link>



                </div>




              </div>



            </div>



          ))

        }



      </div>



    </div>

  );

}