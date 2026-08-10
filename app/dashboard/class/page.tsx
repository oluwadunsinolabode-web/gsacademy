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
  [key: string]: unknown;
};

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
    return (
      schedule.tutors[0]?.full_name ||
      "Tutor not assigned"
    );
  }

  return (
    schedule.tutors.full_name ||
    "Tutor not assigned"
  );
}

function normalizeSubject(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function subjectsMatch(
  first: string,
  second: string
): boolean {
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

export default function ClassPage() {
  const [student, setStudent] =
    useState<Student | null>(null);

  const [schedule, setSchedule] =
    useState<Schedule | null>(null);

  const [classworks, setClassworks] =
    useState<Classwork[]>([]);

  const [submissions, setSubmissions] =
    useState<Submission[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [uploadingId, setUploadingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  /*
   * ==========================================
   * GET URL PARAMETERS
   * ==========================================
   */

  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;

  const subject =
    searchParams?.get("subject") || "";

  const scheduleId =
    searchParams?.get("schedule_id") || "";

  /*
   * ==========================================
   * LOAD CLASSROOM
   * ==========================================
   */

  useEffect(() => {
    async function loadClassroom() {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        /*
         * --------------------------------------
         * LOGGED-IN USER
         * --------------------------------------
         */

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error(
            "No logged-in student found."
          );
        }

        /*
         * --------------------------------------
         * STUDENT
         * --------------------------------------
         *
         * IMPORTANT:
         *
         * students.auth_id
         *        ↓
         * auth.users.id
         *
         * We are NOT changing this relationship.
         */

        const {
          data: studentData,
          error: studentError,
        } = await supabase
          .from("students")
          .select(
            `
              id,
              auth_id,
              full_name,
              email
            `
          )
          .eq("auth_id", user.id)
          .single();

        if (
          studentError ||
          !studentData
        ) {
          throw new Error(
            studentError?.message ||
              "Student profile not found."
          );
        }

        setStudent(studentData);

        /*
         * --------------------------------------
         * FIND THE SELECTED TIMETABLE ENTRY
         * --------------------------------------
         *
         * student_schedules
         *      ↓
         * students
         *
         * student_schedules.subject_id
         *      ↓
         * subjects
         *
         * student_schedules.tutor_id
         *      ↓
         * tutors
         */

        const {
          data: scheduleData,
          error: scheduleError,
        } = await supabase
          .from("student_schedules")
          .select(
            `
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
            `
          )
          .eq("id", scheduleId)
          .eq(
            "student_id",
            studentData.id
          )
          .single();

        if (
          scheduleError ||
          !scheduleData
        ) {
          throw new Error(
            scheduleError?.message ||
              "This class could not be found."
          );
        }

        const selectedSchedule =
          scheduleData as Schedule;

        setSchedule(
          selectedSchedule
        );

        const actualSubject =
          getSubjectName(
            selectedSchedule
          );

        /*
         * --------------------------------------
         * GET CLASSWORK ASSIGNMENTS
         * --------------------------------------
         *
         * classwork_assignments.student_id
         *              ↓
         * students.id
         *
         * classwork_assignments.classwork_id
         *              ↓
         * classworks.id
         *
         * THESE RELATIONSHIPS STAY INTACT.
         */

        const {
          data: assignmentData,
          error: assignmentError,
        } = await supabase
          .from("classwork_assignments")
          .select(
            `
              id,
              classwork_id,
              student_id
            `
          )
          .eq(
            "student_id",
            studentData.id
          );

        if (assignmentError) {
          throw new Error(
            assignmentError.message
          );
        }

        const classworkIds =
          (assignmentData || [])
            .map(
              (assignment) =>
                assignment.classwork_id
            )
            .filter(Boolean);

        /*
         * --------------------------------------
         * NO CLASSWORK
         * --------------------------------------
         */

        if (
          classworkIds.length === 0
        ) {
          setClassworks([]);
          setSubmissions([]);
          return;
        }

        /*
         * --------------------------------------
         * GET ACTUAL CLASSWORK
         * --------------------------------------
         */

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
          .in(
            "id",
            classworkIds
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

        if (classworkError) {
          throw new Error(
            classworkError.message
          );
        }

        /*
         * --------------------------------------
         * ONLY SHOW THIS SUBJECT
         * --------------------------------------
         */

        const subjectClassworks =
          (classworkData || []).filter(
            (work) =>
              subjectsMatch(
                work.subject,
                actualSubject
              )
          ) as Classwork[];

        setClassworks(
          subjectClassworks
        );

        /*
         * --------------------------------------
         * GET STUDENT SUBMISSIONS
         * --------------------------------------
         *
         * classwork_submissions.student_id
         *              ↓
         * students.id
         *
         * classwork_submissions.classwork_id
         *              ↓
         * classworks.id
         *
         * We use "*" here intentionally so
         * this page does not depend on
         * optional submission columns.
         */

        const {
          data: submissionData,
          error: submissionError,
        } = await supabase
          .from("classwork_submissions")
          .select("*")
          .eq(
            "student_id",
            studentData.id
          );

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
            : "Unable to load classroom."
        );
      } finally {
        setLoading(false);
      }
    }

    if (
      scheduleId &&
      subject
    ) {
      loadClassroom();
    } else {
      setError(
        "Invalid classroom link."
      );
      setLoading(false);
    }
  }, [scheduleId, subject]);

  /*
   * ==========================================
   * SUBMISSION CHECK
   * ==========================================
   */

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

  /*
   * ==========================================
   * UPLOAD ANSWER
   * ==========================================
   *
   * IMPORTANT:
   *
   * File goes to:
   *
   * classwork-submissions
   *
   * Then the submission is linked using:
   *
   * classwork_id
   * student_id
   *
   * We are NOT removing the FK relationships.
   */

  async function handleUpload(
    classwork: Classwork,
    file: File
  ) {
    try {
      setUploadingId(
        classwork.id
      );
      setMessage("");

      /*
       * Get logged-in user again
       */

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

      /*
       * Basic file limit
       */

      const maxSize =
        10 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error(
          "File is too large. Maximum size is 10MB."
        );
      }

      /*
       * --------------------------------------
       * FILE PATH
       * --------------------------------------
       */

      const extension =
        file.name.includes(".")
          ? file.name
              .split(".")
              .pop()
          : "file";

      const filePath =
        `${student.id}/${classwork.id}/${Date.now()}.${extension}`;

      /*
       * --------------------------------------
       * UPLOAD TO STORAGE
       * --------------------------------------
       */

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
            upsert: true,
          }
        );

      if (uploadError) {
        throw new Error(
          uploadError.message
        );
      }

      /*
       * --------------------------------------
       * GET PUBLIC URL
       * --------------------------------------
       */

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

      const imageUrl =
        publicUrlData.publicUrl;

      /*
       * --------------------------------------
       * CHECK EXISTING SUBMISSION
       * --------------------------------------
       */

      const existing =
        getSubmission(
          classwork.id
        );

      /*
       * --------------------------------------
       * UPDATE EXISTING SUBMISSION
       * --------------------------------------
       */

      if (existing) {
        const {
          error: updateError,
        } = await supabase
          .from(
            "classwork_submissions"
          )
          .update({
            image_url: imageUrl,
            subject:
              classwork.subject,
            student_email:
              student.email,
          })
          .eq(
            "id",
            existing.id
          );

        if (updateError) {
          throw new Error(
            updateError.message
          );
        }
      }

      /*
       * --------------------------------------
       * CREATE NEW SUBMISSION
       * --------------------------------------
       */

      else {
        const {
          data: newSubmission,
          error: insertError,
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
              student.email,
            subject:
              classwork.subject,
            image_url:
              imageUrl,
          })
          .select("*")
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

      /*
       * Refresh submissions
       */

      const {
        data: refreshedSubmissions,
      } = await supabase
        .from(
          "classwork_submissions"
        )
        .select("*")
        .eq(
          "student_id",
          student.id
        );

      setSubmissions(
        (refreshedSubmissions ||
          []) as Submission[]
      );

      setMessage(
        "Your answer has been submitted successfully."
      );
    } catch (uploadError) {
      console.error(
        "SUBMISSION ERROR:",
        uploadError
      );

      setMessage(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to submit your answer."
      );
    } finally {
      setUploadingId(null);
    }
  }

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-lg font-semibold text-slate-600">
          Loading classroom...
        </p>
      </div>
    );
  }

  /*
   * ==========================================
   * ERROR
   * ==========================================
   */

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-bold text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <h1 className="mt-8 text-2xl font-extrabold text-slate-900">
          Unable to open class
        </h1>

        <p className="mt-3 text-red-600">
          {error}
        </p>
      </div>
    );
  }

  /*
   * ==========================================
   * MAIN CLASSROOM
   * ==========================================
   */

  const subjectName =
    schedule
      ? getSubjectName(schedule)
      : subject;

  const tutorName =
    schedule
      ? getTutorName(schedule)
      : "Tutor";

  return (
    <div className="pb-12">

      {/* ======================================
          BACK
      ======================================= */}

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 font-bold text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      {/* ======================================
          CLASS HEADER
      ======================================= */}

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
                  My Classroom
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
                  </span>
                  {" — "}
                  {schedule.time}
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

          {/* JOIN CLASS */}

          {schedule?.meet_link && (
            <a
              href={
                schedule.meet_link
              }
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

      {/* ======================================
          MESSAGE
      ======================================= */}

      {message && (
        <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 font-semibold text-slate-800">
          {message}
        </div>
      )}

      {/* ======================================
          CLASSWORK
      ======================================= */}

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">

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
              Assignments from your tutor.
            </p>

          </div>

        </div>

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

          <div className="mt-8 space-y-5">

            {classworks.map(
              (classwork) => {

                const submission =
                  getSubmission(
                    classwork.id
                  );

                return (
                  <div
                    key={
                      classwork.id
                    }
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      <div className="min-w-0">

                        <h3 className="text-xl font-extrabold text-slate-900">
                          {
                            classwork.title
                          }
                        </h3>

                        {classwork.description && (
                          <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
                            {
                              classwork.description
                            }
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-3">

                          {classwork.due_date && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-600">
                              <Clock3
                                size={15}
                              />
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

                    {/* =================================
                        SUBMISSION AREA
                    ================================= */}

                    <div className="mt-6 border-t border-slate-200 pt-6">

                      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                        Your Submission
                      </p>

                      {submission ? (

                        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-5">

                          <div className="flex items-start gap-3">

                            <CheckCircle2
                              size={24}
                              className="mt-0.5 text-green-600"
                            />

                            <div>

                              <p className="font-bold text-green-900">
                                Answer submitted
                              </p>

                              <p className="mt-1 text-sm text-green-700">
                                Your tutor can now
                                review your work.
                              </p>

                            </div>

                          </div>

                          {/* RE-SUBMIT */}

                          <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-900 shadow-sm transition hover:bg-slate-100">

                            <Upload size={18} />

                            Submit New Answer

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
                                  event
                                    .target
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

                      ) : (

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
                                  event
                                    .target
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
                            Accepted: PDF, DOC,
                            DOCX, JPG and PNG.
                            Maximum 10MB.
                          </p>

                        </div>

                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

      {/* ======================================
          CLASSROOM INFORMATION
      ======================================= */}

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">

        <h2 className="text-xl font-bold text-slate-900">
          About this classroom
        </h2>

        <p className="mt-3 leading-7 text-slate-600">
          This classroom contains your
          {` ${subjectName} `}
          learning activities. You can join
          your scheduled live lesson, view
          classwork and submit your answers
          here.
        </p>

      </div>

    </div>
  );
}
