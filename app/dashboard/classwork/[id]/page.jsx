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

        {/* TUTOR ASSIGNMENT */}

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

        {/* TUTOR ATTACHMENT */}

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
                  href={classwork.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <ExternalLink size={17} />
                  View
                </a>

                <a
                  href={classwork.attachment_url}
                  download
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-yellow-400"
                >
                  <Download size={17} />
                  Download
                </a>
              </div>
            </div>
          </section>
        )}

        {/* CURRENT SUBMISSION */}

        <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Your Submission
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Submit your answer as text, a PDF, DOC, DOCX,
              JPG or PNG file, or both text and a file.
            </p>
          </div>

          {/* LATEST SUBMISSION */}

          {latestSubmission && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    <CheckCircle2 size={14} />

                    {latestSubmission.status ||
                      "Submitted"}
                  </span>

                  {latestSubmission.submitted_at && (
                    <p className="mt-2 text-sm text-green-700">
                      Latest submission —{" "}
                      {formatDate(
                        latestSubmission.submitted_at
                      )}
                    </p>
                  )}
                </div>

                {latestSubmission.grade && (
                  <div className="rounded-xl bg-white px-4 py-3 text-center">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Grade
                    </p>

                    <p className="text-xl font-black text-blue-600">
                      {latestSubmission.grade}
                    </p>
                  </div>
                )}
              </div>

              {/* LATEST TEXT */}

              {latestSubmission.text_answer && (
                <div className="mt-5 rounded-2xl bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Written Answer
                  </p>

                  <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">
                    {latestSubmission.text_answer}
                  </p>
                </div>
              )}

              {/* LATEST FILE */}

              {latestSubmission.image_url && (
                <div className="mt-5 rounded-2xl bg-white p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">
                        Submitted File
                      </p>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {getFileName(
                          latestSubmission.image_url
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {isBrowserViewable(
                        latestSubmission.image_url
                      ) && (
                        <a
                          href={
                            latestSubmission.image_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
                        >
                          <Eye size={16} />
                          View
                        </a>
                      )}

                      <a
                        href={
                          latestSubmission.image_url
                        }
                        download
                        className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 text-sm font-bold text-slate-950"
                      >
                        <Download size={16} />
                        Download
                      </a>
                    </div>
                  </div>

                  {isDoc(
                    latestSubmission.image_url
                  ) && (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-700">
                        DOC/DOCX files cannot be reliably
                        previewed directly in every browser.
                        Use Download to open the document
                        in Word or another compatible application.
                      </p>
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
            {/* TEXT */}

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
                  ? "Saving..."
                  : latestSubmission
                  ? "Update Submission"
                  : "Submit Answer"}
              </button>

              {latestSubmission && (
                <p className="text-sm text-slate-500">
                  Updating your submission keeps your written
                  answer and uploaded file together in the same
                  submission.
                </p>
              )}
            </div>
          </form>
        </section>

        {/* SUBMISSION HISTORY */}

        {submissions.length > 0 && (
          <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <History
                size={23}
                className="text-yellow-600"
              />

              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Submission History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your previous submission records are shown here.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {submissions.map(
                (item, index) => {
                  const version =
                    getSubmissionNumber(
                      submissions,
                      item.id
                    );

                  const isLatest =
                    index === 0;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-5 ${
                        isLatest
                          ? "border-yellow-200 bg-yellow-50/50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      {/* HISTORY HEADER */}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-slate-900">
                              Submission Version{" "}
                              {version}
                            </span>

                            {isLatest && (
                              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                                Latest
                              </span>
                            )}
                          </div>

                          {item.submitted_at && (
                            <p className="mt-1 text-sm text-slate-500">
                              {formatDate(
                                item.submitted_at
                              )}
                            </p>
                          )}
                        </div>

                        <span className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                          {item.status ||
                            "Submitted"}
                        </span>
                      </div>

                      {/* HISTORY TEXT */}

                      {item.text_answer && (
                        <div className="mt-4 rounded-xl bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Written Answer
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                            {item.text_answer}
                          </p>
                        </div>
                      )}

                      {/* HISTORY FILE */}

                      {item.image_url && (
                        <div className="mt-4 rounded-xl bg-white p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Uploaded File
                              </p>

                              <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                {getFileName(
                                  item.image_url
                                )}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {isBrowserViewable(
                                item.image_url
                              ) && (
                                <a
                                  href={
                                    item.image_url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                                >
                                  <Eye size={14} />
                                  View
                                </a>
                              )}

                              <a
                                href={
                                  item.image_url
                                }
                                download
                                className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-3 py-2 text-xs font-bold text-slate-950"
                              >
                                <Download size={14} />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* RESULT */}

                      {(item.score !== null ||
                        item.percentage !== null ||
                        item.grade) && (
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          {item.score !== null && (
                            <div className="rounded-xl bg-white p-4">
                              <p className="text-xs font-bold uppercase text-slate-400">
                                Score
                              </p>

                              <p className="mt-1 font-black text-blue-700">
                                {item.score}
                                {item.total_marks !==
                                  null &&
                                  ` / ${item.total_marks}`}
                              </p>
                            </div>
                          )}

                          {item.percentage !== null && (
                            <div className="rounded-xl bg-white p-4">
                              <p className="text-xs font-bold uppercase text-slate-400">
                                Percentage
                              </p>

                              <p className="mt-1 font-black text-purple-700">
                                {item.percentage}%
                              </p>
                            </div>
                          )}

                          {item.grade && (
                            <div className="rounded-xl bg-white p-4">
                              <p className="text-xs font-bold uppercase text-slate-400">
                                Grade
                              </p>

                              <p className="mt-1 font-black text-yellow-700">
                                {item.grade}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* FEEDBACK */}

                      {(item.teacher_feedback ||
                        item.tutor_feedback) && (
                        <div className="mt-4 rounded-xl bg-blue-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
                            Tutor Feedback
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                            {item.teacher_feedback ||
                              item.tutor_feedback}
                          </p>
                        </div>
                      )}

                      {/* CORRECTION */}

                      {item.correction_file_url && (
                        <div className="mt-4 rounded-xl bg-white p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-bold text-slate-900">
                                Tutor Correction
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                A correction file has been provided for this submission.
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {isBrowserViewable(
                                item.correction_file_url
                              ) && (
                                <a
                                  href={
                                    item.correction_file_url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                                >
                                  <Eye size={14} />
                                  View
                                </a>
                              )}

                              <a
                                href={
                                  item.correction_file_url
                                }
                                download
                                className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-3 py-2 text-xs font-bold text-slate-950"
                              >
                                <Download size={14} />
                                Download
                              </a>
                            </div>
                          </div>
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