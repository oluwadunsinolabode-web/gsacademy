"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  FileText,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react";


export default function StudentSubmissionsPage() {

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    async function loadSubmissions(){

      const {
        data:{
          user
        }
      } = await supabase.auth.getUser();



     if (!user) {
  setLoading(false);
  return;
}


      const {
        data,
        error
      } = await supabase
        .from("classwork_submissions")
        .select("*")
        .eq("student_id", user.id)
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


  },[]);




  if(loading){

    return(
      <p className="text-slate-600">
        Loading submissions...
      </p>
    );

  }





  return (

    <div className="mx-auto max-w-7xl">


      <h1 className="text-4xl font-extrabold text-slate-900">
        My Submissions
      </h1>


      <p className="mt-3 text-slate-600">
        View your submitted classwork and tutor feedback.
      </p>





      {
        submissions.length === 0 && (

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <p className="text-slate-500">
              You have not submitted any classwork yet.
            </p>

          </div>

        )
      }





      <div className="mt-10 space-y-8">


      {
        submissions.map((submission)=>(


          <div
            key={submission.id}
            className="rounded-3xl bg-white p-8 shadow-sm"
          >


            <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">



              <div>


                <h2 className="text-2xl font-bold text-slate-900">

                  {submission.title}

                </h2>



                <p className="mt-3 text-slate-600">

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





              <div>


                <a
                  href={submission.image_url}
                  target="_blank"
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white"
                >

                  <Eye size={18}/>

                  View Submission

                </a>


              </div>



            </div>





            {
              submission.score !== null && (

              <div className="mt-8 rounded-2xl bg-yellow-50 p-6">


                <h3 className="text-xl font-bold text-slate-900">
                  Result
                </h3>


                <p className="mt-3 text-4xl font-extrabold text-yellow-600">

                  {submission.score}

                  /

                  {submission.total_mark}

                </p>


                <p className="mt-2 font-semibold text-slate-700">

                  {submission.percentage}%

                </p>


              </div>

              )
            }







            {
              {submission.auto_feedback && (


              <div className="mt-6 rounded-2xl bg-slate-100 p-6">


                <h3 className="font-bold text-slate-900">
                  Tutor Feedback
                </h3>


                <p className="mt-3 text-slate-700 leading-7">

                 {submission.auto_feedback}

                </p>


              </div>


              )
            }







            {
              submission.correction_file_url && (


                <div className="mt-6">


                  <a
                    href={submission.correction_file_url}
                    target="_blank"
                    className="flex items-center gap-2 font-bold text-yellow-600"
                  >

                    <FileText size={20}/>

                    View Tutor Correction

                  </a>


                </div>


              )
            }





          </div>



        ))
      }



      </div>



    </div>

  );

}