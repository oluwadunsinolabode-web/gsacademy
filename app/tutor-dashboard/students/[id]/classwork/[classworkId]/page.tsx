"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  ExternalLink,
  Download,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  X,
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
  status: string;
  created_at: string;
};

type Student = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type Submission = {
  id: string;
  classwork_id: string;
  student_id: string | null;
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
  if (!value) return "Not provided";

  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDate(value: string | null) {
  if (!value) return "Not provided";

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

/* =========================================================
PAGE
========================================================= */

export default function TutorClassworkDetailsPage() {
  const params = useParams();

  const studentId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const classworkId = Array.isArray(params.classworkId)
    ? params.classworkId[0]
    : params.classworkId;

  /* =======================================================
  DATA
  ======================================================= */

  const [student, setStudent] =
    useState<Student | null>(null);

  const [classwork, setClasswork] =
    useState<Classwork | null>(null);

  const [submission, setSubmission] =
    useState<Submission | null>(null);

  /* =======================================================
  STATE
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingCorrection, setUploadingCorrection] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  /* =======================================================
  MARKING / FEEDBACK
  ======================================================= */

  const [score, setScore] =
    useState("");

  const [totalMarks, setTotalMarks] =
    useState("");

  const [grade, setGrade] =
    useState("");

  const [feedback, setFeedback] =
    useState("");

  const [correctionText, setCorrectionText] =
    useState("");

  const [correctionFile, setCorrectionFile] =
    useState<File | null>(null);

  /* =======================================================
  LOAD PAGE
  ======================================================= */

  useEffect(() => {
    if (!studentId || !classworkId) return;

    loadPage();
  }, [studentId, classworkId]);

  async function loadPage() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      /* -----------------------------------------------
         LOGGED-IN USER
      ----------------------------------------------- */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "You must be logged in as a tutor."
        );
      }

      /* -----------------------------------------------
         GET TUTOR
      ----------------------------------------------- */

      const {
        data: tutor,
        error: tutorError,
      } = await supabase
        .from("tutors")
        .select("id, full_name")
        .eq("auth_id", user.id)
        .single();

      if (tutorError || !tutor) {
        throw new Error(
          tutorError?.message ||
            "Tutor profile could not be found."
        );
      }

      /* -----------------------------------------------
         GET STUDENT
      ----------------------------------------------- */

      const {
        data: studentData,
        error: studentError,
      } = await supabase
        .from("students")
        .select(
          "id, full_name, email"
        )
        .eq("id", studentId)
        .single();

      if (studentError || !studentData) {
        throw new Error(
          studentError?.message ||
            "Student could not be found."
        );
      }

      setStudent(studentData);

      /* -----------------------------------------------
         GET CLASSWORK
         Must belong to logged-in tutor.
      ----------------------------------------------- */

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
        .eq("id", classworkId)
        .eq("tutor_id", tutor.id)
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

      setClasswork(classworkData);

      /* -----------------------------------------------
         VERIFY CLASSWORK ASSIGNMENT
      ----------------------------------------------- */

      const {
        data: assignment,
        error: assignmentError,
      } = await supabase
        .from("classwork_assignments")
        .select(
          "classwork_id, student_id"
        )
        .eq(
          "classwork_id",
          classworkId
        )
        .eq(
          "student_id",
          studentId
        )
        .maybeSingle();

      if (assignmentError) {
        throw new Error(
          assignmentError.message
        );
      }

      if (!assignment) {
        throw new Error(
          "This classwork is not assigned to this student."
        );
      }

      /* -----------------------------------------------
         GET ALL SUBMISSIONS FOR THIS CLASSWORK
         We deliberately fetch the records first,
         then identify the student's submission.

         This handles both:
         - newer submissions using student_id
         - older submissions using student_email
      ----------------------------------------------- */

      const {
        data: submissionRows,
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
        .order(
          "submitted_at",
          {
            ascending: false,
          }
        );

      if (submissionError) {
        throw new Error(
          submissionError.message
        );
      }

      /* -----------------------------------------------
         MATCH STUDENT

         Primary match:
         student_id

         Fallback:
         student_email
      ----------------------------------------------- */

      const normalizedStudentEmail =
        studentData.email
          ?.trim()
          .toLowerCase() || "";

      const matchingSubmissions =
        (submissionRows || []).filter(
          (item: Submission) => {
            const sameStudentId =
              !!item.student_id &&
              item.student_id ===
                studentData.id;

            const sameStudentEmail =
              !!normalizedStudentEmail &&
              !!item.student_email &&
              item.student_email
                .trim()
                .toLowerCase() ===
                normalizedStudentEmail;

            return (
              sameStudentId ||
              sameStudentEmail
            );
          }
        );

      /*
       * Because submissions are ordered newest first,
       * the first matching record is the student's
       * latest submission.
       */

      const latestSubmission =
        matchingSubmissions[0] ||
        null;

      setSubmission(
        latestSubmission
      );

      /* -----------------------------------------------
         LOAD EXISTING MARKING
      ----------------------------------------------- */

      if (latestSubmission) {
        setScore(
          latestSubmission.score !== null
            ? String(
                latestSubmission.score
              )
            : ""
        );

        setTotalMarks(
          latestSubmission.total_marks !==
          null
            ? String(
                latestSubmission.total_marks
              )
            : ""
        );

        setGrade(
          latestSubmission.grade || ""
        );

        setFeedback(
          latestSubmission.teacher_feedback ||
            latestSubmission.tutor_feedback ||
            ""
        );

        setCorrectionText(
          latestSubmission.tutor_feedback ||
            ""
        );
      } else {
        setScore("");
        setTotalMarks("");
        setGrade("");
        setFeedback("");
        setCorrectionText("");
      }
    } catch (err) {
      console.error(
        "Classwork details loading error:",
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
  SAVE MARK / FEEDBACK
  ======================================================= */

  async function saveMarking(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!submission) {
      setError(
        "There is no student submission to mark."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const numericScore =
        score.trim() !== ""
          ? Number(score)
          : null;

      const numericTotal =
        totalMarks.trim() !== ""
          ? Number(totalMarks)
          : null;

      if (
        numericScore !== null &&
        Number.isNaN(numericScore)
      ) {
        throw new Error(
          "Please enter a valid score."
        );
      }

      if (
        numericTotal !== null &&
        Number.isNaN(numericTotal)
      ) {
        throw new Error(
          "Please enter valid total marks."
        );
      }

      if (
        numericScore !== null &&
        numericTotal !== null &&
        numericScore > numericTotal
      ) {
        throw new Error(
          "Score cannot be greater than total marks."
        );
      }

      let percentage: number | null =
        null;

      if (
        numericScore !== null &&
        numericTotal !== null &&
        numericTotal > 0
      ) {
        percentage =
          (numericScore /
            numericTotal) *
          100;
      }

      const {
        data: updatedSubmission,
        error: updateError,
      } = await supabase
        .from(
          "classwork_submissions"
        )
        .update({
          score: numericScore,
          total_marks: numericTotal,
          percentage:
            percentage !== null
              ? Number(
                  percentage.toFixed(2)
                )
              : null,
          grade:
            grade.trim() || null,
          teacher_feedback:
            feedback.trim() || null,
          tutor_feedback:
            feedback.trim() || null,
          status: "marked",
        })
        .eq(
          "id",
          submission.id
        )
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

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      setSubmission(
        updatedSubmission
      );

      setMessage(
        "Mark and feedback saved successfully."
      );
    } catch (err) {
      console.error(
        "Marking error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save marking."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
  SAVE CORRECTION
  ======================================================= */

  async function saveCorrection() {
    if (!submission) {
      setError(
        "There is no submission to attach a correction to."
      );
      return;
    }

    if (
      !correctionText.trim() &&
      !correctionFile
    ) {
      setError(
        "Enter correction text or choose a correction file."
      );
      return;
    }

    try {
      setUploadingCorrection(true);
      setError("");
      setMessage("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "You must be logged in."
        );
      }

      let correctionFileUrl =
        submission.correction_file_url;

      /* -----------------------------------------------
         UPLOAD CORRECTION FILE
      ----------------------------------------------- */

      if (correctionFile) {
        const safeFileName =
          correctionFile.name
            .replace(
              /[^a-zA-Z0-9._-]/g,
              "_"
            )
            .replace(
              /\s+/g,
              "_"
            );

        const filePath =
          `tutor-corrections/${user.id}/${studentId}/${classworkId}/${crypto.randomUUID()}-${safeFileName}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from(
            "classwork-submissions"
          )
          .upload(
            filePath,
            correctionFile,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                correctionFile.type ||
                undefined,
            }
          );

        if (uploadError) {
          throw new Error(
            `Correction upload failed: ${uploadError.message}`
          );
        }

        const {
          data: publicUrlData,
        } = supabase.storage
          .from(
            "classwork-submissions"
          )
          .getPublicUrl(
            filePath
          );

        correctionFileUrl =
          publicUrlData.publicUrl;
      }

      /* -----------------------------------------------
         SAVE CORRECTION
      ----------------------------------------------- */

      const {
        data: updatedSubmission,
        error: updateError,
      } = await supabase
        .from(
          "classwork_submissions"
        )
        .update({
          correction_file_url:
            correctionFileUrl ||
            null,

          tutor_feedback:
            correctionText.trim() ||
            submission.tutor_feedback ||
            null,
        })
        .eq(
          "id",
          submission.id
        )
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

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      setSubmission(
        updatedSubmission
      );

      setCorrectionFile(null);

      const fileInput =
        document.getElementById(
          "correction-file"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      setCorrectionText(
        updatedSubmission.tutor_feedback ||
          ""
      );

      setMessage(
        "Correction saved successfully."
      );
    } catch (err) {
      console.error(
        "Correction error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save correction."
      );
    } finally {
      setUploadingCorrection(false);
    }
  }

  /* =======================================================
  LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2
              size={20}
              className="animate-spin"
            />

            <span className="font-semibold">
              Loading classwork...
            </span>
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
        <div className="mx-auto max-w-5xl px-5 py-12">

          <Link
            href={`/tutor-dashboard/students/${studentId}/classwork`}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to Classwork
          </Link>

          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-7">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle size={22} />

              <p className="font-bold">
                {error}
              </p>
            </div>
          </div>

        </div>
      </main>
    );
  }

  /* =======================================================
  MAIN PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-5 py-10">

        {/* BACK */}

        <Link
          href={`/tutor-dashboard/students/${studentId}/classwork`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Classwork
        </Link>

        {/* MESSAGES */}

        {message && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
            <CheckCircle2 size={19} />
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            <div className="flex items-center gap-3">
              <AlertCircle size={19} />
              {error}
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* =================================================
            CLASSWORK HEADER
        ================================================= */}

        <header className="mt-8">

          <div className="flex flex-wrap items-center gap-2">

            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-extrabold text-yellow-700">
              {classwork?.subject}
            </span>

            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
              {classwork?.status}
            </span>

          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
            {classwork?.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">

            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} />

              Published{" "}
              {formatShortDate(
                classwork?.created_at ||
                  null
              )}
            </span>

            {classwork?.due_date && (
              <span>
                Due{" "}
                {formatShortDate(
                  classwork.due_date
                )}
              </span>
            )}

          </div>

        </header>

        {/* =================================================
            TUTOR ASSIGNMENT
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">

          <div className="flex items-center gap-3">

            <FileText
              size={22}
              className="text-yellow-600"
            />

            <h2 className="text-xl font-extrabold text-slate-950">
              Tutor's Assignment
            </h2>

          </div>

          {classwork?.description ? (
            <p className="mt-5 whitespace-pre-wrap leading-8 text-slate-700">
              {classwork.description}
            </p>
          ) : (
            <p className="mt-5 text-sm text-slate-400">
              No written instructions were provided.
            </p>
          )}

          {classwork?.attachment_url && (
            <div className="mt-6 border-t border-slate-100 pt-5">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <FileText
                    size={22}
                    className="text-slate-500"
                  />

                  <div>
                    <p className="font-bold text-slate-900">
                      Tutor Attachment
                    </p>

                    <p className="text-sm text-slate-500">
                      Supporting file for this assignment.
                    </p>
                  </div>

                </div>

                <a
                  href={
                    classwork.attachment_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
                >
                  <ExternalLink size={16} />
                  Open Attachment
                </a>

              </div>

            </div>
          )}

        </section>

        {/* =================================================
            STUDENT SUBMISSION
        ================================================= */}

        <section className="mt-6">

          <div className="mb-4">

            <h2 className="text-xl font-extrabold text-slate-950">
              Student Submission
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {student?.full_name
                ? `Submission from ${student.full_name}.`
                : "Review the student's submitted work below."}
            </p>

          </div>

          {!submission ? (

            <div className="rounded-3xl border border-orange-200 bg-orange-50 p-7">

              <div className="flex items-center gap-3 text-orange-700">

                <AlertCircle size={23} />

                <div>
                  <h3 className="font-extrabold">
                    No submission yet
                  </h3>

                  <p className="mt-1 text-sm">
                    The student has not submitted this classwork.
                  </p>
                </div>

              </div>

            </div>

          ) : (

            <div className="space-y-5">

              {/* SUBMISSION META */}

              <div className="rounded-3xl border border-green-200 bg-green-50 p-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-700">
                      {submission.status ||
                        "Submitted"}
                    </span>

                    {submission.submitted_at && (
                      <p className="mt-3 text-sm text-green-700">
                        Submitted{" "}
                        {formatDate(
                          submission.submitted_at
                        )}
                      </p>
                    )}

                  </div>

                  {submission.score !== null &&
                    submission.total_marks !== null && (
                      <div className="rounded-xl bg-white px-5 py-3 text-center">

                        <p className="text-xs font-bold uppercase text-slate-400">
                          Score
                        </p>

                        <p className="text-2xl font-black text-blue-600">
                          {submission.score}
                          {" / "}
                          {submission.total_marks}
                        </p>

                        {submission.percentage !==
                          null && (
                          <p className="text-xs font-bold text-slate-500">
                            {submission.percentage}%
                          </p>
                        )}

                      </div>
                    )}

                  {submission.grade && (
                    <div className="rounded-xl bg-white px-5 py-3 text-center">

                      <p className="text-xs font-bold uppercase text-slate-400">
                        Grade
                      </p>

                      <p className="text-2xl font-black text-blue-600">
                        {submission.grade}
                      </p>

                    </div>
                  )}

                </div>

              </div>

              {/* WRITTEN SUBMISSION */}

              {submission.text_answer && (
                <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6">

                  <div className="flex items-center gap-3">

                    <MessageSquare
                      size={22}
                      className="text-yellow-600"
                    />

                    <h3 className="text-lg font-extrabold text-slate-950">
                      Written Submission
                    </h3>

                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-5">

                    <p className="whitespace-pre-wrap leading-8 text-slate-700">
                      {submission.text_answer}
                    </p>

                  </div>

                </div>
              )}

              {/* UPLOADED FILE */}

              {submission.image_url && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                      <FileText
                        size={23}
                        className="text-slate-500"
                      />

                      <div>

                        <h3 className="font-extrabold text-slate-950">
                          Uploaded Submission
                        </h3>

                        <p className="text-sm text-slate-500">
                          File submitted by the student.
                        </p>

                      </div>

                    </div>

                    <div className="flex flex-wrap gap-2">

                      <a
                        href={
                          submission.image_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"
                      >
                        <ExternalLink size={16} />
                        View
                      </a>

                      <a
                        href={
                          submission.image_url
                        }
                        download
                        className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-bold text-slate-950"
                      >
                        <Download size={16} />
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
                        alt="Student submission"
                        className="mx-auto max-h-[700px] max-w-full rounded-xl object-contain"
                      />

                    </div>
                  )}

                  {isPdf(
                    submission.image_url
                  ) && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

                      <iframe
                        src={
                          submission.image_url
                        }
                        title="Student submitted PDF"
                        className="h-[700px] w-full"
                      />

                    </div>
                  )}

                </div>
              )}

              {/* =================================================
                  MARKING
              ================================================= */}

              <form
                onSubmit={saveMarking}
                className="rounded-3xl border border-blue-200 bg-blue-50 p-6"
              >

                <div className="flex items-center gap-3">

                  <CheckCircle2
                    size={23}
                    className="text-blue-600"
                  />

                  <div>

                    <h3 className="text-xl font-extrabold text-slate-950">
                      Mark Submission
                    </h3>

                    <p className="text-sm text-slate-500">
                      Add the student's score, grade and feedback.
                    </p>

                  </div>

                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Score
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={score}
                      onChange={(event) =>
                        setScore(
                          event.target.value
                        )
                      }
                      placeholder="e.g. 18"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Total Marks
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={totalMarks}
                      onChange={(event) =>
                        setTotalMarks(
                          event.target.value
                        )
                      }
                      placeholder="e.g. 20"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Grade
                    </label>

                    <input
                      type="text"
                      value={grade}
                      onChange={(event) =>
                        setGrade(
                          event.target.value
                        )
                      }
                      placeholder="e.g. A"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>

                </div>

                <div className="mt-5">

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Tutor Feedback
                  </label>

                  <textarea
                    value={feedback}
                    onChange={(event) =>
                      setFeedback(
                        event.target.value
                      )
                    }
                    rows={5}
                    placeholder="Write feedback for the student..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 leading-7 outline-none focus:border-blue-500"
                  />

                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                >

                  {saving ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={18} />
                  )}

                  {saving
                    ? "Saving..."
                    : "Save Mark & Feedback"}

                </button>

              </form>

              {/* =================================================
                  CORRECTION
              ================================================= */}

              <section className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6">

                <div className="flex items-center gap-3">

                  <MessageSquare
                    size={23}
                    className="text-yellow-600"
                  />

                  <div>

                    <h3 className="text-xl font-extrabold text-slate-950">
                      Correction
                    </h3>

                    <p className="text-sm text-slate-500">
                      Send the student a correction as text or a file.
                    </p>

                  </div>

                </div>

                <textarea
                  value={correctionText}
                  onChange={(event) =>
                    setCorrectionText(
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder="Write the correction here..."
                  className="mt-5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 leading-7 outline-none focus:border-yellow-500"
                />

                <div className="mt-5">

                  <label
                    htmlFor="correction-file"
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 hover:border-yellow-500"
                  >

                    <FileText
                      size={20}
                      className="text-slate-500"
                    />

                    <span className="text-sm font-semibold text-slate-700">
                      {correctionFile
                        ? correctionFile.name
                        : "Attach correction file"}
                    </span>

                  </label>

                  <input
                    id="correction-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(event) =>
                      setCorrectionFile(
                        event.target
                          .files?.[0] ||
                          null
                      )
                    }
                  />

                </div>

                <button
                  type="button"
                  onClick={
                    saveCorrection
                  }
                  disabled={
                    uploadingCorrection
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-950 hover:bg-yellow-400 disabled:opacity-60"
                >

                  {uploadingCorrection ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={18} />
                  )}

                  {uploadingCorrection
                    ? "Saving..."
                    : "Send Correction"}

                </button>

                {/* EXISTING CORRECTION */}

                {submission.correction_file_url && (
                  <div className="mt-6 border-t border-yellow-200 pt-5">

                    <a
                      href={
                        submission.correction_file_url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-bold text-slate-900 underline underline-offset-4 hover:text-yellow-700"
                    >
                      <ExternalLink size={16} />
                      View Correction →
                    </a>

                  </div>
                )}

              </section>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}