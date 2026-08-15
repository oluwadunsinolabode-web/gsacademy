"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ClipboardCheck,
  BookOpen,
  Users,
  Bell,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

/* =====================================================
   TYPES
===================================================== */

type Tutor = {
  id: string;
  full_name: string | null;
};

type StudentSchedule = {
  id: string;
  student_id: string;
  subject_id: string;
  tutor_id: string | null;
  day: string | null;
  time: string | null;
  meet_link: string | null;
};

type Student = {
  id: string;
  full_name: string | null;
};

type Subject = {
  id: string;
  name: string;
};

type DashboardAssignment = {
  id: string;
  student_id: string;
  subject_id: string;
  day: string | null;
  time_slot: string | null;
  google_meet_link: string | null;
  status: string | null;
  active: boolean;
};

type DashboardData = {
  tutor: Tutor | null;

  studentCount: number;

  todaysClasses: number;

  pendingClasswork: number;

  homeworkWaiting: number;

  assignments: DashboardAssignment[];

  students: Record<string, Student>;

  subjects: Record<string, Subject>;
};

/* =====================================================
   DAY HELPERS
===================================================== */

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/* =====================================================
   TIME HELPERS
===================================================== */

/**
 * Converts common time formats into minutes after midnight.
 *
 * Supports:
 *
 * 10:00 AM
 * 10:30AM
 * 2:30 PM
 * 14:00
 */

function parseTimeToMinutes(
  timeString: string | null
): number | null {
  if (!timeString) {
    return null;
  }

  const value = timeString
    .trim()
    .toUpperCase();

  /* ==========================
     12-HOUR FORMAT
  ========================== */

  const twelveHourMatch = value.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/
  );

  if (twelveHourMatch) {
    let hour = Number(
      twelveHourMatch[1]
    );

    const minute = Number(
      twelveHourMatch[2] || "0"
    );

    const period =
      twelveHourMatch[3];

    if (
      hour < 1 ||
      hour > 12 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }

    if (period === "AM") {
      if (hour === 12) {
        hour = 0;
      }
    } else {
      if (hour !== 12) {
        hour += 12;
      }
    }

    return hour * 60 + minute;
  }

  /* ==========================
     24-HOUR FORMAT
  ========================== */

  const twentyFourHourMatch =
    value.match(
      /^(\d{1,2}):(\d{2})$/
    );

  if (twentyFourHourMatch) {
    const hour = Number(
      twentyFourHourMatch[1]
    );

    const minute = Number(
      twentyFourHourMatch[2]
    );

    if (
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }

    return hour * 60 + minute;
  }

  return null;
}

/* =====================================================
   EXTRACT START TIME
===================================================== */

function getStartTimeMinutes(
  timeSlot: string | null
): number | null {
  if (!timeSlot) {
    return null;
  }

  const normalized =
    timeSlot
      .trim()
      .toUpperCase();

  /*
   * Examples:
   *
   * 10:00 AM - 11:30 AM
   * 10:00 AM – 11:30 AM
   * 10:00 AM to 11:30 AM
   * 10:00 AM
   */

  const match =
    normalized.match(
      /\d{1,2}(?::\d{2})?\s*(?:AM|PM)?/
    );

  if (!match) {
    return null;
  }

  return parseTimeToMinutes(
    match[0]
  );
}

/* =====================================================
   NEXT LESSON
===================================================== */

type UpcomingLesson = {
  assignment: DashboardAssignment;

  date: Date;

  startMinutes: number;
};

