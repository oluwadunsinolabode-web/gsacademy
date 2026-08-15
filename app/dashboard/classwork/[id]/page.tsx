"use client";

import { useEffect, useMemo, useState } from "react";
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
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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

type Student = {
  id: string;
  auth_id: string;
  full_name: string | null;
  email: string | null;
};

type SubmissionRow = {
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

type Submission = {
  id: string;
  rowIds: string[];

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

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDate(value: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getFileExtension(url: string | null) {
  if (!url) return "";

  const cleanUrl = url
    .split("?")[0]
    .split("#")[0];

  const parts = cleanUrl.split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts[parts.length - 1].toLowerCase();
}

function isImage(url: string | null) {
  const extension = getFileExtension(url);

  return [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
  ].includes(extension);
}

function isPdf(url: string | null) {
  return getFileExtension(url) === "pdf";
}

function isWordDocument(url: string | null) {
  const extension = getFileExtension(url);

  return ["doc", "docx"].includes(extension);
}

function getFileLabel(url: string | null) {
  const extension = getFileExtension(url);

  if (!extension) {
    return "Submitted file";
  }

  return `${extension.toUpperCase()} file`;
}

/* =========================================================
   COMBINE DATABASE ROWS INTO LOGICAL ATTEMPTS
========================================================= */

function combineSubmissionRows(
  rows: SubmissionRow[]
): Submission[] {
  const groups = new Map<
    string,
    SubmissionRow[]
  >();

  for (const row of rows) {
    const timestampKey =
      row.submitted_at ||
      `row-${row.id}`;

    const key = `${row.classwork_id || "none"}-${row.student_id || "none"}-${timestampKey}`;

    const existing =
      groups.get(key) || [];

    existing.push(row);

    groups.set(key, existing);
  }

  const combined: Submission[] = [];

  for (const groupRows of groups.values()) {
    const latestRow = groupRows[0];

    const firstText =
      groupRows.find(
        (row) =>
          row.text_answer &&
          row.text_answer.trim() !== ""
      )?.text_answer || null;

    const firstImage =
      groupRows.find(
        (row) =>
          row.image_url &&
          row.image_url.trim() !== ""
      )?.image_url || null;

    const firstTutorFeedback =
      groupRows.find(
        (row) =>
          row.tutor_feedback &&
          row.tutor_feedback.trim() !== ""
      )?.tutor_feedback || null;

    const firstTeacherFeedback =
      groupRows.find(
        (row) =>
          row.teacher_feedback &&
          row.teacher_feedback.trim() !== ""
      )?.teacher_feedback || null;

    const firstCorrection =
      groupRows.find(
        (row) =>
          row.correction_file_url &&
          row.correction_file_url.trim() !== ""
      )?.correction_file_url || null;

    const firstScore =
      groupRows.find(
        (row) => row.score !== null
      )?.score ?? null;

    const firstTotalMarks =
      groupRows.find(
        (row) => row.total_marks !== null
      )?.total_marks ?? null;

    const firstPercentage =
      groupRows.find(
        (row) => row.percentage !== null
      )?.percentage ?? null;

    const firstGrade =
      groupRows.find(
        (row) =>
          row.grade &&
          row.grade.trim() !== ""
      )?.grade || null;

    const firstStatus =
      groupRows.find(
        (row) =>
          row.status &&
          row.status.trim() !== ""
      )?.status ||
      latestRow.status ||
      "Submitted";

    const firstSubmittedAt =
      groupRows.find(
        (row) => row.submitted_at
      )?.submitted_at ||
      latestRow.submitted_at ||
      null;

    combined.push({
      id: latestRow.id,

      rowIds: groupRows.map(
        (row) => row.id
      ),

      classwork_id:
        latestRow.classwork_id,

      student_id:
        latestRow.student_id,

      student_email:
        latestRow.student_email,

      subject:
        latestRow.subject,

      title:
        latestRow.title,

      text_answer:
        firstText,

      image_url:
        firstImage,

      status:
        firstStatus,

      submitted_at:
        firstSubmittedAt,

      score:
        firstScore,

      total_marks:
        firstTotalMarks,

      percentage:
        firstPercentage,

      grade:
        firstGrade,

      tutor_feedback:
        firstTutorFeedback,

      teacher_feedback:
        firstTeacherFeedback,

      correction_file_url:
        firstCorrection,
    });
  }

  combined.sort((a, b) => {
    const dateA = a.submitted_at
      ? new Date(a.submitted_at).getTime()
      : 0;

    const dateB = b.submitted_at
      ? new Date(b.submitted_at).getTime()
      : 0;

    return dateB - dateA;
  });

  return combined;
}

/* =========================================================
   PAGE
========================================================= */

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

  /*
   * NEW:
   *
   * Keeps track of which history cards
   * the student has opened.
   */
  const [expandedHistory, setExpandedHistory] =
    useState<string | null>(null);

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

        const logicalSubmissions =
          combineSubmissionRows(
            (submissionData ||
              []) as SubmissionRow[]
          );

        console.log(
          "Student classwork submissions:",
          {
            classworkId,
            studentId:
              studentData.id,
            rawRows:
              submissionData || [],
            logicalSubmissions,
          }
        );

        setSubmissions(
          logicalSubmissions
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
     PREVIOUS ATTEMPTS
  ========================================================= */

  const previousSubmissions =
    useMemo(
      () =>
        submissions.slice(1),
      [submissions]
    );

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
        error: reloadError,
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

      if (reloadError) {
        throw reloadError;
      }

      const logicalSubmissions =
        combineSubmissionRows(
          (updatedSubmissions ||
            []) as SubmissionRow[]
        );

      console.log(
        "Updated student submissions:",
        {
          classworkId:
            classwork.id,
          studentId:
            student.id,
          rawRows:
            updatedSubmissions || [],
          logicalSubmissions,
        }
      );

      setSubmissions(
        logicalSubmissions
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
     TOGGLE HISTORY
  ========================================================= */

  function toggleHistory(id: string) {
    setExpandedHistory(
      (current) =>
        current === id
          ? null
          : id
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2
                size={19}
                className="animate-spin"
              />

              <p className="text-sm font-semibold">
                Loading classwork...
              </p>
            </div>
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
            BACK
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

          <div className="flex flex-wrap items-center gap-2">

            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-yellow-700">
              {classwork.subject}
            </span>

            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
              {classwork.status || "Published"}
            </span>

          </div>

          <h1 className="mt-3 break-words text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
            {classwork.title}
          </h1>

          <div className="mt-4 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:text-sm">

            {classwork.created_at && (
              <span>
                Posted{" "}
                {formatShortDate(
                  classwork.created_at
                )}
              </span>
            )}

            {classwork.due_date && (
              <span className="flex items-center gap-1.5">
                <Clock size={15} />

                Due{" "}
                {formatShortDate(
                  classwork.due_date
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
                  Your latest submission
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your most recent attempt
                </p>
              </div>

              <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                {latestSubmission.status ||
                  "Submitted"}
              </span>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

              {latestSubmission.submitted_at && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock size={15} />

                  <span>
                    Submitted{" "}
                    {formatDate(
                      latestSubmission.submitted_at
                    )}
                  </span>
                </div>
              )}

              {/* WRITTEN ANSWER */}

              {latestSubmission.text_answer && (
                <div className="mt-5">

                  <div className="flex items-center gap-2">
                    <MessageSquare
                      size={17}
                      className="text-yellow-600"
                    />

                    <p className="text-sm font-bold text-slate-800">
                      Written answer
                    </p>
                  </div>

                  <div className="mt-2 rounded-xl bg-slate-50 p-4">

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

                  <div className="flex items-center gap-2">

                    <FileText
                      size={17}
                      className="text-slate-500"
                    />

                    <p className="text-sm font-bold text-slate-800">
                      Uploaded work
                    </p>

                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">

                    <a
                      href={
                        latestSubmission.image_url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
                    >
                      <ExternalLink size={16} />
                      View Submission
                    </a>

                    <a
                      href={
                        latestSubmission.image_url
                      }
                      download
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <Download size={16} />
                      Download
                    </a>

                  </div>

                  {isImage(
                    latestSubmission.image_url
                  ) && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <img
                        src={
                          latestSubmission.image_url
                        }
                        alt="Student submitted work"
                        className="mx-auto max-h-[600px] max-w-full rounded-lg object-contain"
                      />
                    </div>
                  )}

                  {isPdf(
                    latestSubmission.image_url
                  ) && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <iframe
                        src={
                          latestSubmission.image_url
                        }
                        title="Student submitted PDF"
                        className="h-[650px] w-full"
                      />
                    </div>
                  )}

                  {isWordDocument(
                    latestSubmission.image_url
                  ) && (
                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-sm font-bold text-blue-900">
                        Word document
                      </p>

                      <p className="mt-1 text-xs leading-5 text-blue-700">
                        Download the document to open it.
                      </p>
                    </div>
                  )}

                </div>
              )}

              {!latestSubmission.text_answer &&
                !latestSubmission.image_url && (
                  <div className="mt-5 rounded-xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">
                      No written answer or uploaded file was attached to this attempt.
                    </p>
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

                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Score
                    </p>

                    <p className="mt-1 font-black text-slate-900">
                      {latestSubmission.score ?? "—"}

                      {latestSubmission.total_marks !==
                        null &&
                        ` / ${latestSubmission.total_marks}`}
                    </p>

                  </div>

                  <div className="border-b border-slate-200 p-4 text-center sm:border-b-0">

                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
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

                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
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

              {/* CORRECTION TEXT */}

              {latestSubmission.tutor_feedback &&
                latestSubmission.tutor_feedback !==
                  latestSubmission.teacher_feedback && (
                  <div className="mt-5 rounded-xl border border-yellow-100 bg-yellow-50 p-4">

                    <div className="flex items-center gap-2">

                      <MessageSquare
                        size={17}
                        className="text-yellow-700"
                      />

                      <p className="text-sm font-bold text-yellow-900">
                        Correction
                      </p>

                    </div>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-yellow-900">
                      {
                        latestSubmission.tutor_feedback
                      }
                    </p>

                  </div>
                )}

              {/* CORRECTION FILE */}

              {latestSubmission.correction_file_url && (
                <div className="mt-6 flex flex-col gap-4 rounded-xl bg-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-sm font-bold text-orange-900">
                      Correction available
                    </p>

                    <p className="mt-1 text-xs leading-5 text-orange-700">
                      Your tutor has provided a correction file.
                    </p>

                  </div>

                  <div className="flex flex-wrap gap-2">

                    <a
                      href={
                        latestSubmission.correction_file_url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700"
                    >
                      <ExternalLink size={15} />
                      View
                    </a>

                    <a
                      href={
                        latestSubmission.correction_file_url
                      }
                      download
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-800 hover:bg-orange-50"
                    >
                      <Download size={15} />
                      Download
                    </a>

                  </div>

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
              onClick={
                submitAnswer
              }
              disabled={
                submitting
              }
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
            SUBMISSION HISTORY
        ================================================= */}

        {previousSubmissions.length > 0 && (
          <section className="mt-7 pb-8 sm:mt-8 sm:pb-12">

            <div className="mb-4 flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <History
                  size={20}
                  className="text-slate-500"
                />
              </div>

              <div>

                <h2 className="text-lg font-black text-slate-950 sm:text-xl">
                  Submission history
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  View your previous attempts, submitted work and tutor corrections.
                </p>

              </div>

            </div>

            <div className="space-y-3">

              {previousSubmissions.map(
                (
                  submission,
                  index
                ) => {

                  const isExpanded =
                    expandedHistory ===
                    submission.id;

                  const attemptNumber =
                    previousSubmissions.length -
                    index;

                  return (
                    <div
                      key={
                        submission.id
                      }
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >

                      {/* =================================================
                          HISTORY HEADER
                      ================================================= */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleHistory(
                            submission.id
                          )
                        }
                        className="w-full p-4 text-left transition hover:bg-slate-50 sm:p-5"
                      >

                        <div className="flex items-center justify-between gap-4">

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <p className="text-sm font-black text-slate-900">
                                Attempt{" "}
                                {attemptNumber}
                              </p>

                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                                {submission.status ||
                                  "Submitted"}
                              </span>

                            </div>

                            {submission.submitted_at && (
                              <p className="mt-1.5 text-xs text-slate-500">
                                {formatDate(
                                  submission.submitted_at
                                )}
                              </p>
                            )}

                          </div>

                          <div className="flex shrink-0 items-center gap-2">

                            {submission.percentage !==
                              null && (
                              <span className="hidden rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 sm:inline-flex">
                                {
                                  submission.percentage
                                }
                                %
                              </span>
                            )}

                            {isExpanded ? (
                              <ChevronUp
                                size={19}
                                className="text-slate-500"
                              />
                            ) : (
                              <ChevronDown
                                size={19}
                                className="text-slate-500"
                              />
                            )}

                          </div>

                        </div>

                      </button>

                      {/* =================================================
                          HISTORY CONTENT
                      ================================================= */}

                      {isExpanded && (
                        <div className="border-t border-slate-100 p-4 sm:p-5">

                          {/* SCORE */}

                          {(
                            submission.score !==
                              null ||
                            submission.percentage !==
                              null ||
                            submission.grade
                          ) && (
                            <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:grid-cols-3 sm:divide-x">

                              <div className="border-b border-slate-200 p-4 text-center sm:border-b-0">

                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                  Score
                                </p>

                                <p className="mt-1 font-black text-slate-900">
                                  {submission.score ??
                                    "—"}

                                  {submission.total_marks !==
                                    null &&
                                    ` / ${submission.total_marks}`}
                                </p>

                              </div>

                              <div className="border-b border-slate-200 p-4 text-center sm:border-b-0">

                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                  Percentage
                                </p>

                                <p className="mt-1 font-black text-slate-900">
                                  {submission.percentage !==
                                  null
                                    ? `${submission.percentage}%`
                                    : "—"}
                                </p>

                              </div>

                              <div className="p-4 text-center">

                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                  Grade
                                </p>

                                <p className="mt-1 font-black text-slate-900">
                                  {submission.grade ||
                                    "—"}
                                </p>

                              </div>

                            </div>
                          )}

                          {/* WRITTEN ANSWER */}

                          {submission.text_answer && (
                            <div className="mt-5">

                              <div className="flex items-center gap-2">

                                <MessageSquare
                                  size={17}
                                  className="text-yellow-600"
                                />

                                <p className="text-sm font-bold text-slate-800">
                                  Your written answer
                                </p>

                              </div>

                              <div className="mt-2 rounded-xl bg-slate-50 p-4">

                                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                                  {
                                    submission.text_answer
                                  }
                                </p>

                              </div>

                            </div>
                          )}

                          {/* SUBMITTED FILE */}

                          {submission.image_url && (
                            <div className="mt-5">

                              <div className="flex items-center gap-2">

                                <FileText
                                  size={17}
                                  className="text-slate-500"
                                />

                                <p className="text-sm font-bold text-slate-800">
                                  Submitted work
                                </p>

                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">

                                <a
                                  href={
                                    submission.image_url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                                >
                                  <ExternalLink
                                    size={16}
                                  />

                                  View Submission
                                </a>

                                <a
                                  href={
                                    submission.image_url
                                  }
                                  download
                                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                                >
                                  <Download
                                    size={16}
                                  />

                                  Download
                                </a>

                              </div>

                              {/* IMAGE PREVIEW */}

                              {isImage(
                                submission.image_url
                              ) && (
                                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">

                                  <img
                                    src={
                                      submission.image_url
                                    }
                                    alt="Previous submitted work"
                                    className="mx-auto max-h-[600px] max-w-full rounded-lg object-contain"
                                  />

                                </div>
                              )}

                              {/* PDF PREVIEW */}

                              {isPdf(
                                submission.image_url
                              ) && (
                                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">

                                  <iframe
                                    src={
                                      submission.image_url
                                    }
                                    title="Previous submitted PDF"
                                    className="h-[650px] w-full"
                                  />

                                </div>
                              )}

                              {/* WORD FILE */}

                              {isWordDocument(
                                submission.image_url
                              ) && (
                                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">

                                  <p className="text-sm font-bold text-blue-900">
                                    {
                                      getFileLabel(
                                        submission.image_url
                                      )
                                    }
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-blue-700">
                                    Use the download button above to open this document.
                                  </p>

                                </div>
                              )}

                            </div>
                          )}

                          {/* NO ANSWER */}

                          {!submission.text_answer &&
                            !submission.image_url && (
                              <div className="mt-5 rounded-xl bg-slate-50 p-4">

                                <p className="text-sm text-slate-500">
                                  No written answer or uploaded file was attached to this attempt.
                                </p>

                              </div>
                            )}

                          {/* TUTOR FEEDBACK */}

                          {(
                            submission.tutor_feedback ||
                            submission.teacher_feedback
                          ) && (
                            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

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
                                {submission.tutor_feedback ||
                                  submission.teacher_feedback}
                              </p>

                            </div>
                          )}

                          {/* CORRECTION FILE */}

                          {submission.correction_file_url && (
                            <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-4">

                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                  <p className="text-sm font-bold text-orange-900">
                                    Correction available
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-orange-700">
                                    Your tutor provided a correction for this attempt.
                                  </p>

                                </div>

                                <div className="flex flex-wrap gap-2">

                                  <a
                                    href={
                                      submission.correction_file_url
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-700"
                                  >
                                    <ExternalLink
                                      size={15}
                                    />

                                    View Correction
                                  </a>

                                  <a
                                    href={
                                      submission.correction_file_url
                                    }
                                    download
                                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-800 transition hover:bg-orange-50"
                                  >
                                    <Download
                                      size={15}
                                    />

                                    Download Correction
                                  </a>

                                </div>

                              </div>

                              {/* CORRECTION IMAGE */}

                              {isImage(
                                submission.correction_file_url
                              ) && (
                                <div className="mt-4 overflow-hidden rounded-xl border border-orange-100 bg-white p-3">

                                  <img
                                    src={
                                      submission.correction_file_url
                                    }
                                    alt="Tutor correction"
                                    className="mx-auto max-h-[600px] max-w-full rounded-lg object-contain"
                                  />

                                </div>
                              )}

                              {/* CORRECTION PDF */}

                              {isPdf(
                                submission.correction_file_url
                              ) && (
                                <div className="mt-4 overflow-hidden rounded-xl border border-orange-100 bg-white">

                                  <iframe
                                    src={
                                      submission.correction_file_url
                                    }
                                    title="Tutor correction PDF"
                                    className="h-[650px] w-full"
                                  />

                                </div>
                              )}

                              {/* CORRECTION WORD */}

                              {isWordDocument(
                                submission.correction_file_url
                              ) && (
                                <div className="mt-4 rounded-lg border border-orange-100 bg-white p-3">

                                  <p className="text-xs font-semibold text-orange-800">
                                    Word correction document
                                  </p>

                                  <p className="mt-1 text-xs text-orange-700">
                                    Download the correction to open it.
                                  </p>

                                </div>
                              )}

                            </div>
                          )}

                          {/* NO CORRECTION */}

                          {!submission.correction_file_url &&
                            !submission.tutor_feedback &&
                            !submission.teacher_feedback && (
                              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">

                                <p className="text-sm text-slate-500">
                                  No tutor correction or feedback has been added to this attempt yet.
                                </p>

                              </div>
                            )}

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>

          </section>
        )}

      </div>
    </main>
  );
}