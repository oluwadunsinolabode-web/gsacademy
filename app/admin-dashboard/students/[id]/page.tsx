import Link from "next/link";
import {
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
  User,
  ArrowLeft,
} from "lucide-react";

import { getStudent } from "@/lib/services/student";


export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  const { data: student, error } = await getStudent(id);


  if (error || !student) {
    return (
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">
          Student not found
        </h1>

        <Link
          href="/admin-dashboard/students"
          className="mt-5 inline-block text-yellow-600"
        >
          Back to Students
        </Link>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-7xl">


      <Link
        href="/admin-dashboard/students"
        className="inline-flex items-center gap-2 text-yellow-600 hover:underline"
      >
        <ArrowLeft size={18} />
        Back to Students
      </Link>



      <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">


        <div className="flex flex-col gap-8 lg:flex-row">


          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-yellow-100">

            <GraduationCap
              size={55}
              className="text-yellow-600"
            />

          </div>



          <div className="flex-1">


          <div className="flex items-center justify-between">

  <h1 className="text-4xl font-extrabold text-slate-900">
    {student.full_name}
  </h1>

  <Link
    href={`/admin-dashboard/students/${id}/edit`}
    className="
      rounded-xl
      bg-yellow-500
      px-6
      py-3
      font-bold
      text-slate-900
      hover:bg-yellow-400
    "
  >
    Edit Student
  </Link>

</div>


            <div className="mt-6 grid gap-4 md:grid-cols-2">


              <p className="flex items-center gap-3">
                <Mail size={18}/>
                {student.email}
              </p>



              <p className="flex items-center gap-3">
                <Phone size={18}/>
                {student.phone || "No phone"}
              </p>



              <p className="flex items-center gap-3">
                <BookOpen size={18}/>
                {student.subjects?.join(", ") || "No subjects"}
              </p>



              <p className="flex items-center gap-3">
                <User size={18}/>
                {student.package || "No package"}
              </p>


            </div>



          </div>


        </div>


      </div>




      <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">


        <h2 className="text-2xl font-bold">
          Assigned Tutor
        </h2>


      {student.tutor_assignments &&
student.tutor_assignments.length > 0 ? (

<div className="mt-4 space-y-5 text-slate-700">

{student.tutor_assignments.map(
(assignment:any,index:number)=>(

<div
key={index}
className="rounded-xl bg-slate-100 p-5"
>

<p>
<strong>Subject:</strong>{" "}
{assignment.subjects?.name || "Unknown"}
</p>

<p>
<strong>Tutor:</strong>{" "}
{assignment.tutors?.full_name || "Not assigned"}
</p>

<p>
<strong>Email:</strong>{" "}
{assignment.tutors?.email || "No email"}
</p>

<p>
<strong>Phone:</strong>{" "}
{assignment.tutors?.phone || "No phone"}
</p>

</div>

))

}

</div>

) : (

<p className="mt-4 text-slate-700">
No tutor assigned.
</p>

)}
      </div>





      <div className="mt-8 grid gap-6 md:grid-cols-3">


        <Link
          href={`/admin-dashboard/students/${id}/classwork`}
          className="rounded-3xl bg-white p-8 shadow-sm hover:shadow-md"
        >

          <h2 className="text-xl font-bold">
            Classwork
          </h2>

          <p className="mt-3 text-slate-600">
            View submissions
          </p>

        </Link>





        <Link
          href={`/admin-dashboard/students/${id}/homework`}
          className="rounded-3xl bg-white p-8 shadow-sm hover:shadow-md"
        >

          <h2 className="text-xl font-bold">
            Homework
          </h2>

          <p className="mt-3 text-slate-600">
            View homework
          </p>

        </Link>





        <Link
          href={`/admin-dashboard/students/${id}/progress`}
          className="rounded-3xl bg-white p-8 shadow-sm hover:shadow-md"
        >

          <h2 className="text-xl font-bold">
            Progress
          </h2>

          <p className="mt-3 text-slate-600">
            Academic report
          </p>

        </Link>


      </div>


    </div>
  );
}
