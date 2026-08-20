"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type StudentSchedule = {
  id: string;
  day: string;
  time: string;
  meet_link: string | null;

  subjects:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;

  tutors:
    | {
        id: string;
        full_name: string;
      }
    | {
        id: string;
        full_name: string;
      }[]
    | null;
};

type TimetableLesson = {
  id: string;
  day: string;
  subject: string;
  tutor: string;
  time: string;
  meetLink: string | null;
  status: "Upcoming" | "Scheduled";
  color: string;
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/* =========================================================
   SUBJECT NAME
========================================================= */

function getSubjectName(
  schedule: StudentSchedule
): string {
  if (!schedule.subjects) {
    return "Subject";
  }

  if (Array.isArray(schedule.subjects)) {
    return (
      schedule.subjects[0]?.name ||
      "Subject"
    );
  }

  return schedule.subjects.name || "Subject";
}

/* =========================================================
   TUTOR NAME
========================================================= */

function getTutorName(
  schedule: StudentSchedule
): string {
  if (!schedule.tutors) {
    return "Tutor not assigned";
  }

  if (Array.isArray(schedule.tutors)) {
    return (
      schedule.tutors[0]?.full_name ||
      "Tutor not assigned"
    );
  }

  return (
    schedule.tutors.full_name ||
    "Tutor not assigned"
  );
}

/* =========================================================
   CONVERT TIME TO MINUTES
========================================================= */

function getTimeMinutes(
  time: string
): number {
  const start = time
    .split("-")[0]
    .trim();

  const parts = start.split(" ");

  if (parts.length !== 2) {
    return 0;
  }

  const clock = parts[0];
  const period = parts[1].toUpperCase();

  let [hour, minute] = clock
    .split(":")
    .map(Number);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return 0;
  }

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minute;
}

/* =========================================================
   FIND NEXT LESSON
========================================================= */

function getNextLesson(
  schedules: StudentSchedule[]
): StudentSchedule | null {
  if (schedules.length === 0) {
    return null;
  }

  const now = new Date();

  const today = now.getDay();

  const currentMinutes =
    now.getHours() * 60 +
    now.getMinutes();

  const lessons = schedules
    .map((schedule) => {
      const dayIndex =
        DAYS.indexOf(schedule.day);

      if (dayIndex === -1) {
        return null;
      }

      const lessonMinutes =
        getTimeMinutes(schedule.time);

      let daysUntil =
        (dayIndex - today + 7) % 7;

      /*
       * If the lesson is today but has
       * already started, move it to next week.
       */

      if (
        daysUntil === 0 &&
        lessonMinutes < currentMinutes
      ) {
        daysUntil = 7;
      }

      return {
        schedule,
        daysUntil,
        lessonMinutes,
      };
    })
    .filter(
      (
        item
      ): item is {
        schedule: StudentSchedule;
        daysUntil: number;
        lessonMinutes: number;
      } => item !== null
    )
    .sort((a, b) => {
      if (
        a.daysUntil !==
        b.daysUntil
      ) {
        return (
          a.daysUntil -
          b.daysUntil
        );
      }

      return (
        a.lessonMinutes -
        b.lessonMinutes
      );
    });

  return lessons.length > 0
    ? lessons[0].schedule
    : null;
}

/* =========================================================
   TIMETABLE PAGE
========================================================= */

