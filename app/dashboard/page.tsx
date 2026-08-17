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

/* =========================================================
   GET NEXT LESSON
========================================================= */

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

/* =========================================================
   GET SUBJECT NAME
========================================================= */

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

/* =========================================================
   GET TUTOR NAME
========================================================= */

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

/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardPage() {
  const [student, setStudent] =
    useState<Student | null>(null);

  const [schedules, setSchedules] =
    useState<Schedule[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     LATEST UPDATES ROTATION
  ======================================================= */

  const [updateIndex, setUpdateIndex] =
    useState(0);

  const [updateVisible, setUpdateVisible] =
    useState(true);

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        /* =================================================
           GET LOGGED-IN USER
        ================================================= */

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

        /* =================================================
           GET STUDENT PROFILE
        ================================================= */

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

        /* =================================================
           GET STUDENT TIMETABLE
        ================================================= */

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

  /* =======================================================
     REFRESH NEXT LESSON EVERY MINUTE
  ======================================================= */

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

  /* =======================================================
     ROTATE LATEST UPDATES
  ======================================================= */

  useEffect(() => {
    const interval =
      setInterval(() => {
        setUpdateVisible(false);

        setTimeout(() => {
          setUpdateIndex(
            (current) =>
              current === 0 ? 1 : 0
          );

          setUpdateVisible(true);
        }, 500);
      }, 6000);

    return () =>
      clearInterval(interval);
  }, []);

  /* =======================================================
     NEXT LESSON
  ======================================================= */

  const nextLesson =
    getNextLesson(
      schedules
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-lg font-semibold text-slate-700">
          Loading dashboard...
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
          Unable to load dashboard
        </h1>

        <p className="mt-2 font-medium text-red-600">
          {error}
        </p>
      </div>
    );
  }

  /* =======================================================
     DASHBOARD
  ======================================================= */

  return (
    <div className="w-full min-w-0 pb-10">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <h1 className="text-4xl font-extrabold text-slate-900">
          Welcome{" "}
          {student?.full_name || ""}
        </h1>

        <p className="mt-3 font-medium text-slate-700">
          Here is an overview of your
          learning activities.
        </p>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

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

              <p className="mt-1 font-medium text-slate-700">
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

          <h3 className="mt-3 break-words text-xl font-extrabold text-slate-900">
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

          <p className="mt-1 font-medium text-slate-600">
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
                schedules.map(
                  (schedule) =>
                    getSubjectName(
                      schedule
                    )
                )
              ).size
            }
          </h3>

          <p className="mt-1 font-medium text-slate-600">
            Active subjects
          </p>

        </div>

      </div>

      {/* =================================================
          UPCOMING LESSON + UPDATES
      ================================================= */}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        {/* UPCOMING LESSON */}

        <div className="min-w-0 rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <CalendarDays
              size={30}
              className="shrink-0 text-yellow-600"
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

              <p className="mt-2 font-semibold text-slate-700">
                {nextLesson.day}
                {" — "}
                {nextLesson.time}
              </p>

              <p className="mt-2 font-medium text-slate-700">
                Tutor:{" "}
                <span className="font-bold text-slate-900">
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
            <p className="mt-6 font-medium text-slate-700">
              Your timetable will appear
              here once your lessons have
              been scheduled.
            </p>
          )}

        </div>

        {/* =================================================
            LATEST UPDATES
        ================================================= */}

        <div className="min-w-0 rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <Bell
              size={30}
              className="shrink-0 text-yellow-600"
            />

            <h2 className="text-2xl font-bold text-slate-900">
              Latest Updates
            </h2>

          </div>

          {/* ROTATING CONTENT */}

          <div
            className={`mt-5 min-h-[250px] transition-all duration-500 ease-in-out ${
              updateVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            }`}
          >

            {updateIndex === 0 ? (

              /* ==========================================
                 ANNOUNCEMENT 1
              ========================================== */

              <div>

                <h3 className="text-xl font-extrabold text-slate-900">
                  Happy New Week! 
                </h3>

                <p className="mt-4 font-semibold leading-7 text-slate-700">
                  Welcome to a new week at GS Academy.
                  Your learning resources are now available 
                  through the student dashboard. 
                  Ensure you make good use of the materials provided by your tutors
                  to support your lessons and revision.
                </p>

                <div className="mt-5 rounded-2xl bg-yellow-50 p-4">

                  <p className="font-bold leading-7 text-slate-900">
                     A Message from the Founder
                  </p>

                  <p className="mt-2 font-medium leading-7 text-slate-700">
                    I am proud of every one of you.
                    Keep learning, keep improving,
                    and always give your best.
                    I believe in you!
                  </p>

                  <p className="mt-3 font-bold text-slate-900">
                    — GreatSam, Founder, GS Academy
                  </p>

                </div>

              </div>

            ) : (

              /* ==========================================
                 ANNOUNCEMENT 2
              ========================================== */

              <div>

                <h3 className="text-xl font-extrabold text-slate-900">
                  📝 Monthly Mock Examination
                </h3>

                <p className="mt-4 font-semibold leading-7 text-slate-700">
                  Get ready for our monthly mock
                  examination at the end of this
                  month.
                </p>

                <p className="mt-4 font-semibold leading-7 text-slate-700">
                  The mock will cover everything you
                  have learnt throughout the month,
                  so make sure you regularly review
                  your lessons, classwork, and learning
                  resources.
                </p>

                <div className="mt-5 rounded-2xl bg-yellow-50 p-4">

                  <p className="font-bold leading-7 text-slate-900">
                     Start preparing now!
                  </p>

                  <p className="mt-1 font-medium leading-7 text-slate-700">
                    Stay consistent and go into the
                    mock fully prepared. You can do
                    this! 
                  </p>

                </div>

              </div>

            )}

          </div>

          {/* ANNOUNCEMENT INDICATORS */}

          <div className="mt-4 flex justify-center gap-2">

            <button
              type="button"
              onClick={() => {
                setUpdateVisible(false);

                setTimeout(() => {
                  setUpdateIndex(0);
                  setUpdateVisible(true);
                }, 300);
              }}
              aria-label="Show welcome announcement"
              className={`h-2.5 rounded-full transition-all duration-300 ${
                updateIndex === 0
                  ? "w-7 bg-yellow-500"
                  : "w-2.5 bg-slate-300"
              }`}
            />

            <button
              type="button"
              onClick={() => {
                setUpdateVisible(false);

                setTimeout(() => {
                  setUpdateIndex(1);
                  setUpdateVisible(true);
                }, 300);
              }}
              aria-label="Show mock examination announcement"
              className={`h-2.5 rounded-full transition-all duration-300 ${
                updateIndex === 1
                  ? "w-7 bg-yellow-500"
                  : "w-2.5 bg-slate-300"
              }`}
            />

          </div>

        </div>

      </div>

      {/* =================================================
          MY TIMETABLE
      ================================================= */}

      <div className="mt-10 min-w-0 rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <CalendarDays
            size={30}
            className="shrink-0 text-yellow-600"
          />

          <div className="min-w-0">

            <h2 className="text-2xl font-bold text-slate-900">
              My Timetable
            </h2>

            <p className="mt-1 font-medium text-slate-600">
              Join your lesson or open your
              subject classroom.
            </p>

          </div>

        </div>

        {schedules.length === 0 ? (

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

            <CalendarDays
              size={40}
              className="mx-auto text-slate-400"
            />

            <p className="mt-4 font-semibold text-slate-700">
              No lessons have been scheduled yet.
            </p>

          </div>

        ) : (

          <div className="mt-6 space-y-4">

            {Array.from(
              schedules.reduce(
                (
                  grouped,
                  schedule
                ) => {

                  const subjectName =
                    getSubjectName(
                      schedule
                    );

                  const existing =
                    grouped.get(
                      subjectName
                    );

                  if (existing) {
                    existing.push(
                      schedule
                    );
                  } else {
                    grouped.set(
                      subjectName,
                      [schedule]
                    );
                  }

                  return grouped;

                },
                new Map<
                  string,
                  Schedule[]
                >()
              ).entries()
            ).map(
              ([
                subjectName,
                subjectSchedules,
              ]) => {

                const joinSchedule =
                  subjectSchedules.find(
                    (schedule) =>
                      Boolean(
                        schedule.meet_link
                      )
                  ) ||
                  subjectSchedules[0];

                const tutorName =
                  getTutorName(
                    joinSchedule
                  );

                return (
                  <div
                    key={
                      subjectName
                    }
                    className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >

                    <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* SUBJECT + SCHEDULES */}

                      <div className="min-w-0">

                        <div className="flex min-w-0 items-start gap-3">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100">

                            <BookOpen
                              size={24}
                              className="text-yellow-600"
                            />

                          </div>

                          <div className="min-w-0">

                            <h3 className="break-words text-xl font-extrabold text-slate-900">
                              {subjectName}
                            </h3>

                            <div className="mt-3 space-y-1">

                              {subjectSchedules.map(
                                (
                                  schedule
                                ) => (

                                  <p
                                    key={
                                      schedule.id
                                    }
                                    className="break-words font-semibold text-slate-700"
                                  >
                                    {schedule.day}
                                    {" — "}
                                    {schedule.time}
                                  </p>

                                )
                              )}

                            </div>

                          </div>

                        </div>

                        {/* TUTOR */}

                        <p className="mt-4 font-medium text-slate-700">
                          Tutor:{" "}
                          <span className="font-bold text-slate-900">
                            {tutorName}
                          </span>
                        </p>

                      </div>

                      {/* ACTIONS */}

                      <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row lg:w-auto">

                        {/* JOIN CLASS */}

                        {joinSchedule.meet_link ? (

                          <a
                            href={
                              joinSchedule.meet_link
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-900 transition hover:bg-yellow-400 sm:w-auto"
                          >
                            Join Class
                          </a>

                        ) : (

                          <button
                            disabled
                            className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-300 px-6 py-3 font-bold text-slate-600 sm:w-auto"
                          >
                            Class Link Not Available
                          </button>

                        )}

                        {/* OPEN CLASS */}

                        <Link
                          href={`/dashboard/class?schedule_id=${encodeURIComponent(
                            joinSchedule.id
                          )}&subject=${encodeURIComponent(
                            subjectName
                          )}`}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-6 py-3 font-bold text-slate-900 transition hover:bg-slate-900 hover:text-white sm:w-auto"
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