"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ExternalLink,
  Download,
  Loader2,
  MessageSquare,
  ChevronDown,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Tutor = {
  id: string;
  auth_id: string;
  full_name: string;
  email: string | null;
};

type Student = {
  id: string;
  auth_id: string;
  full_name: string;
  email: string | null;
  tutor_id: string | null;
};

type TutorAssignment = {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string | null;
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

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function isImage(url: string | null) {
  if (!url) return false;

  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(
    url
  );
}

function isPdf(url: string | null) {
  if (!url) return false;

  return /\.pdf(\?.*)?$/i.test(url);
}

function isOfficeFile(url: string | null) {
  if (!url) return false;

  return /\.(doc|docx|xls|xlsx|ppt|pptx|txt|csv)(\?.*)?$/i.test(
    url
  );
}

/*
 * This extracts the student ID from:
 *
 * /tutor-dashboard/students/123/classwork
 */
function getStudentIdFromUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  const parts = window.location.pathname
    .split("/")
    .filter(Boolean);

  const studentsIndex =
    parts.indexOf("students");

  if (
    studentsIndex === -1 ||
    !parts[studentsIndex + 1]
  ) {
    return "";
  }

  return parts[studentsIndex + 1];
}

/* =========================================================
   PAGE
========================================================= */

export default function TutorStudentClassworkPage() {
  const [tutor, setTutor] =
    useState<Tutor | null>(null);

  const [student, setStudent] =
    useState<Student | null>(null);

  const [classworks, setClassworks] =
    useState<Classwork[]>([]);

  const [submissions, setSubmissions] =
    useState<Submission[]>([]);

  const [tutorAssignments, setTutorAssignments] =
    useState<TutorAssignment[]>([]);

  const [selectedSubject, setSelectedSubject] =
    useState("All Subjects");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [expandedSubmission, setExpandedSubmission] =
    useState<string | null>(null);

  /* =======================================================
     LOAD EVERYTHING
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      try {
        setLoading(true);
        setError("");

        /* -----------------------------------------------
           1. GET LOGGED-IN USER
        ------------------------------------------------ */

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw new Error(authError.message);
        }

        if (!user) {
          throw new Error(
            "You must be logged in as a tutor."
          );
        }

        /* -----------------------------------------------
           2. GET TUTOR
        ------------------------------------------------ */

        const {
          data: tutorData,
          error: tutorError,
        } = await supabase
          .from("tutors")
          .select(
            `
              id,
              auth_id,
              full_name,
              email
            `
          )
          .eq("auth_id", user.id)
          .limit(1)
          .maybeSingle();

        if (tutorError) {
          throw new Error(tutorError.message);
        }

        if (!tutorData) {
          throw new Error(
            "Tutor profile could not be found."
          );
        }

        if (cancelled) return;

        setTutor(tutorData as Tutor);

        /* -----------------------------------------------
           3. GET STUDENT ID
        ------------------------------------------------ */

        const studentId =
          getStudentIdFromUrl();

        if (!studentId) {
          throw new Error(
            "Student ID could not be found."
          );
        }

        /* -----------------------------------------------
           4. GET STUDENT
        ------------------------------------------------ */

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
              email,
              tutor_id
            `
          )
          .eq("id", studentId)
          .limit(1)
          .maybeSingle();

        if (studentError) {
          throw new Error(studentError.message);
        }

        if (!studentData) {
          throw new Error(
            "Student could not be found."
          );
        }

        /* -----------------------------------------------
           5. CHECK TUTOR ASSIGNMENTS
        ------------------------------------------------ */

        const {
          data: assignmentRows,
          error: assignmentRowsError,
        } = await supabase
          .from("tutor_assignments")
          .select(
            `
              id,
              tutor_id,
              student_id,
              subject_id
            `
          )
          .eq("tutor_id", tutorData.id)
          .eq("student_id", studentData.id)
          .eq("active", true)
          .eq("status", "Scheduled");

        if (assignmentRowsError) {
          throw new Error(
            assignmentRowsError.message
          );
        }

        const validAssignments =
          (assignmentRows ||
            []) as TutorAssignment[];

        /*
         * A tutor can access the student if:
         *
         * A. They have an active scheduled assignment
         *
         * OR
         *
         * B. students.tutor_id points directly to them.
         */

        const hasAssignment =
          validAssignments.length > 0;

        const directlyAssigned =
          studentData.tutor_id ===
          tutorData.id;

        if (
          !hasAssignment &&
          !directlyAssigned
        ) {
          throw new Error(
            "You are not authorized to view this student."
          );
        }

        if (cancelled) return;

        setStudent(studentData as Student);

        setTutorAssignments(
          validAssignments
        );

        /* -----------------------------------------------
           6. GET CLASSWORK ASSIGNMENTS FOR STUDENT
        ------------------------------------------------ */

        const {
          data: assignmentLinks,
          error: assignmentLinksError,
        } = await supabase
          .from("classwork_assignments")
          .select(
            `
              classwork_id,
              student_id
            `
          )
          .eq("student_id", studentData.id);

        if (assignmentLinksError) {
          throw new Error(
            assignmentLinksError.message
          );
        }

        const classworkIds = Array.from(
          new Set(
            (assignmentLinks || [])
              .map(
                (row) =>
                  row.classwork_id
              )
              .filter(
                (
                  id
                ): id is string =>
                  !!id
              )
          )
        );

        /* -----------------------------------------------
           7. NO CLASSWORK
        ------------------------------------------------ */

        if (classworkIds.length === 0) {
          if (cancelled) return;

          setClassworks([]);
          setSubmissions([]);
          setLoading(false);

          return;
        }

        /* -----------------------------------------------
           8. GET CLASSWORK
        ------------------------------------------------ */

        const {
          data: classworkRows,
          error: classworkRowsError,
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
          .in("id", classworkIds)
          .eq("tutor_id", tutorData.id)
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

        if (classworkRowsError) {
          throw new Error(
            classworkRowsError.message
          );
        }

        const loadedClassworks =
          (classworkRows ||
            []) as Classwork[];

        if (cancelled) return;

        setClassworks(
          loadedClassworks
        );

        /* -----------------------------------------------
           9. GET SUBMISSIONS
        ------------------------------------------------
           
           IMPORTANT FIX:
           
           We fetch submissions belonging to THIS
           student AND the classwork currently being
           displayed.
        ------------------------------------------------ */

        const {
          data: submissionRows,
          error: submissionRowsError,
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
            "student_id",
            studentData.id
          )
          .in(
            "classwork_id",
            classworkIds
          )
          .order(
            "submitted_at",
            {
              ascending: false,
            }
          );

        if (submissionRowsError) {
          throw new Error(
            submissionRowsError.message
          );
        }

        if (cancelled) return;

        setSubmissions(
          (submissionRows ||
            []) as Submission[]
        );
      } catch (err) {
        console.error(
          "TUTOR CLASSWORK ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load student classwork."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     AVAILABLE SUBJECTS
  ======================================================= */

  const availableSubjects = useMemo(() => {
    /*
     * Subjects are taken from actual classwork loaded
     * for this student.
     *
     * This means:
     *
     * Mathematics
     * Physics
     * Chemistry
     *
     * etc. appear automatically.
     */

    const subjectNames =
      classworks
        .map((work) =>
          work.subject?.trim()
        )
        .filter(
          (
            subject
          ): subject is string =>
            !!subject
        );

    return Array.from(
      new Set(subjectNames)
    ).sort();
  }, [classworks]);

  /* =======================================================
     FILTERED CLASSWORK
  ======================================================= */

  const filteredClassworks =
    useMemo(() => {
      if (
        selectedSubject ===
        "All Subjects"
      ) {
        return classworks;
      }

      return classworks.filter(
        (work) =>
          work.subject?.trim() ===
          selectedSubject
      );
    }, [
      classworks,
      selectedSubject,
    ]);

  /* =======================================================
     FIND SUBMISSION
  ======================================================= */

  function getSubmission(
    classworkId: string
  ) {
    /*
     * If there are multiple submission records,
     * use the latest one.
     */

    const matching =
      submissions
        .filter(
          (submission) =>
            submission.classwork_id ===
            classworkId
        )
        .sort((a, b) => {
          const aTime = a.submitted_at
            ? new Date(
                a.submitted_at
              ).getTime()
            : 0;

          const bTime = b.submitted_at
            ? new Date(
                b.submitted_at
              ).getTime()
            : 0;

          return bTime - aTime;
        });

    return matching[0] || null;
  }

  /* =======================================================
     COUNTS
  ======================================================= */

  const submittedCount =
    filteredClassworks.filter(
      (work) =>
        !!getSubmission(work.id)
    ).length;

  const awaitingCount =
    filteredClassworks.filter(
      (work) =>
        !getSubmission(work.id)
    ).length;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={35}
            className="mx-auto animate-spin text-yellow-500"
          />

          <p className="mt-4 font-semibold text-slate-600">
            Loading student classwork...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <Link
          href="/tutor-dashboard"
          className="inline-flex items-center gap-2 font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back to Tutor Dashboard
        </Link>

        <h1 className="mt-8 text-2xl font-extrabold text-slate-900">
          Unable to load classwork
        </h1>

        <p className="mt-3 whitespace-pre-wrap text-red-600">
          {error}
        </p>
      </div>
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <div className="pb-12">

      {/* BACK */}

      <Link
        href={`/tutor-dashboard/students/${student?.id}`}
        className="inline-flex items-center gap-2 font-bold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={18} />
        Back to Student
      </Link>

      {/* STUDENT HEADER */}

      <div className="mt-6 rounded-3xl bg-slate-900 p-8 text-white">

        <p className="text-sm font-bold uppercase tracking-wide text-yellow-400">
          Student Classwork
        </p>

        <h1 className="mt-2 text-3xl font-extrabold">
          {student?.full_name}
        </h1>

        {student?.email && (
          <p className="mt-2 text-slate-300">
            {student.email}
          </p>
        )}

        <p className="mt-5 text-sm text-slate-300">
          Tutor:{" "}
          <span className="font-bold text-white">
            {tutor?.full_name}
          </span>
        </p>

        {tutorAssignments.length > 0 && (
          <p className="mt-2 text-sm text-slate-400">
            Active subject assignment
            {tutorAssignments.length !==
            1
              ? "s"
              : ""}
            :{" "}
            <span className="font-bold text-slate-200">
              {tutorAssignments.length}
            </span>
          </p>
        )}

      </div>

      {/* SUBJECT FILTER */}

      {availableSubjects.length > 0 && (
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Select Subject
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View this student's
                classwork by subject.
              </p>
            </div>

            <div className="relative">

              <select
                value={selectedSubject}
                onChange={(event) =>
                  setSelectedSubject(
                    event.target.value
                  )
                }
                className="appearance-none rounded-xl border-2 border-slate-200 bg-white py-3 pl-4 pr-12 font-bold text-slate-900 outline-none transition focus:border-yellow-500"
              >

                <option value="All Subjects">
                  All Subjects
                </option>

                {availableSubjects.map(
                  (subject) => (
                    <option
                      key={subject}
                      value={subject}
                    >
                      {subject}
                    </option>
                  )
                )}

              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

            </div>

          </div>

        </div>
      )}

      {/* SUMMARY */}

      <div className="mt-8 grid gap-5 md:grid-cols-3">

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <p className="text-sm font-bold text-slate-500">
            Total Classwork
          </p>

          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {filteredClassworks.length}
          </p>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <p className="text-sm font-bold text-slate-500">
            Submitted
          </p>

          <p className="mt-2 text-3xl font-extrabold text-green-600">
            {submittedCount}
          </p>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <p className="text-sm font-bold text-slate-500">
            Awaiting Submission
          </p>

          <p className="mt-2 text-3xl font-extrabold text-orange-500">
            {awaitingCount}
          </p>

        </div>

      </div>

      {/* CLASSWORK SECTION */}

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <FileText
            size={30}
            className="text-yellow-600"
          />

          <div>

            <h2 className="text-2xl font-bold text-slate-900">
              Student Classwork
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {selectedSubject ===
              "All Subjects"
                ? "View assignments and everything the student has submitted."
                : `Showing ${selectedSubject} classwork.`}
            </p>

          </div>

        </div>

        {/* NO CLASSWORK */}

        {filteredClassworks.length ===
        0 ? (

          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

            <FileText
              size={45}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 text-xl font-bold text-slate-900">
              No classwork found
            </h3>

            <p className="mt-2 text-slate-600">
              {selectedSubject ===
              "All Subjects"
                ? "No classwork has been assigned to this student yet."
                : `No ${selectedSubject} classwork has been assigned to this student.`}
            </p>

          </div>

        ) : (

          <div className="mt-8 space-y-6">

            {filteredClassworks.map(
              (classwork) => {

                const submission =
                  getSubmission(
                    classwork.id
                  );

                const expanded =
                  expandedSubmission ===
                  classwork.id;

                return (
                  <div
                    key={classwork.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
                  >

                    {/* CLASSWORK HEADER */}

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      <div className="min-w-0">

                        <h3 className="text-2xl font-extrabold text-slate-900">
                          {classwork.title}
                        </h3>

                        {classwork.description && (
                          <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
                            {
                              classwork.description
                            }
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-3">

                          <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-600">
                            {classwork.subject}
                          </span>

                          {classwork.due_date && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-600">
                              <Clock3 size={14} />
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
                              Student Submitted
                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-2 text-xs font-bold text-orange-700">
                              <AlertCircle
                                size={15}
                              />
                              Not Submitted
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
                          className="inline-flex shrink-0 items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-5 py-3 font-bold text-slate-900 hover:bg-slate-900 hover:text-white"
                        >
                          <ExternalLink
                            size={17}
                          />
                          View Assignment
                        </a>
                      )}

                    </div>

                    {/* SUBMISSION */}

                    <div className="mt-6 border-t border-slate-200 pt-6">

                      {/* NO SUBMISSION */}

                      {!submission ? (

                        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">

                          <div className="flex items-center gap-3">

                            <AlertCircle
                              size={25}
                              className="text-orange-600"
                            />

                            <div>

                              <h4 className="font-bold text-orange-900">
                                No submission yet
                              </h4>

                              <p className="mt-1 text-sm text-orange-700">
                                The student has not submitted this classwork.
                              </p>

                            </div>

                          </div>

                        </div>

                      ) : (

                        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">

                          {/* SUBMISSION HEADER */}

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                              <div className="flex flex-wrap items-center gap-2">

                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                  {submission.status ||
                                    "Submitted"}
                                </span>

                                {submission.submitted_at && (
                                  <span className="text-sm text-green-700">
                                    Submitted{" "}
                                    {formatDate(
                                      submission.submitted_at
                                    )}
                                  </span>
                                )}

                              </div>

                              <h4 className="mt-3 text-xl font-extrabold text-slate-900">
                                Student Submission
                              </h4>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedSubmission(
                                  expanded
                                    ? null
                                    : classwork.id
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800"
                            >

                              <FileText
                                size={18}
                              />

                              {expanded
                                ? "Hide Submission"
                                : "View Submission"}

                            </button>

                          </div>

                          {/* FULL SUBMISSION */}

                          {expanded && (

                            <div className="mt-6 space-y-6">

                              {/* =================================
                                  WRITTEN TEXT
                              ================================= */}

                              {submission.text_answer && (

                                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">

                                  <div className="flex items-center gap-3">

                                    <MessageSquare
                                      size={23}
                                      className="text-yellow-600"
                                    />

                                    <h5 className="text-lg font-bold text-slate-900">
                                      Student's Written Answer
                                    </h5>

                                  </div>

                                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">

                                    <p className="whitespace-pre-wrap break-words leading-8 text-slate-700">
                                      {
                                        submission.text_answer
                                      }
                                    </p>

                                  </div>

                                </div>

                              )}

                              {/* =================================
                                  FILE SUBMISSION
                              ================================= */}

                              {submission.image_url && (

                                <div className="rounded-2xl border border-slate-200 bg-white p-5">

                                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                    <div className="flex items-center gap-3">

                                      <FileText
                                        size={25}
                                        className="text-yellow-600"
                                      />

                                      <div>

                                        <h5 className="text-lg font-bold text-slate-900">
                                          Uploaded Work
                                        </h5>

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
                                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800"
                                      >
                                        <ExternalLink
                                          size={17}
                                        />
                                        View File
                                      </a>

                                      <a
                                        href={
                                          submission.image_url
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

                                  {isImage(
                                    submission.image_url
                                  ) && (

                                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">

                                      <img
                                        src={
                                          submission.image_url
                                        }
                                        alt="Student submitted work"
                                        className="mx-auto max-h-[800px] w-auto max-w-full rounded-xl object-contain"
                                      />

                                    </div>

                                  )}

                                  {/* PDF PREVIEW */}

                                  {isPdf(
                                    submission.image_url
                                  ) && (

                                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

                                      <iframe
                                        src={
                                          submission.image_url
                                        }
                                        title="Student submitted PDF"
                                        className="h-[800px] w-full"
                                      />

                                    </div>

                                  )}

                                  {/* OFFICE / OTHER FILE */}

                                  {!isImage(
                                    submission.image_url
                                  ) &&
                                    !isPdf(
                                      submission.image_url
                                    ) && (

                                      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">

                                        <FileText
                                          size={55}
                                          className="mx-auto text-slate-400"
                                        />

                                        <p className="mt-4 font-bold text-slate-800">
                                          Student uploaded a file
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                          Use the View File or Download button above to open it.
                                        </p>

                                        {isOfficeFile(
                                          submission.image_url
                                        ) && (
                                          <p className="mt-3 text-xs font-semibold text-slate-400">
                                            Office/document file
                                          </p>
                                        )}

                                      </div>

                                    )}

                                </div>

                              )}

                              {/* =================================
                                  NOTHING SUBMITTED
                              ================================= */}

                              {!submission.text_answer &&
                                !submission.image_url && (

                                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">

                                    <AlertCircle
                                      size={45}
                                      className="mx-auto text-slate-300"
                                    />

                                    <p className="mt-4 font-semibold text-slate-600">
                                      This submission does not contain a written answer or uploaded file.
                                    </p>

                                  </div>

                                )}

                              {/* =================================
                                  MARKED RESULT
                              ================================= */}

                              {(submission.score !==
                                null ||
                                submission.percentage !==
                                  null ||
                                submission.grade) && (

                                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">

                                  <h5 className="text-xl font-bold text-slate-900">
                                    Marked Result
                                  </h5>

                                  <div className="mt-4 flex flex-wrap gap-3">

                                    {submission.score !==
                                      null && (

                                      <span className="rounded-xl bg-white px-4 py-3 font-bold text-blue-700">
                                        Score:{" "}
                                        {
                                          submission.score
                                        }

                                        {submission.total_marks !==
                                        null
                                          ? ` / ${submission.total_marks}`
                                          : ""}
                                      </span>

                                    )}

                                    {submission.percentage !==
                                      null && (

                                      <span className="rounded-xl bg-white px-4 py-3 font-bold text-purple-700">
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
                                  FEEDBACK
                              ================================= */}

                              {(submission.teacher_feedback ||
                                submission.tutor_feedback) && (

                                <div className="rounded-2xl border border-green-200 bg-green-50 p-6">

                                  <div className="flex items-center gap-3">

                                    <CheckCircle2
                                      size={24}
                                      className="text-green-600"
                                    />

                                    <h5 className="text-xl font-bold text-slate-900">
                                      Tutor Feedback
                                    </h5>

                                  </div>

                                  <p className="mt-4 whitespace-pre-wrap break-words leading-8 text-slate-700">
                                    {submission.teacher_feedback ||
                                      submission.tutor_feedback}
                                  </p>

                                </div>

                              )}

                              {/* =================================
                                  CORRECTION FILE
                              ================================= */}

                              {submission.correction_file_url && (

                                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">

                                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                    <div>

                                      <h5 className="text-xl font-bold text-slate-900">
                                        Correction File
                                      </h5>

                                      <p className="mt-1 text-sm text-slate-600">
                                        Correction attached to this submission.
                                      </p>

                                    </div>

                                    <div className="flex flex-wrap gap-2">

                                      <a
                                        href={
                                          submission.correction_file_url
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800"
                                      >
                                        <ExternalLink
                                          size={17}
                                        />
                                        View Correction
                                      </a>

                                      <a
                                        href={
                                          submission.correction_file_url
                                        }
                                        download
                                        className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-bold text-slate-900 hover:bg-yellow-400"
                                      >
                                        <Download
                                          size={17}
                                        />
                                        Download
                                      </a>

                                    </div>

                                  </div>

                                </div>

                              )}

                            </div>

                          )}

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

    </div>
  );
}