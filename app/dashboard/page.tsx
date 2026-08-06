"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  BookOpen,
    TrendingUp,
  Bell,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function DashboardPage() {

  const [student, setStudent] = useState<any>(null);

const [schedules, setSchedules] =
useState<any[]>([]);

const [loading, setLoading] = useState(true);
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getNextLesson(scheduleList: any[]) {
  if (!scheduleList.length) return null;

  const now = new Date();

  const today = now.getDay();

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const lessons = scheduleList
    .map((lesson) => {

      const dayIndex = DAYS.indexOf(lesson.day);

      const start =
        lesson.time.split("-")[0].trim();

      const [clock, period] =
        start.split(" ");

      let [hour, minute] =
        clock.split(":").map(Number);

      if (period === "PM" && hour !== 12)
        hour += 12;

      if (period === "AM" && hour === 12)
        hour = 0;

      const lessonMinutes =
        hour * 60 + minute;

      let diff =
        (dayIndex - today + 7) % 7;

      if (
        diff === 0 &&
        lessonMinutes < currentMinutes
      ) {
        diff = 7;
      }

      return {
        ...lesson,
        diff,
        lessonMinutes,
      };
    })
    .sort((a, b) => {

      if (a.diff !== b.diff)
        return a.diff - b.diff;

      return a.lessonMinutes - b.lessonMinutes;

    });

  return lessons[0];
}


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


    const { data, error } = await supabase
  .from("students")
  .select(`
    *,
    tutor_assignments (
      id,
      active,
      subjects (
        id,
        name
      ),
      tutors (
        id,
        full_name,
        email,
        phone
      )
    )
  `)
  .eq("auth_id", user.id)
  .single();

console.log("AUTH ID:", user.id);
console.log("STUDENT:", data);
console.log("ERROR:", error);

if (error) {
  console.log(error);
  setLoading(false);
  return;
}

setStudent(data);


// Load timetable

const { data: scheduleData, error: scheduleError } =
await supabase
.from("student_schedules")
.select(`
  id,
  day,
  time,

  subjects(
    id,
    name
  ),

  tutors(
    id,
    full_name
  ),

  students(
    google_meet_link
  )
`).eq(
  "student_id",
  data.id
);



console.log(
"STUDENT SCHEDULE:",
scheduleData
);


if(!scheduleError){

  setSchedules(
    scheduleData || []
  );

}


setLoading(false);
     
    }


    loadStudent();

  }, []);

const nextLesson =
  getNextLesson(schedules);

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
{
nextLesson
?

`${nextLesson.day} - ${nextLesson.time}`

:

"No lesson scheduled"
}
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

<div className="mt-5 space-y-4">


{
nextLesson ? (

<div
className="
rounded-xl
bg-slate-100
p-4
"
>

<p className="font-extrabold text-slate-900">
{nextLesson.subjects?.name}
</p>

<p className="mt-2 font-semibold text-slate-700">
📅 {nextLesson.day}
</p>

<p className="font-semibold text-slate-700">
⏰ {nextLesson.time}
</p>

<p className="mt-2 font-semibold text-slate-800">
Tutor: {nextLesson.tutors?.full_name}
</p>

{nextLesson.students?.google_meet_link ? (

<a
href={nextLesson.students.google_meet_link}
target="_blank"
rel="noopener noreferrer"
className="
mt-4
inline-block
rounded-xl
bg-yellow-500
px-5
py-3
font-bold
text-slate-900
hover:bg-yellow-400
"
>
Join Class
</a>

) : (

<p
className="
mt-4
text-sm
font-semibold
text-slate-500
"
>
Meeting link unavailable
</p>

)}
</div>

)

:(


<p className="font-semibold text-slate-600">

Your timetable will appear here.

</p>


)

}


</div>

{student?.google_meet_link ? (

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

)}

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



        <p className="mt-5 text-lg font-semibold leading-8 text-slate-900">

Welcome to GS Academy. Your lessons and updates
will appear here.

</p>


        </div>



      </div>


    </>
  );
}