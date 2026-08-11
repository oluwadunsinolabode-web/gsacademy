"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Upload,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ExternalLink,
  Download,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  auth_id: string;
  full_name: string;
  email: string | null;
};

type Schedule = {
  id: string;
  day: string;
  time: string;
  meet_link: string | null;

  subjects:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;

  tutors:
    | {
        id: string;
        full_name: string;
      }
    | {
        id: string;
        full_name: string;
      }[]
    | null;
};

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

function getSubjectName(schedule: Schedule): string {
  if (!schedule.subjects) {
    return "Subject";
  }

  if (Array.isArray(schedule.subjects)) {
    return schedule.subjects[0]?.name || "Subject";
  }

  return schedule.subjects.name || "Subject";
}

function getTutorName(schedule: Schedule): string {
  if (!schedule.tutors) {
    return "Tutor not assigned";
  }

  if (Array.isArray(schedule.tutors)) {
    return schedule.tutors[0]?.full_name || "Tutor not assigned";
  }

  return schedule.tutors.full_name || "Tutor not assigned";
}

function normalizeSubject(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function subjectsMatch(first: string, second: string): boolean {
  const a = normalizeSubject(first);
  const b = normalizeSubject(second);

  if (a === b) {
    return true;
  }

  if (
    (a === "maths" && b === "mathematics") ||
    (a === "mathematics" && b === "maths")
  ) {
    return true;
  }

  return false;
}

function formatDate(date: string | null): string {
  if (!date) {
    return "No due date";
  }

  return new Date(date).toLocaleString();
}

function isImageFile(url: string | null): boolean {
  if (!url) return false;

  return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
}

function isPdfFile(url: string | null): boolean {
  if (!url) return false;

  return /\.pdf(\?.*)?$/i.test(url);
}

/* =========================================================
   PAGE
========================================================= */

export default function ClassPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);

  const [classworks, setClassworks] = useState<Classwork[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uploadingId, setUploadingId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");

  /* =========================================================
     GET SCHEDULE ID FROM URL
  ========================================================= */

  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;

  const scheduleId =
    searchParams?.get("schedule_id") || "";

  /* =========================================================
     LOAD CLASS
  ========================================================= */

  useEffect(() => {
    async function loadClassroom() {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        /* ---------------------------------------------------
           LOGGED-IN USER
        --------------------------------------------------- */

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error(
            "No logged-in student found."
          );
        }

        /* ---------------------------------------------------
           STUDENT
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

        if (studentError || !studentData) {
          throw new Error(
            studentError?.message ||
              "Student profile not found."
          );
        }

        setStudent(studentData);

        /* ---------------------------------------------------
           SELECTED CLASS / SCHEDULE
        --------------------------------------------------- */

        const {
          data: scheduleData,
          error: scheduleError,
        } = await supabase
          .from("student_schedules")
          .select(`
            id,
            day,
            time,
            meet_link,

            subjects (
              id,
              name
            ),

            tutors (
              id,
              full_name
            )
          `)
          .eq("id", scheduleId)
          .eq("student_id", studentData.id)
          .single();

        if (scheduleError || !scheduleData) {
          throw new Error(
            scheduleError?.message ||
              "This class could not be found."
          );
        }

        const selectedSchedule =
          scheduleData as Schedule;

        setSchedule(selectedSchedule);

        const actualSubject =
          getSubjectName(selectedSchedule);

        /* ---------------------------------------------------
           GET CLASSWORK ASSIGNMENTS
        --------------------------------------------------- */

        const {
          data: assignmentData,
          error: assignmentError,
        } = await supabase
          .from("classwork_assignments")
          .select(`
            id,
            classwork_id,
            student_id
          `)
          .eq("student_id", studentData.id);

        if (assignmentError) {
          throw new Error(
            assignmentError.message
          );
        }

        const classworkIds = (assignmentData || [])
          .map(
            (assignment) =>
              assignment.classwork_id
          )
          .filter(Boolean);

        /* ---------------------------------------------------
           NO CLASSWORK
        --------------------------------------------------- */

        if (classworkIds.length === 0) {
          setClassworks([]);
          setSubmissions([]);
          return;
        }

        /* ---------------------------------------------------
           GET CLASSWORK
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
          .in("id", classworkIds)
          .order("created_at", {
            ascending: false,
          });

        if (classworkError) {
          throw new Error(
            classworkError.message
          );
        }

        /* ---------------------------------------------------
           ONLY SHOW CLASSWORK FOR THIS SUBJECT
        --------------------------------------------------- */

        const subjectClassworks =
          (classworkData || []).filter(
            (work) =>
              subjectsMatch(
                work.subject,
                actualSubject
              )
          ) as Classwork[];

        setClassworks(subjectClassworks);

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
          .eq("student_id", studentData.id);

        if (submissionError) {
          throw new Error(
            submissionError.message
          );
        }

        setSubmissions(
          (submissionData || []) as Submission[]
        );
      } catch (classError) {
        console.error(
          "CLASSROOM ERROR:",
          classError
        );

        setError(
          classError instanceof Error
            ? classError.message
            : "Unable to load classwork."
        );
      } finally {
        setLoading(false);
      }
    }

    if (scheduleId) {
      loadClassroom();
    } else {
      setError(
        "Invalid classroom link. No schedule was selected."
      );
      setLoading(false);
    }
  }, [scheduleId]);

  /* =========================================================
     FIND SUBMISSION
  ========================================================= */

  function getSubmission(
    classworkId: string
  ): Submission | null {
    return (
      submissions.find(
        (submission) =>
          submission.classwork_id ===
          classworkId
      ) || null
    );
  }

  /* =========================================================
     UPLOAD / RE-SUBMIT ANSWER
     ========================================================= */

  async function handleUpload(
    classwork: Classwork,
    file: File
  ) {
    try {
      setUploadingId(classwork.id);
      setMessage("");
      setError("");

      /* ---------------------------------------------------
         CHECK LOGIN
      --------------------------------------------------- */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "You are not logged in."
        );
      }

      if (!student) {
        throw new Error(
          "Student profile unavailable."
        );
      }

      /* ---------------------------------------------------
         FILE SIZE
      --------------------------------------------------- */

      const maxSize = 10 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error(
          "File is too large. Maximum size is 10MB."
        );
      }

      /* ---------------------------------------------------
         FILE EXTENSION
      --------------------------------------------------- */

      const extension = file.name.includes(".")
        ? file.name
            .split(".")
            .pop()
            ?.toLowerCase()
        : "file";

      /* ---------------------------------------------------
         UNIQUE STORAGE PATH

         A new file is created every time.
         This allows re-submission anytime.
      --------------------------------------------------- */

      const filePath =
        `${student.id}/` +
        `${classwork.id}/` +
        `${Date.now()}.${extension}`;

      /* ---------------------------------------------------
         UPLOAD TO SUPABASE STORAGE
      --------------------------------------------------- */

      const {
        error: uploadError,
      } = await supabase.storage
        .from("classwork-submissions")
        .upload(
          filePath,
          file,
          {
            upsert: false,
            contentType:
              file.type || undefined,
          }
        );

      if (uploadError) {
        throw new Error(
          uploadError.message
        );
      }

      /* ---------------------------------------------------
         GET PUBLIC URL

         This assumes the bucket is public.
      --------------------------------------------------- */

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("classwork-submissions")
        .getPublicUrl(filePath);

      const fileUrl =
        publicUrlData.publicUrl;

      /* ---------------------------------------------------
         CHECK EXISTING SUBMISSION
      --------------------------------------------------- */

      const existing =
        getSubmission(classwork.id);

      /* ===================================================
         UPDATE EXISTING SUBMISSION
         RE-SUBMISSION IS ALLOWED ANYTIME
      =================================================== */

      if (existing) {
        const {
          data: updatedSubmission,
          error: updateError,
        } = await supabase
          .from("classwork_submissions")
          .update({
            image_url: fileUrl,
            subject: classwork.subject,
            student_email:
              student.email,
            title: classwork.title,
            status: "Submitted",
            submitted_at:
              new Date().toISOString(),

            /*
             * Clear old result when the student
             * submits a new version.
             *
             * Tutor can mark the new submission again.
             */
            score: null,
            total_marks: null,
            percentage: null,
            grade: null,
            tutor_feedback: null,
            teacher_feedback: null,
            correction_file_url: null,
          })
          .eq("id", existing.id)
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
          .single();

        if (updateError) {
          throw new Error(
            updateError.message
          );
        }

        if (updatedSubmission) {
          setSubmissions(
            (current) =>
              current.map((item) =>
                item.id === existing.id
                  ? (updatedSubmission as Submission)
                  : item
              )
          );
        }
      }

      /* ===================================================
         CREATE FIRST SUBMISSION
      =================================================== */

      else {
        const {
          data: newSubmission,
          error: insertError,
        } = await supabase
          .from("classwork_submissions")
          .insert({
            classwork_id:
              classwork.id,

            student_id:
              student.id,

            student_email:
              student.email,

            subject:
              classwork.subject,

            title:
              classwork.title,

            image_url:
              fileUrl,

            status:
              "Submitted",

            submitted_at:
              new Date().toISOString(),
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
            submitted_at,
            score,
            total_marks,
            percentage,
            grade,
            tutor_feedback,
            teacher_feedback,
            correction_file_url
          `)
          .single();

        if (insertError) {
          throw new Error(
            insertError.message
          );
        }

        if (newSubmission) {
          setSubmissions(
            (current) => [
              ...current,
              newSubmission as Submission,
            ]
          );
        }
      }

      /* ---------------------------------------------------
         SUCCESS
      --------------------------------------------------- */

      setMessage(
        "Your answer has been submitted successfully."
      );
    } catch (uploadError) {
      console.error(
        "SUBMISSION ERROR:",
        uploadError
      );

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to submit your answer."
      );
    } finally {
      setUploadingId(null);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-yellow-500" />

          <p className="mt-5 font-semibold text-slate-600">
            Loading classwork...
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
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 font-bold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle
                size={28}
                className="text-red-500"
              />

              <h1 className="text-2xl font-extrabold text-slate-900">
                Unable to load classwork
              </h1>
            </div>

            <p className="mt-4 text-red-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     CLASS DETAILS
  ========================================================= */

  const subjectName = schedule
    ? getSubjectName(schedule)
    : "Subject";

  const tutorName = schedule
    ? getTutorName(schedule)
    : "Tutor";

  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            BACK
        ================================================= */}

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-bold text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* =================================================
            CLASS HEADER
        ================================================= */}

        <div className="mt-6 rounded-3xl bg-slate-900 p-8 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="flex items-center gap-3">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500">
                  <BookOpen
                    size={28}
                    className="text-slate-900"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-yellow-400">
                    Classwork
                  </p>

                  <h1 className="mt-1 text-3xl font-extrabold">
                    {subjectName}
                  </h1>
                </div>

              </div>

              {schedule && (
                <div className="mt-6 space-y-2 text-slate-300">

                  <p>
                    <span className="font-bold text-white">
                      {schedule.day}
                    </span>{" "}
                    — {schedule.time}
                  </p>

                  <p>
                    Tutor:{" "}
                    <span className="font-bold text-white">
                      {tutorName}
                    </span>
                  </p>

                </div>
              )}
            </div>

            {/* JOIN LIVE CLASS */}

            {schedule?.meet_link && (
              <a
                href={schedule.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-7 py-4 font-extrabold text-slate-900 transition hover:bg-yellow-400"
              >
                Join Live Class
                <ExternalLink size={18} />
              </a>
            )}

          </div>
        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 font-semibold text-green-800">
            {message}
          </div>
        )}

        {/* =================================================
            CLASSWORK SECTION
        ================================================= */}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">

          <div className="flex items-center gap-3">

            <FileText
              size={30}
              className="text-yellow-600"
            />

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Classwork
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Assignments from your tutor for this class.
              </p>
            </div>

          </div>

          {/* =================================================
              NO CLASSWORK
          ================================================= */}

          {classworks.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

              <FileText
                size={45}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                No classwork yet
              </h3>

              <p className="mt-2 text-slate-600">
                Your tutor has not assigned
                classwork for this subject yet.
              </p>

            </div>
          ) : (

            /* =================================================
               CLASSWORK LIST
            ================================================= */

            <div className="mt-8 space-y-6">

              {classworks.map((classwork) => {

                const submission =
                  getSubmission(
                    classwork.id
                  );

                const submittedFile =
                  submission?.image_url ||
                  null;

                const correctionFile =
                  submission?.correction_file_url ||
                  null;

                const submittedFileIsImage =
                  isImageFile(
                    submittedFile
                  );

                const submittedFileIsPdf =
                  isPdfFile(
                    submittedFile
                  );

                const correctionIsImage =
                  isImageFile(
                    correctionFile
                  );

                const correctionIsPdf =
                  isPdfFile(
                    correctionFile
                  );

                return (
                  <div
                    key={classwork.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                  >

                    {/* =====================================
                        CLASSWORK INFORMATION
                    ===================================== */}

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      <div className="min-w-0">

                        <h3 className="text-xl font-extrabold text-slate-900">
                          {classwork.title}
                        </h3>

                        {classwork.description && (
                          <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
                            {classwork.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-3">

                          {classwork.due_date && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-600">
                              <Clock3 size={15} />

                              Due:{" "}
                              {formatDate(
                                classwork.due_date
                              )}
                            </span>
                          )}

                          {submission ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-2 text-xs font-bold text-green-700">
                              <CheckCircle2
                                size={15}
                              />

                              Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-2 text-xs font-bold text-orange-700">
                              <AlertCircle
                                size={15}
                              />

                              Not submitted
                            </span>
                          )}

                        </div>
                      </div>

                      {/* CLASSWORK ATTACHMENT */}

                      {classwork.attachment_url && (
                        <a
                          href={
                            classwork.attachment_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-5 py-3 font-bold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                        >
                          View Attachment
                          <ExternalLink
                            size={17}
                          />
                        </a>
                      )}

                    </div>

                    {/* =====================================
                        SUBMISSION AREA
                    ===================================== */}

                    <div className="mt-6 border-t border-slate-200 pt-6">

                      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                        Your Submission
                      </p>

                      {/* ===================================
                          ALREADY SUBMITTED
                      =================================== */}

                      {submission ? (

                        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-5">

                          {/* STATUS */}

                          <div className="flex items-start gap-3">

                            <CheckCircle2
                              size={24}
                              className="mt-0.5 text-green-600"
                            />

                            <div>

                              <p className="font-bold text-green-900">
                                Answer submitted
                              </p>

                              {submission.submitted_at && (
                                <p className="mt-1 text-sm text-green-700">
                                  Submitted{" "}
                                  {new Date(
                                    submission.submitted_at
                                  ).toLocaleString()}
                                </p>
                              )}

                            </div>

                          </div>

                          {/* WRITTEN ANSWER */}

                          {submission.text_answer && (
                            <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">

                              <h4 className="font-bold text-slate-900">
                                My Written Answer
                              </h4>

                              <div className="mt-3 rounded-xl bg-white p-4">

                                <p className="whitespace-pre-wrap leading-7 text-slate-700">
                                  {
                                    submission.text_answer
                                  }
                                </p>

                              </div>

                            </div>
                          )}

                          {/* =================================
                              UPLOADED FILE
                          ================================= */}

                          {submittedFile && (
                            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">

                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                  <h4 className="font-bold text-slate-900">
                                    My Uploaded Work
                                  </h4>

                                  <p className="mt-1 text-sm text-slate-500">
                                    This is your latest submitted file.
                                  </p>

                                </div>

                                <div className="flex flex-wrap gap-2">

                                  <a
                                    href={
                                      submittedFile
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800"
                                  >
                                    <ExternalLink
                                      size={17}
                                    />

                                    View My Work
                                  </a>

                                  <a
                                    href={
                                      submittedFile
                                    }
                                    download
                                    className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 font-bold text-slate-900 hover:bg-yellow-400"
                                  >
                                    <Download
                                      size={17}
                                    />

                                    Download
                                  </a>

                                </div>

                              </div>

                              {/* IMAGE PREVIEW */}

                              {submittedFileIsImage && (
                                <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">

                                  <img
                                    src={
                                      submittedFile
                                    }
                                    alt="My submitted classwork"
                                    className="mx-auto max-h-[600px] w-auto max-w-full rounded-lg object-contain"
                                  />

                                </div>
                              )}

                              {/* PDF PREVIEW */}

                              {submittedFileIsPdf && (
                                <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">

                                  <iframe
                                    src={
                                      submittedFile
                                    }
                                    title="My submitted classwork"
                                    className="h-[600px] w-full"
                                  />

                                </div>
                              )}

                              {/* OTHER FILE */}

                              {!submittedFileIsImage &&
                                !submittedFileIsPdf && (
                                  <div className="mt-5 rounded-xl bg-slate-50 p-6 text-center">

                                    <FileText
                                      size={45}
                                      className="mx-auto text-slate-400"
                                    />

                                    <p className="mt-3 font-semibold text-slate-700">
                                      Your uploaded file is available above.
                                    </p>

                                  </div>
                                )}

                            </div>
                          )}

                          {/* =================================
                              RESULT
                          ================================= */}

                          {(submission.score !== null ||
                            submission.percentage !== null ||
                            submission.grade) && (

                            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">

                              <h4 className="font-bold text-slate-900">
                                My Result
                              </h4>

                              <div className="mt-4 flex flex-wrap gap-3">

                                {submission.score !== null && (
                                  <span className="rounded-xl bg-white px-4 py-3 font-bold text-blue-700 shadow-sm">
                                    Score:{" "}
                                    {submission.score}

                                    {submission.total_marks !==
                                    null
                                      ? ` / ${submission.total_marks}`
                                      : ""}
                                  </span>
                                )}

                                {submission.percentage !==
                                  null && (
                                  <span className="rounded-xl bg-white px-4 py-3 font-bold text-purple-700 shadow-sm">
                                    {
                                      submission.percentage
                                    }
                                    %
                                  </span>
                                )}

                                {submission.grade && (
                                  <span className="rounded-xl bg-yellow-100 px-4 py-3 font-bold text-yellow-700">
                                    Grade:{" "}
                                    {
                                      submission.grade
                                    }
                                  </span>
                                )}

                              </div>
                            </div>
                          )}

                          {/* =================================
                              TUTOR FEEDBACK
                          ================================= */}

                          {(submission.teacher_feedback ||
                            submission.tutor_feedback) && (

                            <div className="mt-5 rounded-2xl border border-green-200 bg-white p-5">

                              <div className="flex items-center gap-3">

                                <CheckCircle2
                                  size={22}
                                  className="text-green-600"
                                />

                                <h4 className="font-bold text-slate-900">
                                  Tutor Feedback
                                </h4>

                              </div>

                              <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">
                                {submission.teacher_feedback ||
                                  submission.tutor_feedback}
                              </p>

                            </div>
                          )}

                          {/* =================================
                              TUTOR CORRECTION
                          ================================= */}

                          {correctionFile && (
                            <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">

                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                  <h4 className="font-bold text-slate-900">
                                    Tutor Correction
                                  </h4>

                                  <p className="mt-1 text-sm text-slate-600">
                                    Your tutor has uploaded a corrected version of your work.
                                  </p>

                                </div>

                                <div className="flex flex-wrap gap-2">

                                  <a
                                    href={
                                      correctionFile
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800"
                                  >
                                    <ExternalLink
                                      size={17}
                                    />

                                    View Correction
                                  </a>

                                  <a
                                    href={
                                      correctionFile
                                    }
                                    download
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-bold text-slate-900 hover:bg-yellow-400"
                                  >
                                    <Download
                                      size={17}
                                    />

                                    Download
                                  </a>

                                </div>

                              </div>

                              {/* CORRECTION IMAGE */}

                              {correctionIsImage && (
                                <div className="mt-5 overflow-hidden rounded-xl border border-yellow-200 bg-white p-3">

                                  <img
                                    src={
                                      correctionFile
                                    }
                                    alt="Tutor correction"
                                    className="mx-auto max-h-[600px] w-auto max-w-full rounded-lg object-contain"
                                  />

                                </div>
                              )}

                              {/* CORRECTION PDF */}

                              {correctionIsPdf && (
                                <div className="mt-5 overflow-hidden rounded-xl border border-yellow-200 bg-white">

                                  <iframe
                                    src={
                                      correctionFile
                                    }
                                    title="Tutor correction"
                                    className="h-[600px] w-full"
                                  />

                                </div>
                              )}

                            </div>
                          )}

                          {/* =================================
                              RE-SUBMIT ANYTIME
                          ================================= */}

                          <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">

                            <p className="font-bold text-slate-900">
                              Need to submit a new version?
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              You can re-submit your answer anytime.
                              Your latest submission will replace the previous one.
                            </p>

                            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800">

                              <Upload size={18} />

                              {uploadingId ===
                              classwork.id
                                ? "Uploading..."
                                : "Submit New Answer"}

                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className="hidden"
                                disabled={
                                  uploadingId ===
                                  classwork.id
                                }
                                onChange={(
                                  event
                                ) => {
                                  const file =
                                    event.target
                                      .files?.[0];

                                  if (file) {
                                    handleUpload(
                                      classwork,
                                      file
                                    );
                                  }

                                  event.target.value =
                                    "";
                                }}
                              />

                            </label>

                          </div>

                        </div>

                      ) : (

                        /* =================================
                           NO SUBMISSION YET
                        ================================= */

                        <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-5">

                          <div className="flex items-start gap-3">

                            <AlertCircle
                              size={24}
                              className="mt-0.5 text-orange-600"
                            />

                            <div>

                              <p className="font-bold text-orange-900">
                                No answer submitted yet
                              </p>

                              <p className="mt-1 text-sm text-orange-700">
                                Upload your completed
                                work below.
                              </p>

                            </div>

                          </div>

                          <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-bold text-slate-900 transition hover:bg-yellow-400">

                            <Upload size={18} />

                            {uploadingId ===
                            classwork.id
                              ? "Uploading..."
                              : "Upload Answer"}

                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="hidden"
                              disabled={
                                uploadingId ===
                                classwork.id
                              }
                              onChange={(
                                event
                              ) => {
                                const file =
                                  event.target
                                    .files?.[0];

                                if (file) {
                                  handleUpload(
                                    classwork,
                                    file
                                  );
                                }

                                event.target.value =
                                  "";
                              }}
                            />

                          </label>

                          <p className="mt-3 text-xs text-orange-700">
                            Accepted: PDF, DOC, DOCX,
                            JPG and PNG. Maximum 10MB.
                          </p>

                        </div>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
