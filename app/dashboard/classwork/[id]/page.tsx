"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

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

type Submission = {
  id: string;
  classwork_id: string;
  student_id: string;
  student_email: string | null;
  subject: string | null;
  title: string | null;
  image_url: string | null;
  text_answer: string | null;
  status: string | null;
  tutor_feedback: string | null;
  teacher_feedback: string | null;
  submitted_at: string | null;
  score: number | null;
  total_marks: number | null;
  percentage: number | null;
  grade: string | null;
  correction_file_url: string | null;
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value: string | null) {
  if (!value) return "No date";

  return new Date(value).toLocaleString();
}

function formatShortDate(value: string | null) {
  if (!value) return null;

  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isImage(url: string | null) {
  if (!url) return false;

  return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
}

function isPdf(url: string | null) {
  if (!url) return false;

  return /\.pdf(\?.*)?$/i.test(url);
}

function isBrowserViewable(url: string | null) {
  return isImage(url) || isPdf(url);
}

/* =========================================================
   PAGE
========================================================= */

export default function ClassworkDetailPage() {
  const params = useParams();

  const classworkId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  /* =======================================================
     DATA
  ======================================================= */

  const [classwork, setClasswork] =
    useState<Classwork | null>(null);

  const [submission, setSubmission] =
    useState<Submission | null>(null);

  /* =======================================================
     FORM
  ======================================================= */

  const [textAnswer, setTextAnswer] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  /* =======================================================
     UI
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD CLASSWORK
  ======================================================= */

  useEffect(() => {
    if (!classworkId) return;

    loadClasswork();
  }, [classworkId]);

  async function loadClasswork() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      /* -----------------------------------------------
         LOGGED-IN STUDENT
      ------------------------------------------------ */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "You must be logged in as a student."
        );
      }

      /* -----------------------------------------------
         STUDENT PROFILE
      ------------------------------------------------ */

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

      if (studentError || !student) {
        throw new Error(
          studentError?.message ||
            "Student profile could not be found."
        );
      }

      /* -----------------------------------------------
         VERIFY CLASSWORK IS ASSIGNED TO STUDENT
      ------------------------------------------------ */

      const {
        data: assignment,
        error: assignmentError,
      } = await supabase
        .from("classwork_assignments")
        .select("classwork_id, student_id")
        .eq(
          "classwork_id",
          classworkId
        )
        .eq(
          "student_id",
          student.id
        )
        .maybeSingle();

      if (assignmentError) {
        throw new Error(
          assignmentError.message
        );
      }

      if (!assignment) {
        throw new Error(
          "This classwork is not assigned to you."
        );
      }

      /* -----------------------------------------------
         GET CLASSWORK
      ------------------------------------------------ */

      const {
        data: classworkData,
        error: classworkError,
      } = await supabase
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
        .eq(
          "id",
          classworkId
        )
        .single();

      if (
        classworkError ||
        !classworkData
      ) {
        throw new Error(
          classworkError?.message ||
            "Classwork could not be found."
        );
      }

      setClasswork(
        classworkData as Classwork
      );

      /* -----------------------------------------------
         GET LATEST STUDENT SUBMISSION
      ------------------------------------------------ */

      const {
        data: submissionData,
        error: submissionError,
      } = await supabase
        .from("classwork_submissions")
        .select(
          `
            id,
            classwork_id,
            student_id,
            student_email,
            subject,
            title,
            image_url,
            text_answer,
            status,
            tutor_feedback,
            teacher_feedback,
            submitted_at,
            score,
            total_marks,
            percentage,
            grade,
            correction_file_url
          `
        )
        .eq(
          "classwork_id",
          classworkId
        )
        .eq(
          "student_id",
          student.id
        )
        .order(
          "submitted_at",
          {
            ascending: false,
          }
        )
        .limit(1)
        .maybeSingle();

      if (submissionError) {
        throw new Error(
          submissionError.message
        );
      }

      if (submissionData) {
        setSubmission(
          submissionData as Submission
        );

        setTextAnswer(
          submissionData.text_answer ||
            ""
        );
      } else {
        setSubmission(null);
        setTextAnswer("");
      }
    } catch (err) {
      console.error(
        "Classwork detail loading error:",
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

  /* =======================================================
     FILE SELECT
  ======================================================= */

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0] ||
      null;

    setError("");
    setMessage("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    /* 10MB LIMIT */

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "The selected file is larger than 10MB."
      );

      event.target.value = "";
      setSelectedFile(null);

      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];

    if (
      file.type &&
      !allowedTypes.includes(file.type)
    ) {
      setError(
        "Please upload a PDF, DOC, DOCX, JPG or PNG file."
      );

      event.target.value = "";
      setSelectedFile(null);

      return;
    }

    setSelectedFile(file);
  }

  /* =======================================================
     SUBMIT ANSWER
  ======================================================= */

  async function submitAnswer(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!classwork) return;

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      /* -----------------------------------------------
         USER
      ------------------------------------------------ */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "You must be logged in."
        );
      }

      /* -----------------------------------------------
         STUDENT
      ------------------------------------------------ */

      const {
        data: student,
        error: studentError,
      } = await supabase
        .from("students")
        .select(
          "id, auth_id, email"
        )
        .eq(
          "auth_id",
          user.id
        )
        .single();

      if (studentError || !student) {
        throw new Error(
          studentError?.message ||
            "Student profile could not be found."
        );
      }

      /* -----------------------------------------------
         REQUIRE TEXT OR FILE
      ------------------------------------------------ */

      if (
        !textAnswer.trim() &&
        !selectedFile
      ) {
        throw new Error(
          "Please enter a written answer or upload your completed work."
        );
      }

      /* -----------------------------------------------
         UPLOAD FILE
      ------------------------------------------------ */

      let uploadedFileUrl:
        | string
        | null = null;

      if (selectedFile) {
        const safeFileName =
          selectedFile.name
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
            selectedFile,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                selectedFile.type ||
                undefined,
            }
          );

        if (uploadError) {
          throw new Error(
            `File upload failed: ${uploadError.message}`
          );
        }

        const {
          data: publicUrlData,
        } =
          supabase.storage
            .from(
              "classwork-submissions"
            )
            .getPublicUrl(
              filePath
            );

        uploadedFileUrl =
          publicUrlData.publicUrl;
      }

      /* -----------------------------------------------
         CREATE SUBMISSION
      ------------------------------------------------ */

      const {
        data: newSubmission,
        error: submissionError,
      } = await supabase
        .from(
          "classwork_submissions"
        )
        .insert({
          classwork_id:
            classwork.id,

          student_id:
            student.id,

          student_email:
            student.email ||
            user.email ||
            null,

          subject:
            classwork.subject,

          title:
            classwork.title,

          text_answer:
            textAnswer.trim() ||
            null,

          image_url:
            uploadedFileUrl,

          status:
            "submitted",

          submitted_at:
            new Date().toISOString(),
        })
        .select(
          `
            id,
            classwork_id,
            student_id,
            student_email,
            subject,
            title,
            image_url,
            text_answer,
            status,
            tutor_feedback,
            teacher_feedback,
            submitted_at,
            score,
            total_marks,
            percentage,
            grade,
            correction_file_url
          `
        )
        .single();

      if (
        submissionError ||
        !newSubmission
      ) {
        throw new Error(
          submissionError?.message ||
            "Unable to submit your answer."
        );
      }

      setSubmission(
        newSubmission as Submission
      );

      setSelectedFile(null);

      const fileInput =
        document.getElementById(
          "student-answer-file"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      setMessage(
        "Your answer has been submitted successfully."
      );

      /*
       * Keep the submitted text visible.
       * The latest submission is now loaded
       * from Supabase.
       */

      setTextAnswer(
        newSubmission.text_answer ||
          ""
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

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-3xl bg-white p-10 shadow-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2
                size={21}
                className="animate-spin"
              />
              <p className="font-semibold">
                Loading classwork...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error && !classwork) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-7">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={22}
                className="mt-0.5 text-red-600"
              />

              <div>
                <h1 className="font-bold text-red-900">
                  Unable to load classwork
                </h1>

                <p className="mt-2 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!classwork) {
    return null;
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* BACK */}

        <Link
          href={`/dashboard/classwork?subject=${encodeURIComponent(
            classwork.subject
          )}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft size={17} />
          Back to Classwork
        </Link>

        {/* HEADER */}

        <header className="mt-8">
          <p className="text-sm font-bold uppercase tracking-wider text-yellow-600">
            {classwork.subject}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
            {classwork.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
            <span>
              Posted{" "}
              {formatShortDate(
                classwork.created_at
              )}
            </span>

            {classwork.due_date && (
              <span>
                Due{" "}
                {formatShortDate(
                  classwork.due_date
                )}
              </span>
            )}
          </div>
        </header>

        {/* MESSAGES */}

        {message && (
          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
            <CheckCircle2
              size={21}
              className="mt-0.5 shrink-0"
            />

            <p className="font-semibold">
              {message}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            <AlertCircle
              size={21}
              className="mt-0.5 shrink-0"
            />

            <p className="font-semibold">
              {error}
            </p>
          </div>
        )}

        {/* =================================================
            TUTOR ASSIGNMENT
        ================================================= */}

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm md:p-8">

          <div className="flex items-center gap-3">
            <FileText
              size={23}
              className="text-yellow-600"
            />

            <h2 className="text-xl font-black text-slate-950">
              Tutor's Assignment
            </h2>
          </div>

          {classwork.description ? (
            <div className="mt-5 whitespace-pre-wrap leading-8 text-slate-700">
              {classwork.description}
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">
              No written instructions were provided.
            </p>
          )}

        </section>

        {/* =================================================
            TUTOR ATTACHMENT
        ================================================= */}

        {classwork.attachment_url && (
          <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm md:p-8">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">
                <FileText
                  size={23}
                  className="text-yellow-600"
                />

                <div>
                  <h2 className="font-black text-slate-950">
                    Tutor Attachment
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Open or download the file provided by your tutor.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">

                <a
                  href={
                    classwork.attachment_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <ExternalLink
                    size={17}
                  />
                  View
                </a>

                <a
                  href={
                    classwork.attachment_url
                  }
                  download
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-yellow-400"
                >
                  <Download
                    size={17}
                  />
                  Download
                </a>

              </div>

            </div>

            {/* BROWSER PREVIEW */}

            {isBrowserViewable(
              classwork.attachment_url
            ) && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                {isImage(
                  classwork.attachment_url
                ) ? (
                  <img
                    src={
                      classwork.attachment_url
                    }
                    alt="Tutor attachment"
                    className="mx-auto max-h-[700px] w-auto max-w-full object-contain"
                  />
                ) : (
                  <iframe
                    src={
                      classwork.attachment_url
                    }
                    title="Tutor attachment"
                    className="h-[700px] w-full"
                  />
                )}

              </div>
            )}

          </section>
        )}

        {/* =================================================
            STUDENT SUBMISSION
        ================================================= */}

        <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm md:p-8">

          <div>
            <h2 className="text-xl font-black text-slate-950">
              Your Submission
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Submit your answer as text, a file, or both.
            </p>
          </div>

          {/* EXISTING SUBMISSION */}

          {submission && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">

              <div className="flex flex-wrap items-center justify-between gap-3">

                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    <CheckCircle2
                      size={14}
                    />
                    {submission.status ||
                      "Submitted"}
                  </span>

                  {submission.submitted_at && (
                    <p className="mt-2 text-sm text-green-700">
                      Submitted{" "}
                      {formatDate(
                        submission.submitted_at
                      )}
                    </p>
                  )}
                </div>

                {submission.grade && (
                  <div className="rounded-xl bg-white px-4 py-3 text-center">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Grade
                    </p>

                    <p className="text-xl font-black text-blue-600">
                      {submission.grade}
                    </p>
                  </div>
                )}

              </div>

              {/* EXISTING TEXT */}

              {submission.text_answer && (
                <div className="mt-5 rounded-2xl bg-white p-5">

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Written Answer
                  </p>

                  <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">
                    {submission.text_answer}
                  </p>

                </div>
              )}

              {/* EXISTING FILE */}

              {submission.image_url && (
                <div className="mt-5 rounded-2xl bg-white p-5">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="font-bold text-slate-900">
                        Submitted File
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Your latest uploaded work.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">

                      <a
                        href={
                          submission.image_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
                      >
                        <ExternalLink
                          size={16}
                        />
                        View
                      </a>

                      <a
                        href={
                          submission.image_url
                        }
                        download
                        className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 text-sm font-bold text-slate-950"
                      >
                        <Download
                          size={16}
                        />
                        Download
                      </a>

                    </div>

                  </div>

                  {isImage(
                    submission.image_url
                  ) && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <img
                        src={
                          submission.image_url
                        }
                        alt="Your submitted work"
                        className="mx-auto max-h-[650px] w-auto max-w-full rounded-xl object-contain"
                      />
                    </div>
                  )}

                  {isPdf(
                    submission.image_url
                  ) && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                      <iframe
                        src={
                          submission.image_url
                        }
                        title="Your submitted PDF"
                        className="h-[650px] w-full"
                      />
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* SUBMISSION FORM */}

          <form
            onSubmit={submitAnswer}
            className="mt-7"
          >

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Written Answer
              </label>

              <textarea
                value={textAnswer}
                onChange={(event) =>
                  setTextAnswer(
                    event.target.value
                  )
                }
                rows={8}
                placeholder="Type your answer here..."
                className="w-full rounded-2xl border border-slate-200 px-5 py-4 leading-7 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
              />
            </div>

            {/* FILE */}

            <div className="mt-6">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Upload Completed Work
              </label>

              <label
                htmlFor="student-answer-file"
                className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-yellow-500 hover:bg-yellow-50"
              >
                <Upload
                  size={23}
                  className="text-slate-500"
                />

                <div>
                  <p className="font-bold text-slate-800">
                    {selectedFile
                      ? selectedFile.name
                      : "Choose a file"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    PDF, DOC, DOCX, JPG or PNG · Maximum 10MB
                  </p>
                </div>
              </label>

              <input
                id="student-answer-file"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={
                  handleFileChange
                }
                className="hidden"
              />

            </div>

            {/* SUBMIT */}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                )}

                {submitting
                  ? "Submitting..."
                  : submission
                  ? "Submit New Version"
                  : "Submit Answer"}
              </button>

              {submission && (
                <p className="text-sm text-slate-500">
                  Submitting again will create a new latest version.
                </p>
              )}

            </div>

          </form>

        </section>

        {/* =================================================
            MARKED RESULT
        ================================================= */}

        {submission &&
          (submission.score !== null ||
            submission.percentage !== null ||
            submission.grade) && (
            <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm md:p-8">

              <h2 className="text-xl font-black text-slate-950">
                Result
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">

                {submission.score !==
                  null && (
                  <div className="rounded-2xl bg-blue-50 p-5">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Score
                    </p>

                    <p className="mt-2 text-2xl font-black text-blue-700">
                      {submission.score}
                      {submission.total_marks !==
                        null &&
                        ` / ${submission.total_marks}`}
                    </p>
                  </div>
                )}

                {submission.percentage !==
                  null && (
                  <div className="rounded-2xl bg-purple-50 p-5">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Percentage
                    </p>

                    <p className="mt-2 text-2xl font-black text-purple-700">
                      {submission.percentage}%
                    </p>
                  </div>
                )}

                {submission.grade && (
                  <div className="rounded-2xl bg-yellow-50 p-5">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Grade
                    </p>

                    <p className="mt-2 text-2xl font-black text-yellow-700">
                      {submission.grade}
                    </p>
                  </div>
                )}

              </div>

            </section>
          )}

        {/* =================================================
            TUTOR FEEDBACK
        ================================================= */}

        {submission &&
          (submission.teacher_feedback ||
            submission.tutor_feedback) && (
            <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm md:p-8">

              <h2 className="text-xl font-black text-slate-950">
                Tutor Feedback
              </h2>

              <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-700">
                {submission.teacher_feedback ||
                  submission.tutor_feedback}
              </p>

            </section>
          )}

        {/* =================================================
            CORRECTION LINK
        ================================================= */}

        {submission?.correction_file_url && (
          <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm md:p-8">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="font-black text-slate-950">
                  Tutor Correction
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your tutor has provided a correction file.
                </p>
              </div>

              <a
                href={
                  submission.correction_file_url
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <ExternalLink
                  size={17}
                />
                View Correction
              </a>

            </div>

          </section>
        )}

      </div>
    </main>
  );
}