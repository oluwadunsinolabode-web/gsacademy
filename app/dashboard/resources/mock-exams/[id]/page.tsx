"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MockInfo = {
  id: string;
  title: string;
  description: string | null;
  subjectName: string;
  questionCount: number;
  durationMinutes: number;
};

export default function MockInstructionsPage() {
  const params = useParams();
  const router = useRouter();

  const examId = params.id as string;

  const [mock, setMock] = useState<MockInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMock() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("No logged-in student found.");
        }

        const { data: student, error: studentError } =
          await supabase
            .from("students")
            .select("id")
            .eq("auth_id", user.id)
            .single();

        if (studentError || !student) {
          throw new Error(
            studentError?.message ||
              "Student profile not found."
          );
        }

        const { data: studentExam, error: examError } =
          await supabase
            .from("mock_student_exams")
            .select(`
              id,
              status,
              mock_exams (
                id,
                title,
                description,
                status,
                duration_minutes,
                subjects (
                  id,
                  name
                ),
                mock_questions (
                  id
                )
              )
            `)
            .eq("id", examId)
            .eq("student_id", student.id)
            .single();

        if (examError || !studentExam) {
          throw new Error(
            examError?.message ||
              "Mock examination not found."
          );
        }

        const exam = Array.isArray(studentExam.mock_exams)
          ? studentExam.mock_exams[0]
          : studentExam.mock_exams;

        if (!exam) {
          throw new Error(
            "Mock examination not found."
          );
        }

        const subject = Array.isArray(exam.subjects)
          ? exam.subjects[0]
          : exam.subjects;

        const questions = Array.isArray(
          exam.mock_questions
        )
          ? exam.mock_questions
          : [];

        const durationMinutes =
          typeof exam.duration_minutes === "number" &&
          exam.duration_minutes > 0
            ? exam.duration_minutes
            : 0;

        setMock({
          id: exam.id,
          title: exam.title,
          description: exam.description,
          subjectName:
            subject?.name || "Subject",
          questionCount: questions.length,
          durationMinutes,
        });
      } catch (err) {
        console.error(
          "MOCK INSTRUCTIONS ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load mock examination."
        );
      } finally {
        setLoading(false);
      }
    }

    if (examId) {
      loadMock();
    }
  }, [examId]);

  async function startExam() {
    if (!mock) return;

    try {
      setStarting(true);
      setError("");

      if (mock.questionCount === 0) {
        throw new Error(
          "No questions have been assigned to this examination yet."
        );
      }

      if (mock.durationMinutes <= 0) {
        throw new Error(
          "This examination does not have a valid time limit."
        );
      }

      const { error: updateError } =
        await supabase
          .from("mock_student_exams")
          .update({
            status: "in_progress",
            started_at: new Date().toISOString(),
          })
          .eq("id", examId);

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      router.push(
        `/dashboard/resources/mock-exams/${examId}/exam`
      );
    } catch (err) {
      console.error(
        "START MOCK ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to start examination."
      );

      setStarting(false);
    }
  }

  function formatDuration(minutes: number) {
    if (minutes <= 0) {
      return "Not set";
    }

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    const remainingMinutes =
      minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} ${
        hours === 1
          ? "hour"
          : "hours"
      }`;
    }

    return `${hours}h ${remainingMinutes}min`;
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="font-semibold text-slate-700">
          Loading examination...
        </p>
      </div>
    );
  }

  if (error || !mock) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Unable to load examination
        </h1>

        <p className="mt-3 text-red-600">
          {error ||
            "Mock examination not found."}
        </p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="text-center">

        <p className="font-bold uppercase tracking-[0.2em] text-yellow-600">
          GS Academy Mock Examination
        </p>

        <h1 className="mt-4 text-4xl font-extrabold text-slate-900 md:text-5xl">
          {mock.title}
        </h1>

        <p className="mt-4 text-lg font-semibold text-slate-600">
          {mock.subjectName}
        </p>

      </div>


      {/* =====================================================
          EXAM INFORMATION
      ===================================================== */}

      <div className="mt-10 grid gap-5 md:grid-cols-3">

        {/* QUESTIONS */}

        <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Questions
          </p>

          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {mock.questionCount}
          </p>

        </div>


        {/* REAL ADMIN DURATION */}

        <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Time Allowed
          </p>

          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {formatDuration(
              mock.durationMinutes
            )}
          </p>

        </div>


        {/* FORMAT */}

        <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Format
          </p>

          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            Online
          </p>

        </div>

      </div>


      {/* =====================================================
          INSTRUCTIONS
      ===================================================== */}

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">

        <div className="flex items-center gap-3">

          <div className="h-10 w-1 rounded-full bg-yellow-500" />

          <h2 className="text-2xl font-extrabold text-slate-900">
            Before You Begin
          </h2>

        </div>


        {mock.description && (
          <div className="mt-6 rounded-2xl bg-slate-50 p-6">

            <p className="whitespace-pre-line leading-8 text-slate-700">
              {mock.description}
            </p>

          </div>
        )}


        <div className="mt-7 space-y-4 text-slate-700">

          <div className="flex gap-3">
            <span className="font-bold text-yellow-600">
              01
            </span>

            <p>
              Read each question carefully before
              selecting or entering your answer.
            </p>
          </div>


          <div className="flex gap-3">
            <span className="font-bold text-yellow-600">
              02
            </span>

            <p>
              Answer the questions assigned to
              you in this examination.
            </p>
          </div>


          <div className="flex gap-3">
            <span className="font-bold text-yellow-600">
              03
            </span>

            <p>
              Your answers will be saved while
              you work.
            </p>
          </div>


          <div className="flex gap-3">
            <span className="font-bold text-yellow-600">
              04
            </span>

            <p>
              You have{" "}
              <strong>
                {formatDuration(
                  mock.durationMinutes
                )}
              </strong>{" "}
              to complete this examination.
            </p>
          </div>


          <div className="flex gap-3">
            <span className="font-bold text-yellow-600">
              05
            </span>

            <p>
              When the timer reaches zero,
              the examination will be submitted
              automatically.
            </p>
          </div>


          <div className="flex gap-3">
            <span className="font-bold text-yellow-600">
              06
            </span>

            <p>
              Make sure you have a stable internet
              connection before starting.
            </p>
          </div>

        </div>

      </div>


      {/* =====================================================
          READY SECTION
      ===================================================== */}

      <div className="mt-8 overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">

        <div className="p-10 text-center md:p-14">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500 text-2xl font-black text-slate-900">
            ✓
          </div>

          <h2 className="mt-6 text-3xl font-extrabold">
            Are You Ready?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
            Once you click Start Examination,
            your examination timer will begin.
            Make sure you are ready before continuing.
          </p>


          {error && (
            <div className="mx-auto mt-6 max-w-xl rounded-xl bg-red-500/10 p-4 font-semibold text-red-300">
              {error}
            </div>
          )}


          <button
            type="button"
            onClick={startExam}
            disabled={
              starting ||
              mock.questionCount === 0 ||
              mock.durationMinutes <= 0
            }
            className="mt-8 rounded-xl bg-yellow-500 px-10 py-4 text-lg font-extrabold text-slate-900 transition hover:-translate-y-0.5 hover:bg-yellow-400 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {starting
              ? "Starting..."
              : "Start Examination"}
          </button>


          {mock.questionCount === 0 && (
            <p className="mt-4 text-sm font-semibold text-red-300">
              No questions have been assigned to
              this examination yet.
            </p>
          )}


          {mock.durationMinutes <= 0 && (
            <p className="mt-4 text-sm font-semibold text-red-300">
              The examination time has not been
              configured by the administrator.
            </p>
          )}

        </div>

      </div>


      {/* =====================================================
          SECURITY / STATUS
      ===================================================== */}

      <div className="mt-6 pb-10 text-center">

        <p className="text-sm font-medium text-slate-500">
          This examination is assigned specifically
          to your GS Academy student account.
        </p>

      </div>

    </main>
  );
}