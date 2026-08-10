"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  BookOpen,
  TrendingUp,
  Bell,
  UserRound,
  ArrowRight,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  auth_id: string;
  full_name: string;
  email?: string | null;
  package?: string | null;
};

type Schedule = {
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

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getNextLesson(
  scheduleList: Schedule[]
): Schedule | null {
  if (scheduleList.length === 0) {
    return null;
  }

  const now = new Date();

  const today = now.getDay();

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const lessons = scheduleList
    .map((lesson) => {
      const dayIndex = DAYS.indexOf(lesson.day);

      if (dayIndex === -1) {
        return null;
      }

      const start = lesson.time
        .split("-")[0]
        .trim();

      const parts = start.split(" ");

      if (parts.length !== 2) {
        return null;
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
        return null;
      }

      if (
        period === "PM" &&
        hour !== 12
      ) {
        hour += 12;
      }

      if (
        period === "AM" &&
        hour === 12
      ) {
        hour = 0;
      }

      const lessonMinutes =
        hour * 60 + minute;

      let daysUntil =
        (dayIndex - today + 7) % 7;

      if (
        daysUntil === 0 &&
        lessonMinutes < currentMinutes
      ) {
        daysUntil = 7;
      }

      return {
        lesson,
        daysUntil,
        lessonMinutes,
      };
    })
    .filter(
      (
        item
      ): item is {
        lesson: Schedule;
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
    ? lessons[0].lesson
    : null;
}

function getSubjectName(
  schedule: Schedule
): string {
  if (!schedule.subjects) {
    return "Subject";
  }

  if (
    Array.isArray(schedule.subjects)
  ) {
    return (
      schedule.subjects[0]?.name ||
      "Subject"
    );
  }

  return (
    schedule.subjects.name ||
    "Subject"
  );
}

function getTutorName(
  schedule: Schedule
): string {
  if (!schedule.tutors) {
    return "Tutor not assigned";
  }

  if (
    Array.isArray(schedule.tutors)
  ) {
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

export default function DashboardPage() {
  const [student, setStudent] =
    useState<Student | null>(null);

  const [schedules, setSchedules] =
    useState<Schedule[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        // =====================================
        // GET LOGGED-IN USER
        // =====================================

        const {
          data: { user },
          error: authError,
        } =
          await supabase.auth.getUser();

        console.log(
          "CURRENT AUTH ID:",
          user?.id
        );

        console.log(
          "CURRENT AUTH EMAIL:",
          user?.email
        );

        if (
          authError ||
          !user
        ) {
          throw new Error(
            "No logged-in student found."
          );
        }

        // =====================================
        // GET STUDENT PROFILE
        // =====================================

        const {
          data: studentData,
          error: studentError,
        } =
          await supabase
            .from("students")
            .select(
              `
                id,
                auth_id,
                full_name,
                email,
                package
              `
            )
            .eq(
              "auth_id",
              user.id
            )
            .single();

        console.log(
          "STUDENT:",
          studentData
        );

        if (
          studentError ||
          !studentData
        ) {
          throw new Error(
            studentError?.message ||
              "Student profile not found."
          );
        }

        setStudent(
          studentData
        );

        // =====================================
        // GET STUDENT TIMETABLE
        // =====================================
        //
        // IMPORTANT:
        //
        // student_schedules.student_id
        //        ↓
        // students.id
        //
        // student_schedules.subject_id
        //        ↓
        // subjects.id
        //
        // student_schedules.tutor_id
        //        ↓
        // tutors.id
        //
        // WE ARE NOT CHANGING THESE
        // RELATIONSHIPS.
        // =====================================

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
              studentData.id
            );

        console.log(
          "STUDENT SCHEDULE:",
          scheduleData
        );

        if (scheduleError) {
          throw new Error(
            scheduleError.message
          );
        }

        setSchedules(
          (scheduleData ||
            []) as Schedule[]
        );
      } catch (dashboardError) {
        console.error(
          "DASHBOARD ERROR:",
          dashboardError
        );

        setError(
          dashboardError instanceof
            Error
            ? dashboardError.message
            : "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // =====================================
  // REFRESH NEXT LESSON EVERY MINUTE
  // =====================================

  useEffect(() => {
    const interval =
      setInterval(() => {
        setSchedules(
          (current) => [
            ...current,
          ]
        );
      }, 60000);

    return () =>
      clearInterval(interval);
  }, []);

  const nextLesson =
    getNextLesson(
      schedules
    );

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-lg font-semibold text-slate-600">
          Loading dashboard...
        </p>
      </div>
    );
  }

  // =====================================
  // ERROR
  // =====================================

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Unable to load dashboard
        </h1>

        <p className="mt-2 text-red-600">
          {error}
        </p>
      </div>
    );
  }

  // =====================================
  // DASHBOARD
  // =====================================

  return (
    <div className="pb-10">

      {/* =====================================
          HEADER
      ====================================== */}

      <div>
        <h1 className="text-4xl font-extrabold text-slate-900">
          Welcome{" "}
          {student?.full_name || ""}
        </h1>

        <p className="mt-3 text-slate-700">
          Here is an overview of your
          learning activities.
        </p>
      </div>

      {/* =====================================
          SUMMARY CARDS
      ====================================== */}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        {/* NEXT LESSON */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <CalendarDays
            className="text-yellow-600"
            size={32}
          />

          <p className="mt-5 font-bold text-slate-700">
            Next Lesson
          </p>

          {nextLesson ? (
            <>
              <h3 className="mt-3 text-xl font-extrabold text-slate-900">
                {nextLesson.day}
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                {nextLesson.time}
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {getSubjectName(
                  nextLesson
                )}
              </p>
            </>
          ) : (
            <h3 className="mt-3 text-xl font-extrabold text-slate-900">
              No lesson scheduled
            </h3>
          )}

        </div>

        {/* PACKAGE */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <BookOpen
            className="text-yellow-600"
            size={32}
          />

          <p className="mt-5 font-bold text-slate-700">
            Package
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            {student?.package ||
              "Not assigned"}
          </h3>

        </div>

        {/* LESSONS */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <UserRound
            className="text-yellow-600"
            size={32}
          />

          <p className="mt-5 font-bold text-slate-700">
            Lessons
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            {schedules.length}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Scheduled lessons
          </p>

        </div>

        {/* SUBJECTS */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <TrendingUp
            className="text-yellow-600"
            size={32}
          />

          <p className="mt-5 font-bold text-slate-700">
            Subjects
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            {
              new Set(
                schedules
                  .map(
                    (schedule) =>
                      getSubjectName(
                        schedule
                      )
                  )
              ).size
            }
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Active subjects
          </p>

        </div>

      </div>

      {/* =====================================
          UPCOMING LESSON + UPDATES
      ====================================== */}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        {/* UPCOMING LESSON */}

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

          {nextLesson ? (
            <div className="mt-6">

              <h3 className="text-xl font-bold text-slate-900">
                {getSubjectName(
                  nextLesson
                )}
              </h3>

              <p className="mt-2 text-lg font-semibold text-slate-700">
                {nextLesson.day}
                {" — "}
                {nextLesson.time}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Tutor:{" "}
                <span className="font-semibold text-slate-900">
                  {getTutorName(
                    nextLesson
                  )}
                </span>
              </p>

              {nextLesson.meet_link ? (
                <a
                  href={
                    nextLesson.meet_link
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-block rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900 transition hover:bg-yellow-400"
                >
                  Join Class
                </a>
              ) : (
                <button
                  disabled
                  className="mt-8 rounded-xl bg-slate-300 px-8 py-4 font-bold text-slate-600"
                >
                  Class Link Not Available
                </button>
              )}

            </div>
          ) : (
            <p className="mt-6 text-slate-600">
              Your timetable will appear
              here once your lessons have
              been scheduled.
            </p>
          )}

        </div>

        {/* LATEST UPDATES */}

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
            Welcome to GS Academy.
            Your lessons, classwork and
            learning updates will appear
            here.
          </p>

        </div>

      </div>

      {/* =====================================
          MY TIMETABLE
      ====================================== */}

      <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <CalendarDays
            size={30}
            className="text-yellow-600"
          />

          <div>

            <h2 className="text-2xl font-bold text-slate-900">
              My Timetable
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Join your lesson or open your subject classroom.
            </p>

          </div>

        </div>

        {schedules.length === 0 ? (

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

            <CalendarDays
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-4 font-semibold text-slate-600">
              No lessons have been scheduled yet.
            </p>

          </div>

        ) : (

          <div className="mt-6 space-y-4">

            {schedules.map(
              (schedule) => {

                const subjectName =
                  getSubjectName(
                    schedule
                  );

                const tutorName =
                  getTutorName(
                    schedule
                  );

                return (
                  <div
                    key={
                      schedule.id
                    }
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* LESSON INFORMATION */}

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-3">

                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100">

                            <BookOpen
                              size={24}
                              className="text-yellow-600"
                            />

                          </div>

                          <div>

                            <h3 className="text-xl font-extrabold text-slate-900">
                              {
                                subjectName
                              }
                            </h3>

                            <p className="mt-1 font-semibold text-slate-700">
                              {
                                schedule.day
                              }
                              {" — "}
                              {
                                schedule.time
                              }
                            </p>

                          </div>

                        </div>

                        <p className="mt-4 text-sm text-slate-600">
                          Tutor:{" "}
                          <span className="font-semibold text-slate-900">
                            {
                              tutorName
                            }
                          </span>
                        </p>

                      </div>

                      {/* ACTIONS */}

                      <div className="flex flex-col gap-3 sm:flex-row">

                        {/* JOIN CLASS */}

                        {schedule.meet_link ? (

                          <a
                            href={
                              schedule.meet_link
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-900 transition hover:bg-yellow-400"
                          >
                            Join Class
                          </a>

                        ) : (

                          <button
                            disabled
                            className="inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-slate-300 px-6 py-3 font-bold text-slate-500"
                          >
                            Class Link Not Available
                          </button>

                        )}

                        {/* OPEN CLASS */}

                        <Link
                          href={`/dashboard/class?subject=${encodeURIComponent(
                            subjectName
                          )}&schedule_id=${encodeURIComponent(
                            schedule.id
                          )}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-6 py-3 font-bold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                        >
                          Open Class

                          <ArrowRight
                            size={18}
                          />

                        </Link>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
}