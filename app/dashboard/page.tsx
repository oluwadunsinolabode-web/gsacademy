"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  BookOpen,
  TrendingUp,
  Bell,
  UserRound,
  FileText,
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

type Classwork = {
  id: string;
  tutor_id: string;
  subject: string;
  title: string;
  description: string | null;
  attachment_url: string | null;
  due_date: string | null;
  status: string;
  created_at: string;
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

  const [classworks, setClassworks] =
    useState<Classwork[]>([]);

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
          "AUTH USER:",
          user
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
        // GET STUDENT SCHEDULES
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

        // =====================================
        // GET CLASSWORK ASSIGNMENTS
        // =====================================

        const {
          data: assignments,
          error: assignmentError,
        } =
          await supabase
            .from(
              "classwork_assignments"
            )
            .select(
              "id, classwork_id, student_id"
            )
            .eq(
              "student_id",
              studentData.id
            );

        console.log(
          "CLASSWORK ASSIGNMENTS:",
          assignments
        );

        if (assignmentError) {
          throw new Error(
            assignmentError.message
          );
        }

        // =====================================
        // NO CLASSWORK
        // =====================================

        if (
          !assignments ||
          assignments.length === 0
        ) {
          setClassworks([]);
          return;
        }

        // =====================================
        // GET CLASSWORK IDS
        // =====================================

        const classworkIds =
          assignments
            .map(
              (assignment) =>
                assignment.classwork_id
            )
            .filter(Boolean);

        console.log(
          "CLASSWORK IDS:",
          classworkIds
        );

        if (
          classworkIds.length === 0
        ) {
          setClassworks([]);
          return;
        }

        // =====================================
        // GET ACTUAL CLASSWORK
        // =====================================

        const {
          data: classworkData,
          error: classworkError,
        } =
          await supabase
            .from("classworks")
            .select(
              `
                id,
                tutor_id,
                subject,
                title,
                description,
                attachment_url,
                due_date,
                status,
                created_at
              `
            )
            .in(
              "id",
              classworkIds
            )
            .order(
              "created_at",
              {
                ascending: false,
              }
            );

        console.log(
          "CLASSWORK:",
          classworkData
        );

        if (classworkError) {
          throw new Error(
            classworkError.message
          );
        }

        setClassworks(
          (classworkData ||
            []) as Classwork[]
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

        {/* CLASSWORK */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <FileText
            className="text-yellow-600"
            size={32}
          />

          <p className="mt-5 font-bold text-slate-700">
            Classwork
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            {classworks.length}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Assigned to you
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
          CLASSWORK
      ====================================== */}

      <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <FileText
              size={30}
              className="text-yellow-600"
            />

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                My Classwork
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Classwork assigned by your tutor.
              </p>
            </div>

          </div>

          <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-700">
            {classworks.length}{" "}
            {classworks.length === 1
              ? "Assignment"
              : "Assignments"}
          </span>

        </div>

        {classworks.length === 0 ? (

          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

            <FileText
              size={45}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 text-xl font-bold text-slate-900">
              No classwork yet
            </h3>

            <p className="mt-2 text-slate-600">
              Your tutor has not assigned
              any classwork yet.
            </p>

          </div>

        ) : (

          <div className="mt-8 space-y-5">

            {classworks.map(
              (work) => (

                <div
                  key={work.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >

                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-3">

                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                          {work.subject}
                        </span>

                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          {work.status}
                        </span>

                      </div>

                      <h3 className="mt-3 text-xl font-bold text-slate-900">
                        {work.title}
                      </h3>

                      {work.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                          {work.description}
                        </p>
                      )}

                      {work.due_date && (
                        <p className="mt-3 text-sm font-semibold text-slate-500">
                          Due:{" "}
                          {new Date(
                            work.due_date
                          ).toLocaleString()}
                        </p>
                      )}

                    </div>

                    <Link
                      href={`/dashboard/classwork?id=${work.id}`}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-800"
                    >
                      Open Classwork

                      <ArrowRight
                        size={18}
                      />
                    </Link>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* =====================================
          FULL TIMETABLE
      ====================================== */}

      <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <CalendarDays
            size={30}
            className="text-yellow-600"
          />

          <h2 className="text-2xl font-bold text-slate-900">
            My Timetable
          </h2>

        </div>

        {schedules.length === 0 ? (

          <p className="mt-6 text-slate-600">
            No lessons have been scheduled
            yet.
          </p>

        ) : (

          <div className="mt-6 space-y-4">

            {schedules.map(
              (schedule) => (

                <div
                  key={schedule.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                      <h3 className="text-lg font-bold text-slate-900">
                        {getSubjectName(
                          schedule
                        )}
                      </h3>

                      <p className="mt-1 font-semibold text-slate-700">
                        {schedule.day}
                        {" — "}
                        {schedule.time}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Tutor:{" "}
                        <span className="font-semibold text-slate-800">
                          {getTutorName(
                            schedule
                          )}
                        </span>
                      </p>

                    </div>

                    {schedule.meet_link && (
                      <a
                        href={
                          schedule.meet_link
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-xl bg-yellow-500 px-5 py-3 text-center font-bold text-slate-900 transition hover:bg-yellow-400"
                      >
                        Join Class
                      </a>
                    )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}