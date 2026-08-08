"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  BookOpen,
  TrendingUp,
  Bell,
  UserRound,
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
      }[]
    | null;

  tutors:
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

      if (period === "PM" && hour !== 12) {
        hour += 12;
      }

      if (period === "AM" && hour === 12) {
        hour = 0;
      }

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
        lesson,
        diff,
        lessonMinutes,
      };
    })
    .filter(
      (
        item
      ): item is {
        lesson: Schedule;
        diff: number;
        lessonMinutes: number;
      } => item !== null
    )
    .sort((a, b) => {
      if (a.diff !== b.diff) {
        return a.diff - b.diff;
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

        // Get logged-in user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        console.log("AUTH USER:", user);

        if (authError) {
          console.error(
            "AUTH ERROR:",
            authError
          );

          setError(
            "Unable to authenticate student."
          );

          return;
        }

        if (!user) {
          setError(
            "No logged-in student found."
          );

          return;
        }

        // Get student profile
        const {
          data: studentData,
          error: studentError,
        } = await supabase
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
          .eq("auth_id", user.id)
          .single();

        console.log(
          "STUDENT:",
          studentData
        );

        if (studentError) {
          console.error(
            "STUDENT ERROR:",
            studentError
          );

          setError(
            "Unable to load student information."
          );

          return;
        }

        if (!studentData) {
          setError(
            "Student profile not found."
          );

          return;
        }

        setStudent(studentData);

        // Get student's schedules
        const {
          data: scheduleData,
          error: scheduleError,
        } = await supabase
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
          console.error(
            "SCHEDULE ERROR:",
            scheduleError
          );

          setError(
            "Unable to load your lesson schedule."
          );

          return;
        }

        setSchedules(
          scheduleData || []
        );
      } catch (dashboardError) {
        console.error(
          "DASHBOARD ERROR:",
          dashboardError
        );

        setError(
          "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const nextLesson =
    getNextLesson(schedules);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-lg font-semibold text-slate-600">
          Loading dashboard...
        </p>
      </div>
    );
  }

  // Error state
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
    <>
      {/* Header */}

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

      {/* Summary Cards */}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        {/* Next Lesson */}

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
              nextLesson.tutors?.[0]?.full_name ||
                  "Subject"}
              </p>
            </>
          ) : (
            <h3 className="mt-3 text-xl font-extrabold text-slate-900">
              No lesson scheduled
            </h3>
          )}
        </div>

        {/* Package */}

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

        {/* Lessons */}

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

        {/* Progress */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <TrendingUp
            className="text-yellow-600"
            size={32}
          />

          <p className="mt-5 font-bold text-slate-700">
            Progress
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            Getting started
          </h3>
        </div>
      </div>

      {/* Upcoming Lesson + Updates */}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        {/* Upcoming Lesson */}

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
                nextLesson.subjects?.[0]?.name ||
                  "Lesson"}
              </h3>

              <p className="mt-2 text-lg font-semibold text-slate-700">
                {nextLesson.day}
                {" — "}
                {nextLesson.time}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Tutor:{" "}
                <span className="font-semibold text-slate-900">
                  {nextLesson.tutors
                    ?.full_name ||
                    "Tutor not assigned"}
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

        {/* Latest Updates */}

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
            Welcome to GS Academy. Your
            lessons and updates will appear
            here.
          </p>
        </div>
      </div>

      {/* Full Timetable */}

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
                        {schedule.subjects?.name ||
                          "Subject"}
                      </h3>

                      <p className="mt-1 font-semibold text-slate-700">
                        {schedule.day}
                        {" — "}
                        {schedule.time}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Tutor:{" "}
                        <span className="font-semibold text-slate-800">
                          {schedule.tutors
                            ?.full_name ||
                            "Not assigned"}
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
    </>
  );
}