export default function TimetablePage() {
  const [timetable, setTimetable] =
    useState<TimetableLesson[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD REAL STUDENT TIMETABLE
  ======================================================= */

  useEffect(() => {
    async function loadTimetable() {
      try {
        setLoading(true);
        setError("");

        /* ================================================
           GET LOGGED-IN USER
        ================================================ */

        const {
          data: { user },
          error: authError,
        } =
          await supabase.auth.getUser();

        if (
          authError ||
          !user
        ) {
          throw new Error(
            "No logged-in student found."
          );
        }

        /* ================================================
           GET STUDENT
        ================================================ */

        const {
          data: student,
          error: studentError,
        } =
          await supabase
            .from("students")
            .select("id, auth_id")
            .eq(
              "auth_id",
              user.id
            )
            .single();

        if (
          studentError ||
          !student
        ) {
          throw new Error(
            studentError?.message ||
              "Student profile not found."
          );
        }

        /* ================================================
           GET REAL SCHEDULE
        ================================================ */

        const {
          data: scheduleData,
          error: scheduleError,
        } =
          await supabase
            .from("student_schedules")
            .select(
              `
                id,
                day,
                time,
                meet_link,

                subjects (
                  id,
                  name
                ),

                tutors (
                  id,
                  full_name
                )
              `
            )
            .eq(
              "student_id",
              student.id
            );

        if (scheduleError) {
          throw new Error(
            scheduleError.message
          );
        }

        const schedules =
          (scheduleData ||
            []) as StudentSchedule[];

        /* ================================================
           FIND NEXT LESSON
        ================================================ */

        const nextLesson =
          getNextLesson(
            schedules
          );

        /* ================================================
           CONVERT TO UI DATA
        ================================================ */

        const timetableData =
          schedules.map(
            (schedule) => {
              const isNextLesson =
                nextLesson?.id ===
                schedule.id;

              return {
                id: schedule.id,

                day: schedule.day,

                subject:
                  getSubjectName(
                    schedule
                  ),

                tutor:
                  getTutorName(
                    schedule
                  ),

                time: schedule.time,

                meetLink:
                  schedule.meet_link,

                status:
                  isNextLesson
                    ? "Upcoming"
                    : "Scheduled",

                color:
                  isNextLesson
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700",
              };
            }
          );

        /* ================================================
           SORT BY WEEKLY DAY + TIME
        ================================================ */

        timetableData.sort(
          (a, b) => {
            const dayA =
              DAYS.indexOf(a.day);

            const dayB =
              DAYS.indexOf(b.day);

            if (dayA !== dayB) {
              return dayA - dayB;
            }

            return (
              getTimeMinutes(a.time) -
              getTimeMinutes(b.time)
            );
          }
        );

        setTimetable(
          timetableData
        );
      } catch (err) {
        console.error(
          "TIMETABLE ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load timetable."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTimetable();
  }, []);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-lg font-semibold text-slate-700">
          Loading timetable...
        </p>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Unable to load timetable
        </h1>

        <p className="mt-3 font-medium text-red-600">
          {error}
        </p>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <>
      <h1 className="text-4xl font-extrabold text-slate-900">
        My Timetable
      </h1>

      <p className="mt-3 text-slate-700">
        View your weekly lessons and upcoming classes.
      </p>

      {/* ===================================================
          NO TIMETABLE
      =================================================== */}

      {timetable.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            No lessons scheduled yet
          </h2>

          <p className="mt-3 font-medium text-slate-600">
            Your timetable will appear here once
            GS Academy confirms your lessons.
          </p>
        </div>
      ) : (
        <>
          {/* ================================================
              MOBILE CARDS
          ================================================ */}

          <div className="mt-10 space-y-5 lg:hidden">
            {timetable.map(
              (lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-3xl bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-slate-900">
                      {lesson.subject}
                    </h2>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${lesson.color}`}
                    >
                      {lesson.status}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-slate-700">
                    <div className="flex justify-between gap-4">
                      <span className="font-semibold">
                        Day
                      </span>

                      <span>
                        {lesson.day}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="font-semibold">
                        Tutor
                      </span>

                      <span className="text-right">
                        {lesson.tutor}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="font-semibold">
                        Time
                      </span>

                      <span>
                        {lesson.time}
                      </span>
                    </div>
                  </div>

                  {lesson.meetLink && (
                    <a
                      href={lesson.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-block rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-900 hover:bg-yellow-400"
                    >
                      Join Class
                    </a>
                  )}
                </div>
              )
            )}
          </div>

          {/* ================================================
              DESKTOP TABLE
          ================================================ */}

          <div className="mt-10 hidden overflow-hidden rounded-3xl bg-white shadow-sm lg:block">
            <table className="w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-6 py-5 text-left">
                    Day
                  </th>

                  <th className="px-6 py-5 text-left">
                    Subject
                  </th>

                  <th className="px-6 py-5 text-left">
                    Tutor
                  </th>

                  <th className="px-6 py-5 text-left">
                    Time
                  </th>

                  <th className="px-6 py-5 text-left">
                    Status
                  </th>

                  <th className="px-6 py-5 text-left">
                    Class
                  </th>
                </tr>
              </thead>

              <tbody>
                {timetable.map(
                  (lesson) => (
                    <tr
                      key={lesson.id}
                      className="border-b border-slate-200"
                    >
                      <td className="px-6 py-5 font-medium">
                        {lesson.day}
                      </td>

                      <td className="px-6 py-5 font-medium">
                        {lesson.subject}
                      </td>

                      <td className="px-6 py-5">
                        {lesson.tutor}
                      </td>

                      <td className="px-6 py-5">
                        {lesson.time}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-block rounded-full px-4 py-2 font-semibold ${lesson.color}`}
                        >
                          {lesson.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {lesson.meetLink ? (
                          <a
                            href={lesson.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl bg-yellow-500 px-5 py-2 font-bold text-slate-900 hover:bg-yellow-400"
                          >
                            Join Class
                          </a>
                        ) : (
                          <span className="text-sm font-semibold text-slate-500">
                            Link unavailable
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ===================================================
          REMINDER
      =================================================== */}

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">
          Class Reminder
        </h2>

        <p className="mt-4 leading-8 text-slate-700">
          Your timetable is automatically connected to
          the lessons scheduled for your student account.
          Any timetable changes confirmed by GS Academy
          will appear here.
        </p>
      </div>
    </>
  );
}