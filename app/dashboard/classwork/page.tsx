"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Video } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Classwork = {
  id: string;
  subject: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string | null;
  created_at: string;
};

type Schedule = {
  id: string;
  subject: string;
  day: string;
  start_time: string;
  end_time: string;
  tutor_name: string;
  meeting_link: string | null;
};

export default function ClassPage() {
  const [classworks, setClassworks] =
    useState<Classwork[]>([]);

  const [schedule, setSchedule] =
    useState<Schedule | null>(null);

  const [subject, setSubject] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadClassPage() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams(
          window.location.search
        );

        const subjectFromUrl =
          params.get("subject");

        const scheduleId =
          params.get("schedule_id");

        if (!subjectFromUrl) {
          throw new Error(
            "No subject was selected."
          );
        }

        setSubject(subjectFromUrl);

        /* ==========================================
           GET LOGGED-IN STUDENT
        ========================================== */

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error(
            "You must be logged in."
          );
        }

        /* ==========================================
           GET STUDENT PROFILE
        ========================================== */

        const {
          data: student,
          error: studentError,
        } = await supabase
          .from("students")
          .select(
            "id, auth_id, full_name, email"
          )
          .eq("auth_id", user.id)
          .single();

        if (
          studentError ||
          !student
        ) {
          throw new Error(
            studentError?.message ||
              "Student profile could not be found."
          );
        }

        /* ==========================================
           GET CLASS SCHEDULE
        ========================================== */

        if (scheduleId) {
          const {
            data: scheduleData,
            error: scheduleError,
          } = await supabase
            .from("class_schedules")
            .select(`
              id,
              subject,
              day,
              start_time,
              end_time,
              tutor_name,
              meeting_link
            `)
            .eq("id", scheduleId)
            .single();

          if (
            !scheduleError &&
            scheduleData
          ) {
            setSchedule(
              scheduleData as Schedule
            );
          }
        }

        /* ==========================================
           GET CLASSWORK ASSIGNED TO THIS STUDENT
        ========================================== */

        const {
          data: assignmentData,
          error: assignmentError,
        } = await supabase
          .from("classwork_assignments")
          .select("classwork_id")
          .eq(
            "student_id",
            student.id
          );

        if (assignmentError) {
          throw new Error(
            assignmentError.message
          );
        }

        const classworkIds =
          (assignmentData || [])
            .map(
              (item) =>
                item.classwork_id
            )
            .filter(Boolean);

        /* ==========================================
           NO CLASSWORK
        ========================================== */

        if (
          classworkIds.length === 0
        ) {
          setClassworks([]);
          return;
        }

        /* ==========================================
           GET ONLY THIS STUDENT'S CLASSWORK
        ========================================== */

        const {
          data: classworkData,
          error: classworkError,
        } = await supabase
          .from("classworks")
          .select(`
            id,
            subject,
            title,
            description,
            due_date,
            status,
            created_at
          `)
          .in(
            "id",
            classworkIds
          )
          .eq(
            "subject",
            subjectFromUrl
          )
          .eq(
            "status",
            "published"
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

        setClassworks(
          (classworkData || []) as Classwork[]
        );
      } catch (err) {
        console.error(
          "Classwork list loading error:",
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

  /* ==========================================
     FORMAT TIME
  ========================================== */

  function formatTime(
    time: string
  ) {
    const [
      hourString,
      minute,
    ] = time.split(":");

    const hour =
      Number(hourString);

    const suffix =
      hour >= 12
        ? "PM"
        : "AM";

    const formattedHour =
      hour % 12 || 12;

    return `${formattedHour}:${minute} ${suffix}`;
  }

  /* ==========================================
     LOADING
  ========================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Loading classwork...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ==========================================
     ERROR
  ========================================== */

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

  /* ==========================================
     PAGE
  ========================================== */

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* ======================================
            BACK TO DASHBOARD
        ====================================== */}

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* ======================================
            HEADER
        ====================================== */}

        <header className="mt-8">

          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-yellow-600">
            Classwork
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            {subject}
          </h1>

          {schedule && (
            <div className="mt-4 space-y-1 text-sm text-slate-500">

              <p>
                <span className="font-semibold text-slate-700">
                  {schedule.day}
                </span>{" "}
                —{" "}
                {formatTime(
                  schedule.start_time
                )}{" "}
                -{" "}
                {formatTime(
                  schedule.end_time
                )}
              </p>

              <p>
                Tutor:{" "}
                <span className="font-bold text-slate-700">
                  {schedule.tutor_name}
                </span>
              </p>

            </div>
          )}

          {/* LIVE CLASS */}

          {schedule?.meeting_link && (
            <a
              href={
                schedule.meeting_link
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Video size={17} />
              Join Live Class
            </a>
          )}

        </header>

        {/* ======================================
            CLASSWORK LIST
        ====================================== */}

        <section className="mt-12">

          <div className="mb-6">

            <h2 className="text-2xl font-black text-slate-950">
              Classwork
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select an assignment to view its details.
            </p>

          </div>

          {/* ====================================
              EMPTY
          ==================================== */}

          {classworks.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">

              <h3 className="text-lg font-bold text-slate-900">
                No classwork yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your tutor has not assigned any classwork for this subject yet.
              </p>

            </div>
          ) : (

            /* ==================================
               CLEAN TITLE-ONLY LIST
            ================================== */

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              {classworks.map(
                (work, index) => (

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

                    {/* TITLE ONLY */}

                    <h3 className="min-w-0 truncate text-lg font-extrabold text-slate-900 transition group-hover:text-yellow-600">
                      {work.title}
                    </h3>

                    {/* ARROW */}

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