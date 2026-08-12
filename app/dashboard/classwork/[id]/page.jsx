"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  auth_id: string;
  full_name: string;
  email: string | null;
};

type Schedule = {
  id: string;
  day: string;
  time_slot: string;
  google_meet_link: string | null;

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
  subject: string;
  title: string;
  created_at: string;
};

/* =========================================================
   HELPERS
========================================================= */

function getSubjectName(schedule: Schedule): string {
  if (!schedule.subjects) {
    return "Subject";
  }

  if (Array.isArray(schedule.subjects)) {
    return schedule.subjects[0]?.name || "Subject";
  }

  return schedule.subjects.name || "Subject";
}

function getTutorName(schedule: Schedule): string {
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

function normalizeSubject(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function subjectsMatch(
  first: string,
  second: string
): boolean {
  const a = normalizeSubject(first);
  const b = normalizeSubject(second);

  if (a === b) {
    return true;
  }

  if (
    (a === "maths" && b === "mathematics") ||
    (a === "mathematics" && b === "maths")
  ) {
    return true;
  }

  return false;
}

/* =========================================================
   PAGE
========================================================= */

export default function ClassPage() {
  const [student, setStudent] =
    useState<Student | null>(null);

  const [schedule, setSchedule] =
    useState<Schedule | null>(null);

  const [classworks, setClassworks] =
    useState<Classwork[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =========================================================
     LOAD CLASSWORK LIST
  ========================================================= */

  useEffect(() => {
    async function loadClassPage() {
      try {
        setLoading(true);
        setError("");

        /* ---------------------------------------------------
           GET SCHEDULE ID
        --------------------------------------------------- */

        const params = new URLSearchParams(
          window.location.search
        );

        const scheduleId =
          params.get("schedule_id");

        if (!scheduleId) {
          throw new Error(
            "Invalid classroom link. No schedule was selected."
          );
        }

        /* ---------------------------------------------------
           GET LOGGED-IN STUDENT
        --------------------------------------------------- */

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error(
            "You must be logged in."
          );
        }

        /* ---------------------------------------------------
           GET STUDENT PROFILE
        --------------------------------------------------- */

        const {
          data: studentData,
          error: studentError,
        } = await supabase
          .from("students")
          .select(`
            id,
            auth_id,
            full_name,
            email
          `)
          .eq("auth_id", user.id)
          .single();

        if (
          studentError ||
          !studentData
        ) {
          throw new Error(
            studentError?.message ||
              "Student profile could not be found."
          );
        }

        setStudent(studentData);

        /* ---------------------------------------------------
           GET SELECTED STUDENT CLASS
        --------------------------------------------------- */

        const {
          data: scheduleData,
          error: scheduleError,
        } = await supabase
          .from("student_schedules")
          .select(`
            id,
            day,
            time_slot,
            google_meet_link,

            subjects (
              id,
              name
            ),

            tutors (
              id,
              full_name
            )
          `)
          .eq("id", scheduleId)
          .eq(
            "student_id",
            studentData.id
          )
          .single();

        if (
          scheduleError ||
          !scheduleData
        ) {
          throw new Error(
            scheduleError?.message ||
              "This class could not be found."
          );
        }

        const selectedSchedule =
          scheduleData as Schedule;

        setSchedule(
          selectedSchedule
        );

        /* ---------------------------------------------------
           GET SUBJECT FROM SELECTED CLASS
        --------------------------------------------------- */

        const actualSubject =
          getSubjectName(
            selectedSchedule
          );

        /* ---------------------------------------------------
           GET CLASSWORK ASSIGNED TO STUDENT
        --------------------------------------------------- */

        const {
          data: assignmentData,
          error: assignmentError,
        } = await supabase
          .from("classwork_assignments")
          .select(`
            id,
            classwork_id,
            student_id
          `)
          .eq(
            "student_id",
            studentData.id
          );

        if (assignmentError) {
          throw new Error(
            assignmentError.message
          );
        }

        const classworkIds =
          (assignmentData || [])
            .map(
              (assignment) =>
                assignment.classwork_id
            )
            .filter(Boolean);

        /* ---------------------------------------------------
           NO ASSIGNMENTS
        --------------------------------------------------- */

        if (
          classworkIds.length === 0
        ) {
          setClassworks([]);
          return;
        }

        /* ---------------------------------------------------
           GET ASSIGNED CLASSWORK
        --------------------------------------------------- */

        const {
          data: classworkData,
          error: classworkError,
        } = await supabase
          .from("classworks")
          .select(`
            id,
            subject,
            title,
            created_at
          `)
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

        if (classworkError) {
          throw new Error(
            classworkError.message
          );
        }

        /* ---------------------------------------------------
           ONLY CLASSWORK FOR SELECTED SUBJECT
        --------------------------------------------------- */

        const subjectClassworks =
          (classworkData || []).filter(
            (work) =>
              subjectsMatch(
                work.subject,
                actualSubject
              )
          ) as Classwork[];

        setClassworks(
          subjectClassworks
        );
      } catch (err) {
        console.error(
          "CLASSWORK LIST ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load classwork."
        );
      } finally {
        setLoading(false);
      }
    }

    loadClassPage();
  }, []);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-slate-50">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">

            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-yellow-500" />

            <p className="mt-4 text-sm font-semibold text-slate-500">
              Loading classwork...
            </p>

          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-slate-50">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">

          <Link
            href="/dashboard"
            className="inline-flex max-w-full items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>

          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5 sm:mt-8 sm:p-6">
            <p className="break-words text-sm font-semibold leading-6 text-red-700">
              {error}
            </p>
          </div>

        </div>
      </main>
    );
  }

  /* =========================================================
     CLASS DETAILS
  ========================================================= */

  const subjectName =
    schedule
      ? getSubjectName(schedule)
      : "Subject";

  const tutorName =
    schedule
      ? getTutorName(schedule)
      : "Tutor";

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-50">

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">

        {/* =================================================
            BACK TO DASHBOARD
        ================================================= */}

        <Link
          href="/dashboard"
          className="inline-flex max-w-full items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft
            size={16}
            className="shrink-0"
          />
          <span>Back to Dashboard</span>
        </Link>

        {/* =================================================
            CLASS HEADER
        ================================================= */}

        <header className="mt-6 sm:mt-8">

          <div className="flex min-w-0 items-center gap-3 sm:gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 sm:h-14 sm:w-14">

              <BookOpen
                size={24}
                className="text-slate-950 sm:h-7 sm:w-7"
              />

            </div>

            <div className="min-w-0">

              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-yellow-600 sm:text-xs sm:tracking-[0.2em]">
                Classwork
              </p>

              <h1 className="mt-1 break-words text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
                {subjectName}
              </h1>

            </div>

          </div>

          {schedule && (
            <div className="mt-4 space-y-1 text-sm leading-6 text-slate-500 sm:mt-5">

              <p className="break-words">
                <span className="font-semibold text-slate-700">
                  {schedule.day}
                </span>{" "}
                —{" "}
                <span className="break-words">
                  {schedule.time_slot}
                </span>
              </p>

              <p className="break-words">
                Tutor:{" "}
                <span className="font-bold text-slate-700">
                  {tutorName}
                </span>
              </p>

            </div>
          )}

        </header>

        {/* =================================================
            CLASSWORK LIST
        ================================================= */}

        <section className="mt-8 w-full sm:mt-12">

          <div className="mb-5 sm:mb-6">

            <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
              Classwork
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Select an assignment to view its details.
            </p>

          </div>

          {/* =================================================
              NO CLASSWORK
          ================================================= */}

          {classworks.length === 0 ? (

            <div className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:px-6 sm:py-14">

              <h3 className="text-lg font-bold text-slate-900">
                No classwork yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Your tutor has not assigned any
                classwork for this subject yet.
              </p>

            </div>

          ) : (

            /* =================================================
               TITLE-ONLY LIST
            ================================================= */

            <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              {classworks.map(
                (work, index) => (

                  <Link
                    key={work.id}
                    href={`/dashboard/classwork/${work.id}`}
                    className={`group flex w-full min-w-0 items-center gap-3 px-4 py-5 transition hover:bg-slate-50 sm:gap-5 sm:px-6 sm:py-6 ${
                      index !==
                      classworks.length - 1
                        ? "border-b border-slate-200"
                        : ""
                    }`}
                  >

                    {/* -----------------------------------------
                        TITLE
                    ----------------------------------------- */}

                    <div className="min-w-0 flex-1">

                      <h3 className="break-words text-base font-extrabold leading-6 text-slate-900 transition group-hover:text-yellow-600 sm:text-lg sm:leading-7">
                        {work.title}
                      </h3>

                    </div>

                    {/* -----------------------------------------
                        ARROW
                    ----------------------------------------- */}

                    <ArrowRight
                      size={19}
                      className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900 sm:h-5 sm:w-5"
                    />

                  </Link>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}