function getNextLesson(
  assignments: DashboardAssignment[]
): UpcomingLesson | null {
  const now = new Date();

  let closestLesson:
    | UpcomingLesson
    | null = null;

  /*
   * Search the next 7 days.
   */

  for (
    let offset = 0;
    offset < 7;
    offset++
  ) {
    const candidateDate =
      new Date(now);

    candidateDate.setDate(
      now.getDate() + offset
    );

    candidateDate.setHours(
      0,
      0,
      0,
      0
    );

    const candidateDay =
      DAY_NAMES[
        candidateDate.getDay()
      ];

    const matchingAssignments =
      assignments.filter(
        (assignment) =>
          assignment.active !== false &&
          assignment.status
            ?.trim()
            .toLowerCase() ===
            "scheduled" &&
          assignment.day
            ?.trim()
            .toLowerCase() ===
            candidateDay.toLowerCase()
      );

    for (const assignment of matchingAssignments) {
      const startMinutes =
        getStartTimeMinutes(
          assignment.time_slot
        );

      if (
        startMinutes === null
      ) {
        continue;
      }

      const lessonDate =
        new Date(candidateDate);

      lessonDate.setHours(
        Math.floor(
          startMinutes / 60
        ),
        startMinutes % 60,
        0,
        0
      );

      /*
       * Do not show a lesson
       * that has already passed.
       */

      if (
        lessonDate.getTime() <
        now.getTime()
      ) {
        continue;
      }

      const lesson: UpcomingLesson =
        {
          assignment,
          date: lessonDate,
          startMinutes,
        };

      if (
        !closestLesson ||
        lesson.date.getTime() <
          closestLesson.date.getTime()
      ) {
        closestLesson = lesson;
      }
    }
  }

  return closestLesson;
}

/* =====================================================
   FORMAT LESSON DATE
===================================================== */

