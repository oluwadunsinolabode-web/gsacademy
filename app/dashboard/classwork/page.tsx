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

type Submission = {
  classwork_id: string | null;
  status: string | null;
};

export default function ClassPage() {
  const [classworks, setClassworks] = useState<Classwork[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);

  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClassPage() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams(window.location.search);

        const subjectFromUrl = params.get("subject");
        const scheduleId = params.get("schedule_id");

        if (!subjectFromUrl) {
          throw new Error("No subject was selected.");
        }

        setSubject(subjectFromUrl);

        /*
         * ==========================================
         * GET LOGGED-IN STUDENT
         * ==========================================
         */

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("You must be logged in.");
        }

        /*
         * ==========================================
         * GET STUDENT PROFILE
         * ==========================================
         */

        const { data: student, error: studentError } =
          await supabase
            .from("students")
            .select("id, auth_id, full_name, email")
            .eq("auth_id", user.id)
            .single();

        if (studentError || !student) {
          throw new Error(
            studentError?.message ||
              "Student profile could not be found."
          );
        }

        /*
         * ==========================================
         * GET SCHEDULE
         * ==========================================
         *
         * We use schedule_id when available.
         * This keeps the page connected to the
         * student's existing class schedule.
         */

        if (scheduleId) {
          const { data: scheduleData, error: scheduleError } =
            await supabase
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

          if (!scheduleError && scheduleData) {
            setSchedule(scheduleData);
          }
        }

        /*
         * ==========================================
         * GET CLASSWORK FOR THIS SUBJECT
         * ==========================================
         */

       const { data: classworkData, error: classworkError } =
  await supabase
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
    .eq("subject", subjectFromUrl)
    .eq("status", "published")
    .order("created_at", {
      ascending: false,
    });
        if (classworkError) {
          throw classworkError;
        }

        setClassworks(classworkData || []);

        /*
         * ==========================================
         * GET STUDENT SUBMISSIONS
         * ==========================================
         *
         * Used only to determine whether each
         * classwork has been submitted.
         */

        const classworkIds =
          (classworkData || []).map(
            (item) => item.id
          );

        if (classworkIds.length > 0) {
          const {
            data: submissionData,
            error: submissionError,
          } = await supabase
            .from("classwork_submissions")
            .select(`
              classwork_id,
              status
            `)
            .eq("student_id", student.id)
            .in("classwork_id", classworkIds)
            .order("submitted_at", {
              ascending: false,
            });

          if (submissionError) {
            console.error(
              "Submission loading error:",
              submissionError
            );
          } else {
            setSubmissions(
              submissionData || []
            );
          }
        }
      } catch (err) {
        console.error(
          "Class page loading error:",
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

  /*
   * ==========================================
   * SUBMISSION STATUS
   * ==========================================
   */

  function getSubmissionStatus(
    classworkId: string
  ) {
    const submission = submissions.find(
      (item) =>
        item.classwork_id === classworkId
    );

    if (!submission) {
      return "Not submitted";
    }

    return submission.status || "Submitted";
  }

  function isSubmitted(
    classworkId: string
  ) {
    return submissions.some(
      (item) =>
        item.classwork_id === classworkId
    );
  }

  /*
   * ==========================================
   * FORMAT TIME
   * ==========================================
   */

  function formatTime(time: string) {
    const [hourString, minute] =
      time.split(":");

    const hour = Number(hourString);

    const suffix =
      hour >= 12 ? "PM" : "AM";

    const formattedHour =
      hour % 12 || 12;

    return `${formattedHour}:${minute} ${suffix}`;
  }

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-slate-500">
            Loading classwork...
          </p>
        </div>
      </main>
    );
  }

  /*
   * ==========================================
   * ERROR
   * ==========================================
   */

  if (error) {
    return (
      <main className="min-h-screen bg-white px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/dashboard"
            className="text-sm font-bold text-slate-700 hover:text-slate-950"
          >
            ← Back to Dashboard
          </Link>

          <p className="mt-8 text-sm font-semibold text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  /*
   * ==========================================
   * PAGE
   * ==========================================
   */

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Back */}

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Header */}

        <header className="mt-8">
          <p className="text-sm font-bold uppercase tracking-wider text-yellow-600">
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
                — {formatTime(schedule.start_time)} -{" "}
                {formatTime(schedule.end_time)}
              </p>

              <p>
                Tutor:{" "}
                <span className="font-bold text-slate-700">
                  {schedule.tutor_name}
                </span>
              </p>
            </div>
          )}

          {schedule?.meeting_link && (
            <a
              href={schedule.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Video size={17} />
              Join Live Class
            </a>
          )}
        </header>

        {/* Classwork */}

        <section className="mt-12">
          <h2 className="text-2xl font-black text-slate-950">
            Classwork
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Assignments from your tutor for this class.
          </p>

          {classworks.length === 0 ? (
            <p className="mt-8 text-sm text-slate-500">
              No classwork has been assigned yet.
            </p>
          ) : (
            <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">

              {classworks.map((work) => {
                const submitted =
                  isSubmitted(work.id);

                return (
                  <Link
                    key={work.id}
                   href={`/dashboard/classwork/${work.id}`}
                    className="group flex items-center justify-between gap-6 py-5 transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-extrabold text-slate-900 group-hover:text-slate-950">
                        {work.title}
                      </h3>

                      {work.description && (
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {work.description}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-4">
                      <span
                        className={`text-sm font-bold ${
                          submitted
                            ? "text-green-600"
                            : "text-slate-400"
                        }`}
                      >
                        {getSubmissionStatus(
                          work.id
                        )}
                      </span>

                      <ArrowRight
                        size={18}
                        className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900"
                      />
                    </div>
                  </Link>
                );
              })}

            </div>
          )}
        </section>

      </div>
    </main>
  );
}