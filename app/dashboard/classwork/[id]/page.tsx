"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  FileText,
  ExternalLink,
  Send,
  Loader2,
  CheckCircle,
  Clock,
  MessageSquare,
  History,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Classwork = {
  id: string;
  tutor_id: string;
  subject: string;
  title: string;
  description: string | null;
  attachment_url: string | null;
  due_date: string | null;
  status: string | null;
  created_at: string;
};

type Student = {
  id: string;
  auth_id: string;
  full_name: string | null;
  email: string | null;
};

type Submission = {
  id: string;
  classwork_id: string | null;
  student_id: string | null;
  student_email: string | null;
  subject: string | null;
  title: string | null;
  image_url: string | null;
  text_answer: string | null;
  status: string | null;
  submitted_at: string | null;
  score: number | null;
  total_marks: number | null;
  percentage: number | null;
  grade: string | null;
  tutor_feedback: string | null;
  teacher_feedback: string | null;
  correction_file_url: string | null;
};

export default function ClassworkDetailPage() {
  const [classwork, setClasswork] =
    useState<Classwork | null>(null);

  const [student, setStudent] =
    useState<Student | null>(null);

  const [submissions, setSubmissions] =
    useState<Submission[]>([]);

  const [textAnswer, setTextAnswer] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =========================================================
     LOAD PAGE
  ========================================================= */

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);
        setError("");

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
           GET STUDENT
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
           GET CLASSWORK ID
        --------------------------------------------------- */

        const pathname =
          window.location.pathname;

        const classworkId =
          pathname.split("/").pop();

        if (!classworkId) {
          throw new Error(
            "No classwork was selected."
          );
        }

        console.log(
          "CLASSWORK ID:",
          classworkId
        );

        /* ---------------------------------------------------
           GET FULL CLASSWORK
        --------------------------------------------------- */

        const {
          data: classworkData,
          error: classworkError,
        } = await supabase
          .from("classworks")
          .select(`
            id,
            tutor_id,
            subject,
            title,
            description,
            attachment_url,
            due_date,
            status,
            created_at
          `)
          .eq("id", classworkId)
          .eq("status", "published")
          .single();

        if (
          classworkError ||
          !classworkData
        ) {
          throw new Error(
            classworkError?.message ||
              "Published classwork could not be found."
          );
        }

        setClasswork(
          classworkData as Classwork
        );

        /* ---------------------------------------------------
           GET STUDENT SUBMISSIONS
        --------------------------------------------------- */

        const {
          data: submissionData,
          error: submissionError,
        } = await supabase
          .from("classwork_submissions")
          .select(`
            id,
            classwork_id,
            student_id,
            student_email,
            subject,
            title,
            image_url,
            text_answer,
            status,
            submitted_at,
            score,
            total_marks,
            percentage,
            grade,
            tutor_feedback,
            teacher_feedback,
            correction_file_url
          `)
          .eq(
            "student_id",
            studentData.id
          )
          .eq(
            "classwork_id",
            classworkData.id
          )
          .order(
            "submitted_at",
            {
              ascending: false,
            }
          );

        if (submissionError) {
          throw submissionError;
        }

        setSubmissions(
          submissionData || []
        );
      } catch (err) {
        console.error(
          "Classwork detail error:",
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

    loadPage();
  }, []);

  /* =========================================================
     LATEST SUBMISSION
  ========================================================= */

  const latestSubmission =
    submissions.length > 0
      ? submissions[0]
      : null;

  /* =========================================================
     SUBMIT ANSWER
  ========================================================= */

  async function submitAnswer() {
    if (!classwork || !student) {
      return;
    }

    if (
      !file &&
      !textAnswer.trim()
    ) {
      setError(
        "Please write an answer or upload your work."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "Your session has expired."
        );
      }

      let uploadedFileUrl:
        | string
        | null = null;

      /* ---------------------------------------------------
         UPLOAD FILE
      --------------------------------------------------- */

      if (file) {
        const safeFileName =
          file.name
            .replace(
              /[^a-zA-Z0-9._-]/g,
              "_"
            )
            .replace(
              /\s+/g,
              "_"
            );

        const filePath =
          `students/${student.id}/classwork/${classwork.id}/${crypto.randomUUID()}-${safeFileName}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from(
            "classwork-submissions"
          )
          .upload(
            filePath,
            file,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                file.type ||
                undefined,
            }
          );

        if (uploadError) {
          throw new Error(
            `File upload failed: ${uploadError.message}`
          );
        }

        const {
          data: publicData,
        } =
          supabase.storage
            .from(
              "classwork-submissions"
            )
            .getPublicUrl(
              filePath
            );

        uploadedFileUrl =
          publicData.publicUrl;
      }

      /* ---------------------------------------------------
         INSERT SUBMISSION
      --------------------------------------------------- */

      const {
        error: submissionError,
      } = await supabase
        .from(
          "classwork_submissions"
        )
        .insert({
          student_id:
            student.id,

          student_email:
            student.email ||
            user.email ||
            null,

          classwork_id:
            classwork.id,

          subject:
            classwork.subject,

          title:
            classwork.title,

          status:
            "Submitted",

          image_url:
            uploadedFileUrl,

          text_answer:
            textAnswer.trim() ||
            null,
        });

      if (submissionError) {
        throw new Error(
          `Submission failed: ${submissionError.message}`
        );
      }

      /* ---------------------------------------------------
         RELOAD SUBMISSIONS
      --------------------------------------------------- */

      const {
        data: updatedSubmissions,
      } = await supabase
        .from(
          "classwork_submissions"
        )
        .select(`
          id,
          classwork_id,
          student_id,
          student_email,
          subject,
          title,
          image_url,
          text_answer,
          status,
          submitted_at,
          score,
          total_marks,
          percentage,
          grade,
          tutor_feedback,
          teacher_feedback,
          correction_file_url
        `)
        .eq(
          "student_id",
          student.id
        )
        .eq(
          "classwork_id",
          classwork.id
        )
        .order(
          "submitted_at",
          {
            ascending: false,
          }
        );

      setSubmissions(
        updatedSubmissions || []
      );

      setTextAnswer("");
      setFile(null);

      setMessage(
        "Your answer has been submitted successfully."
      );
    } catch (err) {
      console.error(
        "Submission error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your answer."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold text-slate-500">
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

  if (error && !classwork) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">

          <Link
            href="/dashboard"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-slate-950"
          >
            <ArrowLeft size={17} />

            Back to Dashboard
          </Link>

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5 sm:p-6">
            <p className="text-sm font-semibold leading-6 text-red-600">
              {error}
            </p>
          </div>

        </div>
      </main>
    );
  }

  if (!classwork) {
    return null;
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-10">

      <div className="mx-auto w-full max-w-4xl">

        {/* =================================================
            BACK TO DASHBOARD
        ================================================= */}

        <Link
          href="/dashboard"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-slate-950"
        >
          <ArrowLeft size={17} />

          Back to Dashboard
        </Link>

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mt-6 sm:mt-8">

          <p className="text-xs font-black uppercase tracking-[0.15em] text-yellow-600 sm:text-sm">
            {classwork.subject}
          </p>

          <h1 className="mt-2 break-words text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
            {classwork.title}
          </h1>

          <div className="mt-4 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:text-sm">

            {classwork.created_at && (
              <span>
                Posted{" "}
                {new Date(
                  classwork.created_at
                ).toLocaleDateString(
                  undefined,
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </span>
            )}

            {classwork.due_date && (
              <span className="flex items-center gap-1.5">
                <Clock size={15} />

                Due{" "}
                {new Date(
                  classwork.due_date
                ).toLocaleDateString(
                  undefined,
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </span>
            )}

          </div>

        </header>

        {/* =================================================
            FULL TUTOR CLASSWORK
        ================================================= */}

        <section className="mt-8 sm:mt-10">

          <div className="mb-4">

            <h2 className="text-lg font-black text-slate-950 sm:text-xl">
              Classwork
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Instructions from your tutor
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

            {classwork.description ? (
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 sm:text-[15px]">
                {classwork.description}
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                No additional instructions were provided.
              </p>
            )}

            {/* TUTOR ATTACHMENT */}

            {classwork.attachment_url && (
              <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <FileText
                      size={19}
                      className="text-slate-600"
                    />
                  </div>

                  <div className="min-w-0">

                    <p className="text-sm font-bold text-slate-800">
                      Tutor attachment
                    </p>

                    <p className="text-xs leading-5 text-slate-500">
                      Open the file before answering.
                    </p>

                  </div>

                </div>

                <a
                  href={
                    classwork.attachment_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 sm:w-auto"
                >
                  <ExternalLink size={16} />

                  Open File
                </a>

              </div>
            )}

          </div>

        </section>

        {/* =================================================
            LATEST SUBMISSION
        ================================================= */}

        {latestSubmission && (
          <section className="mt-7 sm:mt-8">

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-black text-slate-950 sm:text-xl">
                  Your submission
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest attempt
                </p>

              </div>

              <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                {latestSubmission.status ||
                  "Submitted"}
              </span>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

              {/* SUBMITTED DATE */}

              {latestSubmission.submitted_at && (
                <p className="text-xs leading-5 text-slate-500">
                  Submitted{" "}
                  {new Date(
                    latestSubmission.submitted_at
                  ).toLocaleString()}
                </p>
              )}

              {/* WRITTEN ANSWER */}

              {latestSubmission.text_answer && (
                <div className="mt-5">

                  <p className="mb-2 text-sm font-bold text-slate-800">
                    Written answer
                  </p>

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                      {
                        latestSubmission.text_answer
                      }
                    </p>

                  </div>

                </div>
              )}

              {/* UPLOADED WORK */}

              {latestSubmission.image_url && (
                <div className="mt-5">

                  <p className="mb-2 text-sm font-bold text-slate-800">
                    Uploaded work
                  </p>

                  <a
                    href={
                      latestSubmission.image_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white sm:w-auto"
                  >
                    <ExternalLink size={16} />

                    View Submission
                  </a>

                </div>
              )}

              {/* SCORE */}

              {(
                latestSubmission.score !==
                  null ||
                latestSubmission.percentage !==
                  null ||
                latestSubmission.grade
              ) && (
                <div className="mt-6 grid grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:grid-cols-3 sm:divide-x">

                  <div className="border-b border-slate-200 p-4 text-center sm:border-b-0">

                    <p className="text-[11px] font-bold uppercase text-slate-400">
                      Score
                    </p>

                    <p className="mt-1 font-black text-slate-900">
                      {latestSubmission.score ??
                        "—"}

                      {latestSubmission.total_marks !==
                        null &&
                        ` / ${latestSubmission.total_marks}`}
                    </p>

                  </div>

                  <div className="border-b border-slate-200 p-4 text-center sm:border-b-0">

                    <p className="text-[11px] font-bold uppercase text-slate-400">
                      Percentage
                    </p>

                    <p className="mt-1 font-black text-slate-900">
                      {latestSubmission.percentage !==
                      null
                        ? `${latestSubmission.percentage}%`
                        : "—"}
                    </p>

                  </div>

                  <div className="p-4 text-center">

                    <p className="text-[11px] font-bold uppercase text-slate-400">
                      Grade
                    </p>

                    <p className="mt-1 font-black text-slate-900">
                      {latestSubmission.grade ||
                        "—"}
                    </p>

                  </div>

                </div>
              )}

              {/* FEEDBACK */}

              {(
                latestSubmission.tutor_feedback ||
                latestSubmission.teacher_feedback
              ) && (
                <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">

                  <div className="flex items-center gap-2">

                    <MessageSquare
                      size={17}
                      className="shrink-0 text-blue-600"
                    />

                    <p className="text-sm font-bold text-blue-900">
                      Tutor feedback
                    </p>

                  </div>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-blue-900">
                    {latestSubmission.tutor_feedback ||
                      latestSubmission.teacher_feedback}
                  </p>

                </div>
              )}

              {/* CORRECTION */}

              {latestSubmission.correction_file_url && (
                <div className="mt-6 flex flex-col gap-4 rounded-xl bg-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-sm font-bold text-orange-900">
                      Correction available
                    </p>

                    <p className="mt-1 text-xs leading-5 text-orange-700">
                      Your tutor has provided a correction.
                    </p>

                  </div>

                  <a
                    href={
                      latestSubmission.correction_file_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white"
                  >
                    View
                  </a>

                </div>
              )}

            </div>

          </section>
        )}

        {/* =================================================
            SUBMIT ANSWER
        ================================================= */}

        <section className="mt-7 sm:mt-8">

          <div className="mb-4">

            <h2 className="text-lg font-black text-slate-950 sm:text-xl">
              {latestSubmission
                ? "Submit another attempt"
                : "Submit your answer"}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Write your answer or upload your completed work.
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

            {/* WRITTEN ANSWER */}

            <div>

              <label className="text-sm font-bold text-slate-800">
                Written answer
              </label>

              <textarea
                value={textAnswer}
                onChange={(e) => {
                  setTextAnswer(
                    e.target.value
                  );

                  setError("");
                  setMessage("");
                }}
                rows={7}
                placeholder="Write your answer here..."
                className="mt-2 min-h-40 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-50"
              />

            </div>

            {/* FILE UPLOAD */}

            <div className="mt-5">

              <label className="flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-yellow-400 hover:bg-yellow-50 sm:flex-row sm:items-center">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">

                  <Upload
                    size={19}
                    className="text-slate-500"
                  />

                </div>

                <div className="min-w-0">

                  <p className="text-sm font-bold text-slate-800">
                    Upload completed work
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    PDF, JPG, PNG, DOC or DOCX
                  </p>

                </div>

                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    setFile(
                      e.target.files?.[0] ||
                        null
                    );

                    setError("");
                    setMessage("");
                  }}
                  className="hidden"
                />

              </label>

              {file && (
                <div className="mt-3 flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 p-3">

                  <FileText
                    size={18}
                    className="shrink-0 text-slate-500"
                  />

                  <p className="min-w-0 truncate text-sm font-semibold text-slate-700">
                    {file.name}
                  </p>

                </div>
              )}

            </div>

            {/* SUCCESS */}

            {message && (
              <div className="mt-5 flex items-start gap-2 rounded-xl bg-green-50 p-4 text-sm font-semibold leading-6 text-green-700">

                <CheckCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {message}
                </span>

              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                {error}
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="button"
              onClick={submitAnswer}
              disabled={submitting}
              className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />

                  Submit Answer
                </>
              )}

            </button>

          </div>

        </section>

        {/* =================================================
            PREVIOUS ATTEMPTS
        ================================================= */}

        {submissions.length > 1 && (
          <section className="mt-7 pb-8 sm:mt-8 sm:pb-12">

            <div className="mb-4 flex items-start gap-3">

              <History
                size={20}
                className="mt-0.5 shrink-0 text-slate-500"
              />

              <div>

                <h2 className="text-lg font-black text-slate-950 sm:text-xl">
                  Previous attempts
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Earlier submissions for this classwork
                </p>

              </div>

            </div>

            <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">

              {submissions
                .slice(1)
                .map(
                  (
                    submission,
                    index
                  ) => (
                    <div
                      key={
                        submission.id
                      }
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div className="min-w-0">

                        <p className="text-sm font-bold text-slate-800">
                          Attempt{" "}
                          {submissions.length -
                            index -
                            1}
                        </p>

                        {submission.submitted_at && (
                          <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                            {new Date(
                              submission.submitted_at
                            ).toLocaleString()}
                          </p>
                        )}

                      </div>

                      <div className="flex flex-wrap items-center gap-3">

                        {submission.percentage !==
                          null && (
                          <span className="text-sm font-bold text-slate-700">
                            {
                              submission.percentage
                            }
                            %
                          </span>
                        )}

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          {submission.status ||
                            "Submitted"}
                        </span>

                      </div>

                    </div>
                  )
                )}

            </div>

          </section>
        )}

      </div>
    </main>
  );
}