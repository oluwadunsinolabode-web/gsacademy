"use client";

import { useEffect, useState } from "react";
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
  History,
  Eye,
} from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value) {
  if (!value) return "No date";

  return new Date(value).toLocaleString();
}

function formatShortDate(value) {
  if (!value) return null;

  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getFileType(url) {
  if (!url) return "unknown";

  const cleanUrl = url.split("?")[0].toLowerCase();

  if (/\.(jpg|jpeg|png|gif|webp)$/.test(cleanUrl)) {
    return "image";
  }

  if (/\.pdf$/.test(cleanUrl)) {
    return "pdf";
  }

  if (/\.(doc|docx)$/.test(cleanUrl)) {
    return "document";
  }

  return "unknown";
}

function isBrowserViewable(url) {
  const type = getFileType(url);

  return type === "image" || type === "pdf";
}

function isDoc(url) {
  if (!url) return false;

  const cleanUrl = url.split("?")[0].toLowerCase();

  return /\.(doc|docx)$/.test(cleanUrl);
}

function getFileName(url) {
  if (!url) return "Submitted file";

  try {
    const cleanUrl = url.split("?")[0];
    const parts = cleanUrl.split("/");
    const lastPart = parts[parts.length - 1];

    return decodeURIComponent(lastPart || "Submitted file");
  } catch {
    return "Submitted file";
  }
}

function getSubmissionNumber(submissions, submissionId) {
  const index = submissions.findIndex(
    (item) => item.id === submissionId
  );

  if (index === -1) return null;

  return submissions.length - index;
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

  const [classwork, setClasswork] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  /* =======================================================
     FORM
  ======================================================= */

  const [textAnswer, setTextAnswer] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  /* =======================================================
     UI
  ======================================================= */

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =======================================================
     LATEST SUBMISSION
  ======================================================= */

  const latestSubmission =
    submissions.length > 0 ? submissions[0] : null;

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
        .select("id, auth_id, full_name, email")
        .eq("auth_id", user.id)
        .single();

      if (studentError || !student) {
        throw new Error(
          studentError?.message ||
            "Student profile could not be found."
        );
      }

      /* -----------------------------------------------
         VERIFY CLASSWORK IS ASSIGNED
      ------------------------------------------------ */

      const {
        data: assignment,
        error: assignmentError,
      } = await supabase
        .from("classwork_assignments")
        .select("classwork_id, student_id")
        .eq("classwork_id", classworkId)
        .eq("student_id", student.id)
        .maybeSingle();

      if (assignmentError) {
        throw new Error(assignmentError.message);
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
        .single();

      if (classworkError || !classworkData) {
        throw new Error(
          classworkError?.message ||
            "Classwork could not be found."
        );
      }

      setClasswork(classworkData);

      /* -----------------------------------------------
         GET ALL STUDENT SUBMISSIONS
      ------------------------------------------------ */

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
          tutor_feedback,
          teacher_feedback,
          submitted_at,
          score,
          total_marks,
          percentage,
          grade,
          correction_file_url
        `)
        .eq("classwork_id", classworkId)
        .eq("student_id", student.id)
        .order("submitted_at", {
          ascending: false,
        });

      if (submissionError) {
        throw new Error(submissionError.message);
      }

      const loadedSubmissions = submissionData || [];

      setSubmissions(loadedSubmissions);

      /* -----------------------------------------------
         PRE-FILL LATEST TEXT
      ------------------------------------------------ */

      if (loadedSubmissions.length > 0) {
        setTextAnswer(
          loadedSubmissions[0].text_answer || ""
        );
      } else {
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

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;

    setError("");
    setMessage("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    /* 10MB LIMIT */

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "The selected file is larger than 10MB."
      );

      event.target.value = "";
      setSelectedFile(null);

      return;
    }

    /* -----------------------------------------------
       ALLOWED FILE TYPES
    ------------------------------------------------ */

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
     SUBMIT / UPDATE ANSWER
  ======================================================= */

  async function submitAnswer(event) {
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
        throw new Error("You must be logged in.");
      }

      /* -----------------------------------------------
         STUDENT
      ------------------------------------------------ */

      const {
        data: student,
        error: studentError,
      } = await supabase
        .from("students")
        .select("id, auth_id, email")
        .eq("auth_id", user.id)
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
         FIND EXISTING LATEST SUBMISSION
      ------------------------------------------------ */

      const {
        data: existingSubmission,
        error: existingSubmissionError,
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
          tutor_feedback,
          teacher_feedback,
          submitted_at,
          score,
          total_marks,
          percentage,
          grade,
          correction_file_url
        `)
        .eq("classwork_id", classwork.id)
        .eq("student_id", student.id)
        .order("submitted_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      /* IMPORTANT:
         This is the corrected variable name.
      */

      if (existingSubmissionError) {
        throw new Error(
          existingSubmissionError.message
        );
      }

      /* -----------------------------------------------
         UPLOAD NEW FILE IF SELECTED
      ------------------------------------------------ */

      let uploadedFileUrl = null;

      if (selectedFile) {
        const safeFileName = selectedFile.name
          .replace(/[^a-zA-Z0-9._-]/g, "_")
          .replace(/\s+/g, "_");

        const filePath =
          `students/${student.id}/classwork/${classwork.id}/${crypto.randomUUID()}-${safeFileName}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("classwork-submissions")
          .upload(
            filePath,
            selectedFile,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                selectedFile.type || undefined,
            }
          );

        if (uploadError) {
          throw new Error(
            `File upload failed: ${uploadError.message}`
          );
        }

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("classwork-submissions")
          .getPublicUrl(filePath);

        uploadedFileUrl =
          publicUrlData.publicUrl;
      }

      /* -----------------------------------------------
         PREPARE DATA
      ------------------------------------------------ */

      const submissionData = {
        student_email:
          student.email ||
          user.email ||
          existingSubmission?.student_email ||
          null,

        subject: classwork.subject,

        title: classwork.title,

        text_answer:
          textAnswer.trim() ||
          existingSubmission?.text_answer ||
          null,

        image_url:
          uploadedFileUrl ||
          existingSubmission?.image_url ||
          null,

        status: "submitted",

        submitted_at:
          new Date().toISOString(),
      };

      /* -----------------------------------------------
         EXISTING SUBMISSION
         UPDATE SAME ROW
      ------------------------------------------------ */

      if (existingSubmission) {
        const {
          data: updatedSubmission,
          error: updateError,
        } = await supabase
          .from("classwork_submissions")
          .update(submissionData)
          .eq("id", existingSubmission.id)
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
            tutor_feedback,
            teacher_feedback,
            submitted_at,
            score,
            total_marks,
            percentage,
            grade,
            correction_file_url
          `)
          .single();

        if (
          updateError ||
          !updatedSubmission
        ) {
          throw new Error(
            updateError?.message ||
              "Unable to update your submission."
          );
        }

        const updated = updatedSubmission;

        setSubmissions((current) =>
          current.map((item) =>
            item.id === updated.id
              ? updated
              : item
          )
        );

        setTextAnswer(
          updated.text_answer || ""
        );

        setSelectedFile(null);

        const fileInput =
          document.getElementById(
            "student-answer-file"
          );

        if (fileInput) {
          fileInput.value = "";
        }

        setMessage(
          "Your submission has been updated successfully. Your written answer and uploaded file are saved together."
        );

        return;
      }

      /* -----------------------------------------------
         NO EXISTING SUBMISSION
         CREATE FIRST ROW
      ------------------------------------------------ */

      const {
        data: newSubmission,
        error: insertError,
      } = await supabase
        .from("classwork_submissions")
        .insert({
          classwork_id: classwork.id,
          student_id: student.id,
          ...submissionData,
        })
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
          tutor_feedback,
          teacher_feedback,
          submitted_at,
          score,
          total_marks,
          percentage,
          grade,
          correction_file_url
        `)
        .single();

      if (
        insertError ||
        !newSubmission
      ) {
        throw new Error(
          insertError?.message ||
            "Unable to submit your answer."
        );
      }

      const created = newSubmission;

      setSubmissions([created]);

      setTextAnswer(
        created.text_answer || ""
      );

      setSelectedFile(null);

      const fileInput =
        document.getElementById(
          "student-answer-file"
        );

      if (fileInput) {
        fileInput.value = "";
      }

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
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 lg:py-10">

        {/* BACK TO DASHBOARD */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <header className="mt-7">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-700">
              {classwork.subject}
            </span>

            {latestSubmission?.status && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                  latestSubmission.status.toLowerCase() === "marked"
                    ? "bg-green-100 text-green-700"
                    : latestSubmission.status.toLowerCase() === "submitted"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {latestSubmission.status}
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
            {classwork.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <span>
              Posted {formatShortDate(classwork.created_at)}
            </span>

            {classwork.due_date && (
              <span>
                Due {formatShortDate(classwork.due_date)}
              </span>
            )}
          </div>
        </header>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {message && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm font-semibold">
              {message}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm font-semibold">
              {error}
            </p>
          </div>
        )}

        {/* =================================================
            ASSIGNMENT
        ================================================= */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5 md:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
                <FileText
                  size={21}
                  className="text-yellow-700"
                />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Assignment
                </p>

                <h2 className="mt-0.5 text-lg font-black text-slate-950">
                  Tutor's Instructions
                </h2>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 md:px-8">
            {classwork.description ? (
              <div className="whitespace-pre-wrap text-[15px] leading-8 text-slate-700">
                {classwork.description}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No written instructions were provided.
              </p>
            )}
          </div>
        </section>

        {/* =================================================
            TUTOR ATTACHMENT
        ================================================= */}

        {classwork.attachment_url && (
          <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <FileText
                    size={21}
                    className="text-slate-600"
                  />
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-slate-900">
                    Tutor Attachment
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Additional material provided for this assignment.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <a
                  href={classwork.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <ExternalLink size={16} />
                  View
                </a>

                <a
                  href={classwork.attachment_url}
                  download
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <Download size={16} />
                  Download
                </a>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            MARKED RESULT
            IMPORTANT: OUTSIDE HISTORY
        ================================================= */}

        {latestSubmission &&
          (latestSubmission.score !== null ||
            latestSubmission.percentage !== null ||
            latestSubmission.grade ||
            latestSubmission.teacher_feedback ||
            latestSubmission.tutor_feedback ||
            latestSubmission.correction_file_url) && (
            <section className="mt-6 overflow-hidden rounded-3xl border border-green-200 bg-white shadow-sm">

              {/* RESULT HEADER */}

              <div className="border-b border-green-100 bg-green-50 px-6 py-5 md:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle2
                        size={23}
                        className="text-green-700"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                        Marked
                      </p>

                      <h2 className="mt-0.5 text-xl font-black text-slate-950">
                        Your Result
                      </h2>
                    </div>
                  </div>

                  {latestSubmission.score !== null &&
                    latestSubmission.total_marks !== null && (
                      <div className="rounded-2xl bg-white px-5 py-3 text-center shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Score
                        </p>

                        <p className="mt-1 text-2xl font-black text-green-700">
                          {latestSubmission.score}
                          <span className="text-base font-bold text-slate-400">
                            {" "}
                            / {latestSubmission.total_marks}
                          </span>
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/* RESULT CONTENT */}

              <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">

                {latestSubmission.percentage !== null && (
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Percentage
                    </p>

                    <p className="mt-2 text-2xl font-black text-slate-950">
                      {latestSubmission.percentage}%
                    </p>
                  </div>
                )}

                {latestSubmission.grade && (
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Grade
                    </p>

                    <p className="mt-2 text-2xl font-black text-slate-950">
                      {latestSubmission.grade}
                    </p>
                  </div>
                )}

                {latestSubmission.submitted_at && (
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Submitted
                    </p>

                    <p className="mt-2 font-bold text-slate-900">
                      {formatShortDate(
                        latestSubmission.submitted_at
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* FEEDBACK */}

              {(latestSubmission.teacher_feedback ||
                latestSubmission.tutor_feedback) && (
                <div className="px-6 pb-6 md:px-8">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                      Tutor Feedback
                    </p>

                    <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
                      {latestSubmission.teacher_feedback ||
                        latestSubmission.tutor_feedback}
                    </p>
                  </div>
                </div>
              )}

              {/* CORRECTION */}

              {latestSubmission.correction_file_url && (
                <div className="border-t border-slate-100 px-6 py-5 md:px-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="font-bold text-slate-900">
                        Tutor Correction
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Your tutor provided a correction file for this work.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {isBrowserViewable(
                        latestSubmission.correction_file_url
                      ) && (
                        <a
                          href={
                            latestSubmission.correction_file_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Eye size={16} />
                          View
                        </a>
                      )}

                      <a
                        href={
                          latestSubmission.correction_file_url
                        }
                        download
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                      >
                        <Download size={16} />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

        {/* =================================================
            YOUR SUBMISSION
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5 md:px-8">
            <h2 className="text-xl font-black text-slate-950">
              Your Submission
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Submit your written answer, completed file, or both.
            </p>
          </div>

          <form
            onSubmit={submitAnswer}
            className="p-6 md:p-8"
          >

            {/* CURRENT ANSWER */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Written Answer
              </label>

              <textarea
                value={textAnswer}
                onChange={(event) =>
                  setTextAnswer(event.target.value)
                }
                rows={7}
                placeholder="Type your answer here..."
                className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-5 py-4 leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-50"
              />
            </div>

            {/* FILE */}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Completed Work
              </label>

              <label
                htmlFor="student-answer-file"
                className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-yellow-500 hover:bg-yellow-50"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Upload
                    size={20}
                    className="text-slate-600"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-800">
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
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* ACTION */}

            <div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

              <p className="max-w-xl text-sm leading-6 text-slate-500">
                {latestSubmission
                  ? "Updating your submission will keep your written answer and uploaded file together."
                  : "You can submit a written answer, a file, or both."}
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                )}

                {submitting
                  ? "Saving..."
                  : latestSubmission
                  ? "Update Submission"
                  : "Submit Answer"}
              </button>
            </div>
          </form>
        </section>

        {/* =================================================
            SUBMISSION HISTORY
            CLEAN TIMELINE — NO MARKING RESULT INSIDE
        ================================================= */}

        {submissions.length > 0 && (
          <section className="mt-8">

            <div className="mb-4">
              <h2 className="text-xl font-black text-slate-950">
                Submission History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Previous submissions for this assignment.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              {submissions.map((item, index) => {
                const version = getSubmissionNumber(
                  submissions,
                  item.id
                );

                const isLatest = index === 0;

                return (
                  <div
                    key={item.id}
                    className={`p-5 md:p-6 ${
                      index !== submissions.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }`}
                  >

                    {/* HISTORY TOP */}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${
                            isLatest
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {version}
                        </div>

                        <div>
                          <p className="font-bold text-slate-900">
                            Submission Version {version}
                          </p>

                          {item.submitted_at && (
                            <p className="mt-0.5 text-sm text-slate-500">
                              {formatDate(item.submitted_at)}
                            </p>
                          )}
                        </div>
                      </div>

                      {isLatest && (
                        <span className="w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                          Latest
                        </span>
                      )}
                    </div>

                    {/* HISTORY CONTENT */}

                    <div className="mt-5 grid gap-4 md:grid-cols-2">

                      {item.text_answer && (
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Written Answer
                          </p>

                          <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {item.text_answer}
                          </p>
                        </div>
                      )}

                      {item.image_url && (
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">

                            <div className="min-w-0">
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Uploaded File
                              </p>

                              <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                {getFileName(item.image_url)}
                              </p>
                            </div>

                            <div className="flex shrink-0 gap-2">

                              {isBrowserViewable(
                                item.image_url
                              ) && (
                                <a
                                  href={item.image_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                                >
                                  <Eye size={14} />
                                  View
                                </a>
                              )}

                              <a
                                href={item.image_url}
                                download
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                              >
                                <Download size={14} />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =================================================
            BOTTOM SPACING
        ================================================= */}

        <div className="h-10" />
      </div>
    </main>
  );
}