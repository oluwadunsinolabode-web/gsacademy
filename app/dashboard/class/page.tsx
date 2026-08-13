"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
   LOADING COMPONENT
========================================================= */

function ClassPageLoading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

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
   ACTUAL CLASS PAGE
========================================================= */

function ClassPageContent() {
  const searchParams = useSearchParams();

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
     LOAD CLASS PAGE
  ========================================================= */

  useEffect(() => {
    async function loadClassPage() {
      try {
        setLoading(true);
        setError("");

        /* ---------------------------------------------------
           GET SCHEDULE ID
        --------------------------------------------------- */

        const scheduleId =
          searchParams.get("schedule_id");

        console.log(
          "===================================="
        );

        console.log(
          "CLASS PAGE URL:",
          window.location.href
        );

        console.log(
          "ALL QUERY PARAMS:",
          Object.fromEntries(
            searchParams.entries()
          )
        );

        console.log(
          "SCHEDULE ID:",
          scheduleId
        );

        console.log(
          "===================================="
        );

        if (!scheduleId) {
          throw new Error(
            "Invalid classroom link. No schedule was selected."
          );
        }

        /* ---------------------------------------------------
           GET LOGGED-IN USER
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

        setStudent(
          studentData as Student
        );

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
          `)
          .eq(
            "id",
            scheduleId
          )
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

        console.log(
          "SELECTED SUBJECT:",
          actualSubject
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

        console.log(
          "ASSIGNED CLASSWORK IDS:",
          classworkIds
        );

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

        console.log(
          "ALL ASSIGNED CLASSWORK:",
          classworkData
        );

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

        console.log(
          "SUBJECT CLASSWORK:",
          subjectClassworks
        );

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

  }, [searchParams]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return <ClassPageLoading />;
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">

        <div className="mx-auto max-w-5xl px-6 py-10">

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6">

            <p className="text-sm font-semibold text-red-700">
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
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* =================================================
            BACK TO DASHBOARD
        ================================================= */}

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* =================================================
            CLASS HEADER
        ================================================= */}

        <header className="mt-8">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500">

              <BookOpen
                size={28}
                className="text-slate-950"
              />

            </div>

            <div>

              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-yellow-600">
                Classwork
              </p>

              <h1 className="mt-1 text-4xl font-black tracking-tight text-slate-950">
                {subjectName}
              </h1>

            </div>

          </div>

          {schedule && (
            <div className="mt-5 space-y-1 text-sm text-slate-500">

              <p>

                <span className="font-semibold text-slate-700">
                  {schedule.day}
                </span>

                {" — "}

                {schedule.time}

              </p>

              <p>

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

        <section className="mt-12">

          <div className="mb-6">

            <h2 className="text-2xl font-black text-slate-950">
              Classwork
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select an assignment to view its details.
            </p>

          </div>

          {/* =================================================
              NO CLASSWORK
          ================================================= */}

          {classworks.length === 0 ? (

            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">

              <h3 className="text-lg font-bold text-slate-900">
                No classwork yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your tutor has not assigned any
                classwork for this subject yet.
              </p>

            </div>

          ) : (

            /* =================================================
               TITLE-ONLY LIST
            ================================================= */

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              {classworks.map(
                (
                  work,
                  index
                ) => (

                  <Link
                    key={work.id}
                    href={`/dashboard/classwork/${work.id}`}
                    className={`group flex items-center justify-between gap-5 px-6 py-6 transition hover:bg-slate-50 ${
                      index !==
                      classworks.length - 1
                        ? "border-b border-slate-200"
                        : ""
                    }`}
                  >

                    <h3 className="min-w-0 truncate text-lg font-extrabold text-slate-900 transition group-hover:text-yellow-600">
                      {work.title}
                    </h3>

                    <ArrowRight
                      size={20}
                      className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900"
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

/* =========================================================
   MAIN PAGE
   Suspense fixes Vercel prerender error caused by
   useSearchParams()
========================================================= */

export default function ClassPage() {
  return (
    <Suspense
      fallback={
        <ClassPageLoading />
      }
    >
      <ClassPageContent />
    </Suspense>
  );
}