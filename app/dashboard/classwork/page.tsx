"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Upload,
  Camera,
  FileText,
  X,
  CheckCircle,
  Loader2,
  ExternalLink,
  Download,
  RefreshCw,
  Clock,
  Award,
  MessageSquare,
  History,
} from "lucide-react";

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
  tutor_feedback: string | null;
  submitted_at: string | null;
  score: number | null;
  total_marks: number | null;
  percentage: number | null;
  grade: string | null;
  teacher_feedback: string | null;
  correction_file_url: string | null;
};

export default function ClassworkPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [textAnswer, setTextAnswer] = useState("");

  const [classwork, setClasswork] =
    useState<Classwork | null>(null);

  const [student, setStudent] =
    useState<Student | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [submissions, setSubmissions] =
    useState<Submission[]>([]);

  const [loadingSubmissions, setLoadingSubmissions] =
    useState(false);

  const [progress, setProgress] = useState(0);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /*
   * ============================================
   * LOAD CLASSWORK + STUDENT
   * ============================================
   */

  useEffect(() => {
    async function loadClasswork() {
      try {
        setLoading(true);
        setError("");

        /*
         * GET LOGGED-IN USER
         */

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error(
            "You must be logged in as a student."
          );
        }

        /*
         * GET STUDENT PROFILE
         */

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

        if (studentError || !studentData) {
          throw new Error(
            studentError?.message ||
              "Student profile could not be found."
          );
        }

        setStudent(studentData);

        /*
         * GET CLASSWORK ID FROM URL
         */

        const params = new URLSearchParams(
          window.location.search
        );

        const classworkId = params.get("id");

        if (!classworkId) {
          throw new Error(
            "No classwork was selected."
          );
        }

        /*
         * GET CLASSWORK
         */

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

        /*
         * LOAD SUBMISSION HISTORY
         */

        await loadSubmissions(
          studentData.id,
          classworkData.id
        );
      } catch (err) {
        console.error(
          "Classwork loading error:",
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

    loadClasswork();
  }, []);

  /*
   * ============================================
   * FILE PREVIEWS
   * ============================================
   */

  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "",
      })),
    [files]
  );

  /*
   * CLEAN PREVIEW URLS
   */

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview.url) {
          URL.revokeObjectURL(
            preview.url
          );
        }
      });
    };
  }, [previews]);

  /*
   * ============================================
   * ADD FILES
   * ============================================
   */

  const addFiles = (
    list: FileList | null
  ) => {
    if (!list) return;

    const selectedFiles = Array.from(list);

    setFiles((previous) => [
      ...previous,
      ...selectedFiles,
    ]);

    setMessage("");
    setError("");
  };

  /*
   * ============================================
   * REMOVE FILE
   * ============================================
   */

  const removeFile = (index: number) => {
    setFiles((previous) =>
      previous.filter(
        (_, i) => i !== index
      )
    );
  };

  /*
   * ============================================
   * LOAD SUBMISSION HISTORY
   * ============================================
   */

  async function loadSubmissions(
    studentId: string,
    classworkId: string
  ) {
    try {
      setLoadingSubmissions(true);

      const {
        data,
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
          submitted_at,
          score,
          total_marks,
          percentage,
          grade,
          teacher_feedback,
          correction_file_url
        `)
        .eq(
          "student_id",
          studentId
        )
        .eq(
          "classwork_id",
          classworkId
        )
        .order("submitted_at", {
          ascending: false,
        });

      if (submissionError) {
        throw submissionError;
      }

      setSubmissions(data || []);
    } catch (err) {
      console.error(
        "Submission loading error:",
        err
      );
    } finally {
      setLoadingSubmissions(false);
    }
  }

  /*
   * ============================================
   * LATEST SUBMISSION
   * ============================================
   */

  const latestSubmission =
    submissions.length > 0
      ? submissions[0]
      : null;

  /*
   * ============================================
   * SUBMIT / RE-SUBMIT CLASSWORK
   *
   * RE-SUBMISSION IS ALWAYS ALLOWED
   * ============================================
   */

  async function upload() {
    if (
      files.length === 0 &&
      !textAnswer.trim()
    ) {
      setError(
        "Please upload a file or write your answer before submitting."
      );
      return;
    }

    if (!classwork) {
      setError(
        "Classwork information is still loading. Please wait."
      );
      return;
    }

    if (!student) {
      setError(
        "Student profile could not be found."
      );
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      setMessage("");
      setError("");

      /*
       * GET AUTH USER
       */

      const {
        data: { user },
        error: authError,
      } =
        await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      /*
       * VERIFY STUDENT
       */

      if (student.auth_id !== user.id) {
        throw new Error(
          "Student account verification failed."
        );
      }

      /*
       * FILE URL
       */

      let uploadedFileUrl:
        | string
        | null = null;

      /*
       * UPLOAD FILE
       */

      if (files.length > 0) {
        const file = files[0];

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
          error: storageError,
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

        if (storageError) {
          throw new Error(
            `File upload failed: ${storageError.message}`
          );
        }

        /*
         * GET PUBLIC URL
         */

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

        setProgress(100);
      }

      /*
       * SAVE NEW SUBMISSION
       *
       * IMPORTANT:
       * We INSERT a NEW ROW.
       *
       * This means every re-submission
       * remains in submission history.
       */

      const {
        error: dbError,
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

      if (dbError) {
        throw new Error(
          `Submission could not be saved: ${dbError.message}`
        );
      }

      /*
       * RESET FORM
       */

      setFiles([]);
      setTextAnswer("");
      setProgress(100);

      /*
       * RELOAD HISTORY
       */

      await loadSubmissions(
        student.id,
        classwork.id
      );

      setMessage(
        "Your classwork has been submitted successfully."
      );
    } catch (err) {
      console.error(
        "Classwork submission error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit classwork."
      );
    } finally {
      setUploading(false);
    }
  }

  /*
   * ============================================
   * LOADING
   * ============================================
   */

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2
            className="animate-spin"
            size={22}
          />
          <p>
            Loading classwork...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================
   * CLASSWORK NOT FOUND
   * ============================================
   */

  if (!classwork) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Classwork Not Found
        </h1>

        <p className="mt-3 text-red-600">
          {error ||
            "Unable to load this classwork."}
        </p>
      </div>
    );
  }

  /*
   * ============================================
   * ATTACHMENT TYPE
   * ============================================
   */

  const attachmentUrl =
    classwork.attachment_url;

  const isImage =
    !!attachmentUrl &&
    /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(
      attachmentUrl
    );

  const isPdf =
    !!attachmentUrl &&
    /\.pdf(\?.*)?$/i.test(
      attachmentUrl
    );

  /*
   * ============================================
   * FILE TYPE HELPER
   * ============================================
   */

  function isSubmissionImage(
    url: string | null
  ) {
    return (
      !!url &&
      /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(
        url
      )
    );
  }

  /*
   * ============================================
   * STATUS COLOR
   * ============================================
   */

  function getStatusClass(
    status: string | null
  ) {
    switch (
      status?.toLowerCase()
    ) {
      case "graded":
      case "marked":
      case "reviewed":
        return "bg-green-100 text-green-700";

      case "submitted":
        return "bg-blue-100 text-blue-700";

      case "returned":
      case "correction":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  /*
   * ============================================
   * PAGE
   * ============================================
   */

  return (
    <div className="space-y-8 pb-12">

      {/* ========================================
          PAGE HEADER
      ======================================== */}

      <div>
        <div className="flex flex-wrap items-center gap-3">

          <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-700">
            {classwork.subject}
          </span>

          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
            {classwork.status}
          </span>

        </div>

        <h1 className="mt-4 text-4xl font-extrabold text-slate-900">
          {classwork.title}
        </h1>

        <p className="mt-3 text-slate-600">
          Classwork submission
        </p>
      </div>

      {/* ========================================
          CLASSWORK DETAILS
      ======================================== */}

      <section className="rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <FileText
            size={30}
            className="text-yellow-600"
          />

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Classwork Details
            </h2>

            <p className="text-sm text-slate-500">
              Instructions from your tutor
            </p>
          </div>

        </div>

        {classwork.description && (
          <p className="mt-6 whitespace-pre-wrap leading-7 text-slate-700">
            {classwork.description}
          </p>
        )}

        {classwork.due_date && (
          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Clock size={17} />

            Due:{" "}
            {new Date(
              classwork.due_date
            ).toLocaleString()}
          </div>
        )}

      </section>

      {/* ========================================
          TUTOR ATTACHMENT
      ======================================== */}

      <section className="rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <FileText
              size={30}
              className="text-yellow-600"
            />

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Tutor's Classwork File
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Open the file below to see the work.
              </p>
            </div>

          </div>

          {attachmentUrl && (
            <div className="flex flex-wrap gap-3">

              <a
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
              >
                <ExternalLink size={18} />
                View File
              </a>

              <a
                href={attachmentUrl}
                download
                className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-bold text-slate-900 transition hover:bg-yellow-400"
              >
                <Download size={18} />
                Download
              </a>

            </div>
          )}

        </div>

        {attachmentUrl ? (
          <div className="mt-6">

            {/* IMAGE */}

            {isImage && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">

                <img
                  src={attachmentUrl}
                  alt="Classwork uploaded by tutor"
                  className="mx-auto max-h-[750px] w-auto max-w-full rounded-xl object-contain"
                />

              </div>
            )}

            {/* PDF */}

            {isPdf && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

                <iframe
                  src={attachmentUrl}
                  title="Tutor's classwork PDF"
                  className="h-[750px] w-full"
                />

              </div>
            )}

            {/* UNKNOWN FILE */}

            {!isImage &&
              !isPdf && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">

                  <FileText
                    size={60}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-4 font-semibold text-slate-800">
                    Your tutor has uploaded a classwork file.
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Use "View File" to open it.
                  </p>

                </div>
              )}

          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">

            <FileText
              size={45}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-semibold text-slate-600">
              No file was attached to this classwork.
            </p>

          </div>
        )}

      </section>

      {/* ========================================
          LATEST SUBMISSION
      ======================================== */}

      <section className="rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <CheckCircle
            size={30}
            className="text-green-600"
          />

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Latest Submission
            </h2>

            <p className="text-sm text-slate-500">
              Your most recent attempt
            </p>
          </div>

        </div>

        {!latestSubmission ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center">

            <Clock
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-semibold text-slate-600">
              You have not submitted this classwork yet.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              You can submit your answer below anytime.
            </p>

          </div>
        ) : (
          <div className="mt-6 space-y-5">

            {/* STATUS */}

            <div className="flex flex-wrap items-center gap-3">

              <span
                className={`rounded-full px-4 py-2 text-sm font-bold ${getStatusClass(
                  latestSubmission.status
                )}`}
              >
                {latestSubmission.status ||
                  "Submitted"}
              </span>

              {latestSubmission.submitted_at && (
                <span className="text-sm text-slate-500">
                  Submitted{" "}
                  {new Date(
                    latestSubmission.submitted_at
                  ).toLocaleString()}
                </span>
              )}

            </div>

            {/* SCORE */}

            {(latestSubmission.score !== null ||
              latestSubmission.percentage !== null ||
              latestSubmission.grade) && (
              <div className="grid gap-4 sm:grid-cols-3">

                <div className="rounded-2xl bg-slate-50 p-5">

                  <div className="flex items-center gap-2 text-slate-500">
                    <Award size={18} />
                    <span className="text-sm font-semibold">
                      Score
                    </span>
                  </div>

                  <p className="mt-2 text-2xl font-extrabold text-slate-900">

                    {latestSubmission.score !==
                    null
                      ? `${latestSubmission.score}${
                          latestSubmission.total_marks !==
                          null
                            ? ` / ${latestSubmission.total_marks}`
                            : ""
                        }`
                      : "Not graded"}

                  </p>

                </div>

                <div className="rounded-2xl bg-slate-50 p-5">

                  <div className="flex items-center gap-2 text-slate-500">
                    <Award size={18} />
                    <span className="text-sm font-semibold">
                      Percentage
                    </span>
                  </div>

                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {latestSubmission.percentage !==
                    null
                      ? `${latestSubmission.percentage}%`
                      : "—"}
                  </p>

                </div>

                <div className="rounded-2xl bg-slate-50 p-5">

                  <div className="flex items-center gap-2 text-slate-500">
                    <Award size={18} />
                    <span className="text-sm font-semibold">
                      Grade
                    </span>
                  </div>

                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {latestSubmission.grade ||
                      "Not graded"}
                  </p>

                </div>

              </div>
            )}

            {/* WRITTEN ANSWER */}

            {latestSubmission.text_answer && (
              <div className="rounded-2xl border border-slate-200 p-5">

                <h3 className="font-bold text-slate-900">
                  Written Answer
                </h3>

                <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">
                  {latestSubmission.text_answer}
                </p>

              </div>
            )}

            {/* SUBMITTED FILE */}

            {latestSubmission.image_url && (
              <div className="rounded-2xl border border-slate-200 p-5">

                <h3 className="font-bold text-slate-900">
                  Submitted File
                </h3>

                <div className="mt-4 flex flex-wrap gap-3">

                  <a
                    href={
                      latestSubmission.image_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
                  >
                    <ExternalLink size={18} />
                    View Submission
                  </a>

                  <a
                    href={
                      latestSubmission.image_url
                    }
                    download
                    className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-bold text-slate-900"
                  >
                    <Download size={18} />
                    Download
                  </a>

                </div>

                {isSubmissionImage(
                  latestSubmission.image_url
                ) && (
                  <img
                    src={
                      latestSubmission.image_url
                    }
                    alt="Your submitted classwork"
                    className="mt-5 max-h-[600px] w-auto max-w-full rounded-xl border object-contain"
                  />
                )}

              </div>
            )}

            {/* TUTOR FEEDBACK */}

            {(latestSubmission.tutor_feedback ||
              latestSubmission.teacher_feedback) && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

                <div className="flex items-center gap-2">

                  <MessageSquare
                    size={20}
                    className="text-blue-600"
                  />

                  <h3 className="font-bold text-blue-900">
                    Tutor Feedback
                  </h3>

                </div>

                <p className="mt-3 whitespace-pre-wrap leading-7 text-blue-900">

                  {latestSubmission.tutor_feedback ||
                    latestSubmission.teacher_feedback}

                </p>

              </div>
            )}

            {/* CORRECTION FILE */}

            {latestSubmission.correction_file_url && (
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">

                <div className="flex items-center gap-2">

                  <FileText
                    size={20}
                    className="text-orange-600"
                  />

                  <h3 className="font-bold text-orange-900">
                    Correction File
                  </h3>

                </div>

                <p className="mt-2 text-sm text-orange-800">
                  Your tutor has attached a correction file.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">

                  <a
                    href={
                      latestSubmission.correction_file_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-bold text-white"
                  >
                    <ExternalLink size={18} />
                    View Correction
                  </a>

                  <a
                    href={
                      latestSubmission.correction_file_url
                    }
                    download
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-100 px-5 py-3 font-bold text-orange-900"
                  >
                    <Download size={18} />
                    Download
                  </a>

                </div>

              </div>
            )}

          </div>
        )}

      </section>

      {/* ========================================
          SUBMIT / RE-SUBMIT
      ======================================== */}

      <section className="rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <RefreshCw
            size={30}
            className="text-yellow-600"
          />

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {latestSubmission
                ? "Re-submit Your Answer"
                : "Submit Your Answer"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              You can submit or re-submit this classwork anytime.
            </p>
          </div>

        </div>

        {/* WRITTEN ANSWER */}

        <div className="mt-6">

          <label className="block text-sm font-bold text-slate-800">
            Written Answer
          </label>

          <textarea
            value={textAnswer}
            onChange={(e) => {
              setTextAnswer(
                e.target.value
              );
              setMessage("");
              setError("");
            }}
            placeholder="Type your answer here..."
            rows={7}
            className="mt-2 w-full rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
          />

        </div>

        {/* UPLOAD BUTTONS */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          {/* FILE UPLOAD */}

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-yellow-500 hover:bg-yellow-50">

            <Upload
              size={32}
              className="text-yellow-600"
            />

            <span className="mt-3 font-bold text-slate-800">
              Choose Files
            </span>

            <span className="mt-1 text-sm text-slate-500">
              PDF, images or documents
            </span>

            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) =>
                addFiles(
                  e.target.files
                )
              }
              className="hidden"
            />

          </label>

          {/* CAMERA */}

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-yellow-500 hover:bg-yellow-50">

            <Camera
              size={32}
              className="text-yellow-600"
            />

            <span className="mt-3 font-bold text-slate-800">
              Take a Picture
            </span>

            <span className="mt-1 text-sm text-slate-500">
              Use your phone camera
            </span>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) =>
                addFiles(
                  e.target.files
                )
              }
              className="hidden"
            />

          </label>

        </div>

        {/* SELECTED FILES */}

        {files.length > 0 && (
          <div className="mt-6">

            <h3 className="font-bold text-slate-900">
              Selected Files
            </h3>

            <div className="mt-3 space-y-3">

              {previews.map(
                (
                  preview,
                  index
                ) => (
                  <div
                    key={`${preview.file.name}-${index}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      {preview.url ? (
                        <img
                          src={preview.url}
                          alt={preview.file.name}
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white">
                          <FileText
                            size={28}
                            className="text-slate-400"
                          />
                        </div>
                      )}

                      <div className="min-w-0">

                        <p className="truncate font-semibold text-slate-800">
                          {preview.file.name}
                        </p>

                        <p className="text-sm text-slate-500">
                          {(
                            preview.file.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeFile(
                          index
                        )
                      }
                      className="rounded-full p-2 text-red-500 transition hover:bg-red-50"
                    >
                      <X size={20} />
                    </button>

                  </div>
                )
              )}

            </div>

          </div>
        )}

        {/* PROGRESS */}

        {uploading && (
          <div className="mt-6">

            <div className="mb-2 flex justify-between text-sm font-semibold text-slate-600">

              <span>
                Uploading...
              </span>

              <span>
                {progress}%
              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-yellow-500 transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>
        )}

        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">

            <CheckCircle
              size={22}
              className="mt-0.5 shrink-0"
            />

            <p className="font-semibold">
              {message}
            </p>

          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">

            <p className="font-semibold">
              {error}
            </p>

          </div>
        )}

        {/* SUBMIT BUTTON */}

        <button
          type="button"
          onClick={upload}
          disabled={uploading}
          className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-yellow-500 px-6 py-4 text-lg font-extrabold text-slate-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2
                size={22}
                className="animate-spin"
              />

              Submitting...
            </>
          ) : (
            <>
              {latestSubmission ? (
                <RefreshCw size={22} />
              ) : (
                <Upload size={22} />
              )}

              {latestSubmission
                ? "Re-submit Classwork"
                : "Submit Classwork"}
            </>
          )}
        </button>

      </section>

      {/* ========================================
          SUBMISSION HISTORY
      ======================================== */}

      <section className="rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <History
            size={30}
            className="text-slate-700"
          />

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Submission History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              All your previous submissions for this classwork
            </p>
          </div>

        </div>

        {loadingSubmissions ? (
          <div className="mt-6 flex items-center gap-3 text-slate-500">

            <Loader2
              size={20}
              className="animate-spin"
            />

            Loading submission history...

          </div>
        ) : submissions.length ===
          0 ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center">

            <History
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-semibold text-slate-600">
              No previous submissions.
            </p>

          </div>
        ) : (
          <div className="mt-6 space-y-4">

            {submissions.map(
              (
                submission,
                index
              ) => (
                <div
                  key={submission.id}
                  className={`rounded-2xl border p-5 ${
                    index === 0
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >

                  {/* HISTORY HEADER */}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex flex-wrap items-center gap-3">

                      <span className="font-bold text-slate-900">
                        Submission{" "}
                        {submissions.length -
                          index}
                      </span>

                      {index === 0 && (
                        <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-extrabold text-slate-900">
                          LATEST
                        </span>
                      )}

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                          submission.status
                        )}`}
                      >
                        {submission.status ||
                          "Submitted"}
                      </span>

                    </div>

                    {submission.submitted_at && (
                      <span className="text-sm text-slate-500">
                        {new Date(
                          submission.submitted_at
                        ).toLocaleString()}
                      </span>
                    )}

                  </div>

                  {/* SCORE */}

                  {(submission.score !==
                    null ||
                    submission.percentage !==
                      null ||
                    submission.grade) && (
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">

                      {submission.score !==
                        null && (
                        <span className="font-semibold text-slate-700">
                          Score:{" "}
                          {submission.score}
                          {submission.total_marks !==
                            null &&
                            ` / ${submission.total_marks}`}
                        </span>
                      )}

                      {submission.percentage !==
                        null && (
                        <span className="font-semibold text-slate-700">
                          Percentage:{" "}
                          {
                            submission.percentage
                          }%
                        </span>
                      )}

                      {submission.grade && (
                        <span className="font-semibold text-slate-700">
                          Grade:{" "}
                          {submission.grade}
                        </span>
                      )}

                    </div>
                  )}

                  {/* TEXT ANSWER */}

                  {submission.text_answer && (
                    <div className="mt-4">

                      <p className="text-sm font-bold text-slate-700">
                        Written Answer
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {
                          submission.text_answer
                        }
                      </p>

                    </div>
                  )}

                  {/* FILE */}

                  {submission.image_url && (
                    <div className="mt-4">

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
                        View Submitted File
                      </a>

                    </div>
                  )}

                  {/* FEEDBACK */}

                  {(submission.tutor_feedback ||
                    submission.teacher_feedback) && (
                    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">

                      <p className="text-sm font-bold text-blue-900">
                        Tutor Feedback
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-blue-900">
                        {submission.tutor_feedback ||
                          submission.teacher_feedback}
                      </p>

                    </div>
                  )}

                  {/* CORRECTION */}

                  {submission.correction_file_url && (
                    <div className="mt-4">

                      <a
                        href={
                          submission.correction_file_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white"
                      >
                        <FileText
                          size={16}
                        />
                        View Correction File
                      </a>

                    </div>
                  )}

                </div>
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}