function formatLessonDate(
  date: Date
): string {
  const now = new Date();

  const today =
    new Date(now);

  today.setHours(
    0,
    0,
    0,
    0
  );

  const lessonDay =
    new Date(date);

  lessonDay.setHours(
    0,
    0,
    0,
    0
  );

  const difference =
    Math.round(
      (lessonDay.getTime() -
        today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

  if (difference === 0) {
    return "Today";
  }

  if (difference === 1) {
    return "Tomorrow";
  }

  return date.toLocaleDateString(
    undefined,
    {
      weekday: "long",
      month: "short",
      day: "numeric",
    }
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function TutorDashboardPage() {
  const [data, setData] =
    useState<DashboardData>({
      tutor: null,

      studentCount: 0,

      todaysClasses: 0,

      pendingClasswork: 0,

      homeworkWaiting: 0,

      assignments: [],

      students: {},

      subjects: {},
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ===================================================
     LOAD DASHBOARD
  =================================================== */

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      setError("");

      /* ================================================
         1. LOGGED-IN USER
      ================================================ */

      const {
        data: {
          user,
        },
        error: authError,
      } =
        await supabase.auth.getUser();

      if (
        authError ||
        !user
      ) {
        throw new Error(
          "You must be logged in as a tutor."
        );
      }

      /* ================================================
         2. TUTOR
      ================================================ */

      const {
        data: tutor,
        error: tutorError,
      } =
        await supabase
          .from("tutors")
          .select(
            "id, full_name"
          )
          .eq(
            "auth_id",
            user.id
          )
          .single();

      if (
        tutorError ||
        !tutor
      ) {
        console.error(
          "Tutor query error:",
          tutorError
        );

        throw new Error(
          tutorError?.message ||
            "Tutor profile not found."
        );
      }

      /* ================================================
         3. STUDENT SCHEDULES
         
         THIS IS NOW THE MAIN SOURCE
         FOR TUTOR CLASSES.
      ================================================ */

      const {
        data: schedules,
        error:
          schedulesError,
      } =
        await supabase
          .from(
            "student_schedules"
          )
          .select(
            `
              id,
              student_id,
              subject_id,
              tutor_id,
              day,
              time,
              meet_link
            `
          )
          .eq(
            "tutor_id",
            tutor.id
          );

      if (
        schedulesError
      ) {
        console.error(
          "Student schedules error:",
          schedulesError
        );

        throw new Error(
          schedulesError.message
        );
      }

      const tutorSchedules:
        StudentSchedule[] =
        schedules || [];

      /* ================================================
         4. UNIQUE STUDENTS
      ================================================ */

      const uniqueStudentIds =
        Array.from(
          new Set(
            tutorSchedules.map(
              (schedule) =>
                schedule.student_id
            )
          )
        );

      let studentsMap:
        Record<
          string,
          Student
        > = {};

      if (
        uniqueStudentIds.length >
        0
      ) {
        const {
          data: students,
          error:
            studentsError,
        } =
          await supabase
            .from("students")
            .select(
              "id, full_name"
            )
            .in(
              "id",
              uniqueStudentIds
            );

        if (
          studentsError
        ) {
          console.error(
            "Students query error:",
            studentsError
          );

          throw new Error(
            studentsError.message
          );
        }

        studentsMap =
          Object.fromEntries(
            (
              students || []
            ).map(
              (student) => [
                student.id,
                student,
              ]
            )
          );
      }

      /* ================================================
         5. UNIQUE SUBJECTS
      ================================================ */

      const uniqueSubjectIds =
        Array.from(
          new Set(
            tutorSchedules.map(
              (schedule) =>
                schedule.subject_id
            )
          )
        );

      let subjectsMap:
        Record<
          string,
          Subject
        > = {};

      if (
        uniqueSubjectIds.length >
        0
      ) {
        const {
          data: subjects,
          error:
            subjectsError,
        } =
          await supabase
            .from("subjects")
            .select(
              "id, name"
            )
            .in(
              "id",
              uniqueSubjectIds
            );

        if (
          subjectsError
        ) {
          console.error(
            "Subjects query error:",
            subjectsError
          );

          /*
           * Don't completely kill
           * the dashboard if subject
           * lookup fails.
           */

          subjectsMap = {};
        } else {
          subjectsMap =
            Object.fromEntries(
              (
                subjects || []
              ).map(
                (subject) => [
                  subject.id,
                  subject,
                ]
              )
            );
        }
      }

      /* ================================================
         6. CONVERT SCHEDULES
         
         student_schedules:
         
         day
         time
         meet_link
         
         becomes dashboard:
         
         day
         time_slot
         google_meet_link
         status
         active
      ================================================ */

      const tutorAssignments:
        DashboardAssignment[] =
        tutorSchedules.map(
          (schedule) => ({
            id: schedule.id,

            student_id:
              schedule.student_id,

            subject_id:
              schedule.subject_id,

            day:
              schedule.day,

            time_slot:
              schedule.time,

            google_meet_link:
              schedule.meet_link,

            /*
             * student_schedules
             * represents saved schedules,
             * therefore treat them as
             * scheduled.
             */

            status:
              schedule.day &&
              schedule.time
                ? "scheduled"
                : "unscheduled",

            active: true,
          })
        );

      /* ================================================
         7. TODAY'S CLASSES
      ================================================ */

      const now =
        new Date();

      const todayName =
        DAY_NAMES[
          now.getDay()
        ];

      const todaysAssignments =
        tutorAssignments.filter(
          (assignment) =>
            assignment.day
              ?.trim()
              .toLowerCase() ===
              todayName
                .toLowerCase() &&
            assignment.status
              ?.trim()
              .toLowerCase() ===
              "scheduled"
        );

      /* ================================================
         8. PENDING CLASSWORK
      ================================================ */

      let pendingClasswork =
        0;

      const {
        data:
          tutorClassworks,
        error:
          classworkError,
      } =
        await supabase
          .from("classworks")
          .select("id")
          .eq(
            "tutor_id",
            tutor.id
          );

      if (
        classworkError
      ) {
        console.error(
          "Classwork query error:",
          classworkError
        );
      } else if (
        tutorClassworks &&
        tutorClassworks.length >
          0
      ) {
        const classworkIds =
          tutorClassworks.map(
            (item) =>
              item.id
          );

        const {
          data:
            submissions,
          error:
            submissionsError,
        } =
          await supabase
            .from(
              "classwork_submissions"
            )
            .select(
              "id, status"
            )
            .in(
              "classwork_id",
              classworkIds
            );

        if (
          submissionsError
        ) {
          console.error(
            "Submission query error:",
            submissionsError
          );
        } else {
          pendingClasswork =
            (
              submissions || []
            ).filter(
              (submission) => {
                const status =
                  submission.status
                    ?.trim()
                    .toLowerCase();

                return (
                  status ===
                    "submitted" ||
                  status ===
                    "pending" ||
                  status ===
                    "awaiting_review"
                );
              }
            ).length;
        }
      }

      /* ================================================
         9. HOMEWORK WAITING
      ================================================ */

      let homeworkWaiting =
        0;

      const {
        data:
          tutorHomework,
        error:
          homeworkError,
      } =
        await supabase
          .from("homework")
          .select(
            "id, status"
          )
          .eq(
            "tutor_id",
            tutor.id
          );

      if (
        homeworkError
      ) {
        console.error(
          "Homework query error:",
          homeworkError
        );
      } else {
        homeworkWaiting =
          (
            tutorHomework || []
          ).filter(
            (homework) => {
              const status =
                homework.status
                  ?.trim()
                  .toLowerCase();

              return (
                status ===
                  "pending" ||
                status ===
                  "submitted" ||
                status ===
                  "waiting"
              );
            }
          ).length;
      }

      /* ================================================
         10. SAVE DASHBOARD DATA
      ================================================ */

      setData({
        tutor,

        studentCount:
          uniqueStudentIds.length,

        todaysClasses:
          todaysAssignments.length,

        pendingClasswork,

        homeworkWaiting,

        assignments:
          tutorAssignments,

        students:
          studentsMap,

        subjects:
          subjectsMap,
      });
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     TRUE NEXT LESSON
  ===================================================== */

  const nextLesson =
    useMemo(() => {
      return getNextLesson(
        data.assignments
      );
    }, [
      data.assignments,
    ]);

  /* =====================================================
     TODAY'S SCHEDULE
  ===================================================== */

  const todaysSchedule =
    useMemo(() => {
      const today =
        new Date();

      const todayName =
        DAY_NAMES[
          today.getDay()
        ];

      return data.assignments
        .filter(
          (assignment) =>
            assignment.day
              ?.toLowerCase()
              .trim() ===
              todayName
                .toLowerCase()
                .trim() &&
            assignment.status
              ?.toLowerCase()
              .trim() ===
              "scheduled"
        )
        .sort((a, b) => {
          const aTime =
            getStartTimeMinutes(
              a.time_slot
            ) ?? 9999;

          const bTime =
            getStartTimeMinutes(
              b.time_slot
            ) ?? 9999;

          return (
            aTime - bTime
          );
        });
    }, [
      data.assignments,
    ]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
          <Loader2
            size={35}
            className="mx-auto animate-spin text-yellow-500"
          />

          <p className="mt-4 text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-red-50 p-8">
          <h1 className="text-2xl font-bold text-red-700">
            Unable to load dashboard
          </h1>

          <p className="mt-3 text-red-600">
            {error}
          </p>

          <button
            onClick={
              loadDashboard
            }
            className="mt-6 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="mx-auto max-w-7xl">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <h1 className="text-4xl font-extrabold text-slate-900">
          Welcome Back,{" "}
          {data.tutor?.full_name ||
            "Tutor"}{" "}
          👋
        </h1>

        <p className="mt-3 text-slate-700">
          Here's everything happening
          in your classroom today.
        </p>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        {/* TODAY'S CLASSES */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <CalendarDays
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 font-semibold text-slate-600">
            Today's Classes
          </p>

          <h2 className="mt-2 text-4xl font-extrabold text-slate-900">
            {data.todaysClasses}
          </h2>
        </div>

        {/* PENDING CLASSWORK */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <ClipboardCheck
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 font-semibold text-slate-600">
            Pending Classwork
          </p>

          <h2 className="mt-2 text-4xl font-extrabold text-red-600">
            {data.pendingClasswork}
          </h2>
        </div>

        {/* HOMEWORK */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <BookOpen
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 font-semibold text-slate-600">
            Homework Waiting
          </p>

          <h2 className="mt-2 text-4xl font-extrabold text-slate-900">
            {data.homeworkWaiting}
          </h2>
        </div>

        {/* STUDENTS */}

        <Link
          href="/tutor-dashboard/students"
          className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <Users
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 font-semibold text-slate-600">
            My Students
          </p>

          <h2 className="mt-2 text-4xl font-extrabold text-green-600">
            {data.studentCount}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Students assigned to you
          </p>
        </Link>
      </div>

      {/* =================================================
          NEXT LESSON
      ================================================= */}

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-3">

              <CalendarDays
                size={30}
                className="text-yellow-500"
              />

              <h2 className="text-2xl font-bold text-slate-900">
                Next Lesson
              </h2>
            </div>

            <p className="mt-2 text-slate-500">
              Your closest upcoming scheduled class.
            </p>
          </div>

          {nextLesson && (
            <div className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-700">
              {formatLessonDate(
                nextLesson.date
              )}
            </div>
          )}
        </div>

        {!nextLesson ? (

          <div className="mt-8 rounded-2xl bg-slate-50 p-7 text-center">

            <CalendarDays
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No upcoming lesson found
            </h3>

            <p className="mt-2 text-slate-500">
              You currently have no future
              scheduled lesson with a valid
              time.
            </p>
          </div>

        ) : (

          <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-6">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              {/* LESSON DETAILS */}

              <div>

                <p className="text-sm font-extrabold uppercase tracking-wider text-yellow-700">
                  {formatLessonDate(
                    nextLesson.date
                  )}
                </p>

                <h3 className="mt-2 text-2xl font-black text-slate-950">
                  {data.students[
                    nextLesson
                      .assignment
                      .student_id
                  ]?.full_name ||
                    "Student"}
                </h3>

                <p className="mt-2 text-slate-600">
                  {data.subjects[
                    nextLesson
                      .assignment
                      .subject_id
                  ]?.name ||
                    "Scheduled lesson"}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">

                  <span className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
                    {nextLesson
                      .assignment
                      .day ||
                      "Day not set"}
                  </span>

                  <span className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
                    {nextLesson
                      .assignment
                      .time_slot ||
                      "Time not set"}
                  </span>

                </div>
              </div>

              {/* START CLASS */}

              <div className="shrink-0">

                {nextLesson
                  .assignment
                  .google_meet_link ? (

                  <a
                    href={
                      nextLesson
                        .assignment
                        .google_meet_link
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-7 py-4 font-extrabold text-slate-900 shadow-sm transition hover:bg-yellow-400 sm:w-auto"
                  >
                    Start Class

                    <ArrowRight
                      size={19}
                    />
                  </a>

                ) : (

                  <Link
                    href={`/tutor-dashboard/students/${nextLesson.assignment.student_id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-4 font-extrabold text-white transition hover:bg-slate-800 sm:w-auto"
                  >
                    Open Student

                    <ArrowRight
                      size={19}
                    />
                  </Link>

                )}

              </div>

            </div>
          </div>
        )}
      </div>

      {/* =================================================
          MAIN SECTION
      ================================================= */}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        {/* =================================================
            TODAY'S SCHEDULE
        ================================================= */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold text-slate-900">
              Today's Schedule
            </h2>

            <CalendarDays
              className="text-yellow-500"
              size={28}
            />
          </div>

          {todaysSchedule.length ===
          0 ? (

            <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-center">

              <CalendarDays
                size={40}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 font-semibold text-slate-600">
                No classes scheduled today.
              </p>
            </div>

          ) : (

            <div className="mt-8 space-y-5">

              {todaysSchedule.map(
                (
                  assignment
                ) => {

                  const student =
                    data.students[
                      assignment
                        .student_id
                    ];

                  const subject =
                    data.subjects[
                      assignment
                        .subject_id
                    ];

                  return (
                    <div
                      key={
                        assignment.id
                      }
                      className="rounded-2xl border p-5"
                    >

                      <p className="font-semibold text-yellow-600">
                        {assignment.time_slot ||
                          "Time not set"}
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-slate-900">
                        {subject?.name ||
                          "Class"}
                      </h3>

                      <p className="mt-2 text-slate-600">
                        {student?.full_name ||
                          "Student"}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        {assignment.day ||
                          "Day not set"}
                      </p>

                      {assignment.google_meet_link ? (

                        <a
                          href={
                            assignment.google_meet_link
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-900 hover:bg-yellow-400"
                        >
                          Start Class
                        </a>

                      ) : (

                        <Link
                          href={`/tutor-dashboard/students/${assignment.student_id}`}
                          className="mt-5 inline-flex rounded-xl bg-slate-900 px-6 py-3 font-bold text-white hover:bg-slate-800"
                        >
                          Open Student
                        </Link>

                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}
        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Quick Actions
          </h2>

          <div className="mt-8 grid gap-5">

            <Link
              href="/tutor-dashboard/homework"
              className="flex items-center justify-between rounded-2xl border p-5 transition hover:bg-yellow-50"
            >
              <span className="font-semibold">
                Assign Homework
              </span>

              <ArrowRight
                size={20}
              />
            </Link>

            <Link
              href="/tutor-dashboard/resources"
              className="flex items-center justify-between rounded-2xl border p-5 transition hover:bg-yellow-50"
            >
              <span className="font-semibold">
                Upload Learning Resource
              </span>

              <ArrowRight
                size={20}
              />
            </Link>

            <Link
              href="/tutor-dashboard/students"
              className="flex items-center justify-between rounded-2xl border p-5 transition hover:bg-yellow-50"
            >
              <span className="font-semibold">
                Open Students Workspace
              </span>

              <ArrowRight
                size={20}
              />
            </Link>

            <Link
              href="/tutor-dashboard/classwork"
              className="flex items-center justify-between rounded-2xl border p-5 transition hover:bg-yellow-50"
            >
              <span className="font-semibold">
                Create Classwork
              </span>

              <ArrowRight
                size={20}
              />
            </Link>

          </div>
        </div>
      </div>

      {/* =================================================
          RECENT ACTIVITY + TEACHING OVERVIEW
      ================================================= */}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        {/* RECENT ACTIVITY */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center gap-3">

            <Bell
              size={28}
              className="text-yellow-500"
            />

            <h2 className="text-2xl font-bold">
              Recent Activity
            </h2>
          </div>

          <div className="mt-8 space-y-5">

            <p className="text-slate-600">
              👥 You currently have{" "}
              <strong className="text-slate-900">
                {data.studentCount}
              </strong>{" "}
              assigned student
              {data.studentCount ===
              1
                ? ""
                : "s"}.
            </p>

            <p className="text-slate-600">
              📅 You have{" "}
              <strong className="text-slate-900">
                {data.todaysClasses}
              </strong>{" "}
              scheduled class
              {data.todaysClasses ===
              1
                ? ""
                : "es"}{" "}
              today.
            </p>

            <p className="text-slate-600">
              📝{" "}
              <strong className="text-slate-900">
                {data.pendingClasswork}
              </strong>{" "}
              classwork submission
              {data.pendingClasswork ===
              1
                ? ""
                : "s"} waiting for review.
            </p>

            <p className="text-slate-600">
              📚{" "}
              <strong className="text-slate-900">
                {data.homeworkWaiting}
              </strong>{" "}
              homework item
              {data.homeworkWaiting ===
              1
                ? ""
                : "s"} waiting.
            </p>

          </div>
        </div>

        {/* TEACHING OVERVIEW */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center gap-3">

            <TrendingUp
              size={28}
              className="text-yellow-500"
            />

            <h2 className="text-2xl font-bold">
              Teaching Overview
            </h2>
          </div>

          <div className="mt-8 space-y-5">

            <div className="flex justify-between">
              <span className="text-slate-600">
                Assigned Students
              </span>

              <strong>
                {data.studentCount}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">
                Classes Today
              </span>

              <strong>
                {data.todaysClasses}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">
                Pending Classwork
              </span>

              <strong>
                {data.pendingClasswork}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">
                Homework Waiting
              </span>

              <strong>
                {data.homeworkWaiting}
              </strong>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}