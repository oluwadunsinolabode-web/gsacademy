"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Question = {
  id: string;
  question_text: string;
  question_type: string;
  expected_answer: string | null;
  marks: number;
  options: unknown;
};

type Exam = {
  id: string;
  title: string;
  duration_minutes: number;
  subjectName: string;
  questions: Question[];
};

type AnswerMap = Record<string, string>;

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

function getOptions(options: unknown): string[] {
  if (!options) return [];

  if (Array.isArray(options)) {
    return options.map(String);
  }

  if (typeof options === "object") {
    const values = Object.values(
      options as Record<string, unknown>
    );

    return values.map(String);
  }

  return [];
}

export default function MockExamPage() {
  const params = useParams();
  const router = useRouter();

  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);

  const [answers, setAnswers] =
    useState<AnswerMap>({});

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [timeLeft, setTimeLeft] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showSubmitConfirm, setShowSubmitConfirm] =
    useState(false);

  /* =========================================================
     LOAD EXAM
  ========================================================= */

  useEffect(() => {
    async function loadExam() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error(
            "No logged-in student found."
          );
        }

        /* =====================================================
           REAL STUDENT
        ===================================================== */

        const {
          data: student,
          error: studentError,
        } = await supabase
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

        /* =====================================================
           STUDENT-SPECIFIC EXAM
        ===================================================== */

        const {
          data: studentExam,
          error: studentExamError,
        } = await supabase
          .from("mock_student_exams")
          .select(
            `
              id,
              exam_id,
              student_id,
              status,
              started_at,
              submitted_at
            `
          )
          .eq("id", examId)
          .eq("student_id", student.id)
          .single();

        if (
          studentExamError ||
          !studentExam
        ) {
          throw new Error(
            studentExamError?.message ||
              "This examination is not assigned to you."
          );
        }

        if (
          studentExam.status === "submitted"
        ) {
          setSubmitted(true);
          setLoading(false);
          return;
        }

        /* =====================================================
           EXAM + QUESTIONS + SUBJECT
        ===================================================== */

        const {
          data: examData,
          error: examError,
        } = await supabase
          .from("mock_exams")
          .select(
            `
              id,
              title,
              duration_minutes,
              subjects (
                id,
                name
              ),
              mock_questions (
                id,
                question_text,
                question_type,
                expected_answer,
                marks,
                options,
                created_at
              )
            `
          )
          .eq(
            "id",
            studentExam.exam_id
          )
          .single();

        if (examError || !examData) {
          throw new Error(
            examError?.message ||
              "Mock examination not found."
          );
        }

        const subject = Array.isArray(
          examData.subjects
        )
          ? examData.subjects[0]
          : examData.subjects;

        const questions =
          Array.isArray(
            examData.mock_questions
          )
            ? examData.mock_questions
            : [];

        const orderedQuestions =
          [...questions].sort(
            (a, b) => {
              const first =
                new Date(
                  a.created_at
                ).getTime();

              const second =
                new Date(
                  b.created_at
                ).getTime();

              return first - second;
            }
          );

        const durationSeconds =
          Number(
            examData.duration_minutes
          ) * 60;

        if (
          !Number.isFinite(
            durationSeconds
          ) ||
          durationSeconds <= 0
        ) {
          throw new Error(
            "This examination does not have a valid time limit."
          );
        }

        /* =====================================================
           START TIME
        ===================================================== */

        let startedAt =
          studentExam.started_at;

        if (!startedAt) {
          startedAt =
            new Date().toISOString();

          const {
            error: startError,
          } = await supabase
            .from("mock_student_exams")
            .update({
              status:
                "in_progress",
              started_at:
                startedAt,
            })
            .eq(
              "id",
              studentExam.id
            )
            .eq(
              "student_id",
              student.id
            );

          if (startError) {
            throw new Error(
              startError.message
            );
          }
        }

        /* =====================================================
           CALCULATE REMAINING TIME
        ===================================================== */

        const startMilliseconds =
          new Date(
            startedAt
          ).getTime();

        const elapsedSeconds =
          Math.floor(
            (Date.now() -
              startMilliseconds) /
              1000
          );

        const remainingSeconds =
          durationSeconds -
          elapsedSeconds;

        if (
          remainingSeconds <= 0
        ) {
          setTimeLeft(0);
        } else {
          setTimeLeft(
            remainingSeconds
          );
        }

        /* =====================================================
           LOAD EXISTING ANSWERS
        ===================================================== */

        const {
          data: existingAnswers,
          error: answersError,
        } = await supabase
          .from("mock_answers")
          .select(
            `
              question_id,
              answer
            `
          )
          .eq(
            "student_exam_id",
            studentExam.id
          );

        if (answersError) {
          throw new Error(
            answersError.message
          );
        }

        const answerMap: AnswerMap =
          {};

        (
          existingAnswers || []
        ).forEach(
          (item) => {
            if (
              item.question_id
            ) {
              answerMap[
                item.question_id
              ] =
                item.answer || "";
            }
          }
        );

        setAnswers(
          answerMap
        );

        setExam({
          id:
            examData.id,
          title:
            examData.title,
          duration_minutes:
            Number(
              examData.duration_minutes
            ),
          subjectName:
            subject?.name ||
            "Subject",
          questions:
            orderedQuestions,
        });
      } catch (err) {
        console.error(
          "MOCK EXAM ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load examination."
        );
      } finally {
        setLoading(false);
      }
    }

    if (examId) {
      loadExam();
    }
  }, [examId]);

  /* =========================================================
     CURRENT QUESTION
  ========================================================= */

  const question =
    exam?.questions[
      currentQuestion
    ] || null;

  const options = useMemo(
    () =>
      getOptions(
        question?.options
      ),
    [question]
  );

  const answeredCount =
    exam?.questions.filter(
      (item) =>
        Boolean(
          answers[item.id]?.trim()
        )
    ).length || 0;

  const totalQuestions =
    exam?.questions.length || 0;

  const progress =
    totalQuestions > 0
      ? ((currentQuestion + 1) /
          totalQuestions) *
        100
      : 0;

  /* =========================================================
     SAVE ANSWER
  ========================================================= */

  async function saveAnswer(
    questionId: string,
    value: string
  ) {
    setAnswers(
      (previous) => ({
        ...previous,
        [questionId]:
          value,
      })
    );

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const {
        data: student,
      } = await supabase
        .from("students")
        .select("id")
        .eq(
          "auth_id",
          user.id
        )
        .single();

      if (!student) return;

      const {
        data: studentExam,
      } = await supabase
        .from(
          "mock_student_exams"
        )
        .select("id")
        .eq(
          "id",
          examId
        )
        .eq(
          "student_id",
          student.id
        )
        .single();

      if (!studentExam) return;

      const {
        data: existing,
      } = await supabase
        .from("mock_answers")
        .select("id")
        .eq(
          "student_exam_id",
          studentExam.id
        )
        .eq(
          "question_id",
          questionId
        )
        .maybeSingle();

      if (existing) {
        await supabase
          .from(
            "mock_answers"
          )
          .update({
            answer:
              value,
          })
          .eq(
            "id",
            existing.id
          );
      } else {
        await supabase
          .from(
            "mock_answers"
          )
          .insert({
            student_exam_id:
              studentExam.id,
            question_id:
              questionId,
            answer:
              value,
          });
      }
    } catch (err) {
      console.error(
        "ANSWER SAVE ERROR:",
        err
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     SUBMIT EXAM
  ========================================================= */

  async function submitExam(
    automatic = false
  ) {
    if (
      submitting ||
      submitted
    ) {
      return;
    }

    try {
      setSubmitting(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "Student session expired."
        );
      }

      const {
        data: student,
      } = await supabase
        .from("students")
        .select("id")
        .eq(
          "auth_id",
          user.id
        )
        .single();

      if (!student) {
        throw new Error(
          "Student profile not found."
        );
      }

      const {
        data: studentExam,
        error: studentExamError,
      } = await supabase
        .from(
          "mock_student_exams"
        )
        .select("id")
        .eq(
          "id",
          examId
        )
        .eq(
          "student_id",
          student.id
        )
        .single();

      if (
        studentExamError ||
        !studentExam
      ) {
        throw new Error(
          "Student examination not found."
        );
      }

      await supabase
        .from(
          "mock_student_exams"
        )
        .update({
          status:
            "submitted",
          submitted_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          studentExam.id
        )
        .eq(
          "student_id",
          student.id
        );

      setSubmitted(true);

      if (automatic) {
        router.push(
          `/dashboard/resources/mock-exams/${examId}/result`
        );
      } else {
        router.push(
          `/dashboard/resources/mock-exams/${examId}/result`
        );
      }
    } catch (err) {
      console.error(
        "SUBMIT EXAM ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit examination."
      );

      setSubmitting(false);
    }
  }

  /* =========================================================
     COUNTDOWN
  ========================================================= */

  useEffect(() => {
    if (
      timeLeft === null ||
      submitted ||
      !exam
    ) {
      return;
    }

    if (timeLeft <= 0) {
      submitExam(true);
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setTimeLeft(
            (previous) => {
              if (
                previous === null
              ) {
                return null;
              }

              return Math.max(
                0,
                previous - 1
              );
            }
          );
        },
        1000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [
    timeLeft,
    submitted,
    exam,
  ]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-yellow-500" />

          <p className="mt-5 font-semibold text-slate-700">
            Preparing your examination...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-10 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Examination unavailable
        </h1>

        <p className="mt-4 text-red-600">
          {error}
        </p>
      </div>
    );
  }

  /* =========================================================
     ALREADY SUBMITTED
  ========================================================= */

  if (submitted) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="max-w-xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-slate-900">
            Examination Submitted
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            Your examination has been submitted successfully.
          </p>

          <button
            onClick={() =>
              router.push(
                "/dashboard/resources"
              )
            }
            className="mt-8 rounded-xl bg-slate-900 px-7 py-3 font-bold text-white"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  if (!exam || !question) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">
          No questions available
        </h1>

        <p className="mt-3 text-slate-600">
          This mock examination does not have any questions yet.
        </p>
      </div>
    );
  }

  const isTimeCritical =
    (timeLeft || 0) <= 300;

  /* =========================================================
     EXAM UI
  ========================================================= */

  return (
    <main className="min-h-screen">
      {/* TOP BAR */}

      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-600">
                {exam.subjectName}
              </p>

              <h1 className="mt-1 text-xl font-extrabold text-slate-900 md:text-2xl">
                {exam.title}
              </h1>
            </div>

            <div
              className={`rounded-2xl px-5 py-3 text-center ${
                isTimeCritical
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-900 text-white"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest">
                Time Remaining
              </p>

              <p className="mt-1 text-2xl font-black tabular-nums">
                {formatTime(
                  timeLeft || 0
                )}
              </p>
            </div>
          </div>

          {/* PROGRESS */}

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>
                Question {currentQuestion + 1} of{" "}
                {totalQuestions}
              </span>

              <span>
                {answeredCount} answered
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-yellow-500 transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* QUESTION */}

          <section className="rounded-3xl bg-white p-6 shadow-sm md:p-10">
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                Question {currentQuestion + 1}
              </span>

              <span className="font-bold text-yellow-600">
                {question.marks}{" "}
                {question.marks === 1
                  ? "mark"
                  : "marks"}
              </span>
            </div>

            <div className="mt-8">
              <p className="whitespace-pre-line text-xl font-bold leading-9 text-slate-900 md:text-2xl">
                {question.question_text}
              </p>
            </div>

            {/* MULTIPLE CHOICE */}

            {options.length > 0 ? (
              <div className="mt-10 space-y-4">
                {options.map(
                  (option, index) => {
                    const selected =
                      answers[
                        question.id
                      ] === option;

                    return (
                      <button
                        key={`${question.id}-${index}`}
                        type="button"
                        onClick={() =>
                          saveAnswer(
                            question.id,
                            option
                          )
                        }
                        className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
                          selected
                            ? "border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200"
                            : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-extrabold ${
                            selected
                              ? "bg-yellow-500 text-slate-900"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {String.fromCharCode(
                            65 + index
                          )}
                        </span>

                        <span className="font-semibold text-slate-800">
                          {option}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            ) : (
              /* WRITTEN ANSWER */

              <div className="mt-10">
                <label className="font-bold text-slate-900">
                  Your Answer
                </label>

                <textarea
                  value={
                    answers[
                      question.id
                    ] || ""
                  }
                  onChange={(e) =>
                    saveAnswer(
                      question.id,
                      e.target.value
                    )
                  }
                  rows={8}
                  placeholder="Type your answer here..."
                  className="mt-3 w-full rounded-2xl border border-slate-300 p-5 leading-7 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                />
              </div>
            )}

            {/* SAVING */}

            <div className="mt-6 flex min-h-5 justify-end">
              {saving && (
                <span className="text-xs font-semibold text-slate-400">
                  Saving answer...
                </span>
              )}
            </div>

            {/* NAVIGATION */}

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-8 sm:flex-row sm:justify-between">
              <button
                type="button"
                disabled={
                  currentQuestion === 0
                }
                onClick={() =>
                  setCurrentQuestion(
                    (previous) =>
                      Math.max(
                        0,
                        previous - 1
                      )
                  )
                }
                className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {currentQuestion <
              totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentQuestion(
                      (previous) =>
                        Math.min(
                          totalQuestions -
                            1,
                          previous + 1
                        )
                    )
                  }
                  className="rounded-xl bg-slate-900 px-7 py-3 font-bold text-white hover:bg-slate-800"
                >
                  Next Question →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setShowSubmitConfirm(
                      true
                    )
                  }
                  className="rounded-xl bg-yellow-500 px-7 py-3 font-extrabold text-slate-900 hover:bg-yellow-400"
                >
                  Submit Examination
                </button>
              )}
            </div>
          </section>

          {/* QUESTION NAVIGATOR */}

          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-48">
            <h2 className="text-lg font-extrabold text-slate-900">
              Questions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a question to jump to it.
            </p>

            <div className="mt-6 grid grid-cols-5 gap-2">
              {exam.questions.map(
                (item, index) => {
                  const answered =
                    Boolean(
                      answers[
                        item.id
                      ]?.trim()
                    );

                  const current =
                    index ===
                    currentQuestion;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setCurrentQuestion(
                          index
                        )
                      }
                      className={`h-11 rounded-xl text-sm font-extrabold transition ${
                        current
                          ? "bg-slate-900 text-white"
                          : answered
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                }
              )}
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-900" />
                Current
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500" />
                Answered
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-200" />
                Not answered
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* SUBMIT CONFIRMATION */}

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Submit Examination?
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              You have answered{" "}
              <strong>
                {answeredCount}
              </strong>{" "}
              out of{" "}
              <strong>
                {totalQuestions}
              </strong>{" "}
              questions.
            </p>

            {answeredCount <
              totalQuestions && (
              <p className="mt-3 rounded-xl bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
                You still have unanswered questions.
              </p>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowSubmitConfirm(
                    false
                  )
                }
                className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700"
              >
                Continue Exam
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() =>
                  submitExam(false)
                }
                className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-white disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}