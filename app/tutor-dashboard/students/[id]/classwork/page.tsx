"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Upload,
  FileText,
  CalendarDays,
  X,
  CheckCircle2,
  AlertCircle,
  Clock3,
  History,
} from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* =====================================================
   TYPES
===================================================== */

type Student = {
  id: string;
  full_name: string | null;
  subjects: string[] | null;
  package: string | null;
};

type Tutor = {
  id: string;
  full_name: string | null;
};

type AssignedSubject = {
  id: string;
  name: string;
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

  classwork_assignments?: {
    student_id: string;
  }[];
};

type Submission = {
  id: string;
  classwork_id: string;
  student_id: string;
  status: string | null;
  submitted_at: string | null;
};

type SubmissionSummary = {
  latest: Submission | null;
  count: number;
};

/* =====================================================
   PAGE
===================================================== */

export default function TutorClassworkPage() {
  const params = useParams();

  const studentId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  /* ===================================================
     DATA
  =================================================== */

  const [student, setStudent] =
    useState<Student | null>(null);

  const [tutor, setTutor] =
    useState<Tutor | null>(null);

  const [assignedSubjects, setAssignedSubjects] =
    useState<AssignedSubject[]>([]);

  const [classworks, setClassworks] =
    useState<Classwork[]>([]);

  const [submissions, setSubmissions] =
    useState<Submission[]>([]);

  /* ===================================================
     UI STATE
  =================================================== */

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  /* ===================================================
     FORM
  =================================================== */

  const [subject, setSubject] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [attachmentFile, setAttachmentFile] =
    useState<File | null>(null);

  /* ===================================================
     LOAD PAGE
  =================================================== */

  useEffect(() => {
    if (!studentId) return;

    loadPage();
  }, [studentId]);

  async function loadPage() {
    try {
      setLoading(true);
      setError("");

      /* =================================================
         LOGGED-IN USER
      ================================================= */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "You must be logged in as a tutor."
        );
      }

      /* =================================================
         GET TUTOR PROFILE
      ================================================= */

      const {
        data: tutorData,
        error: tutorError,
      } = await supabase
        .from("tutors")
        .select("id, full_name")
        .eq("auth_id", user.id)
        .single();

      if (tutorError || !tutorData) {
        throw new Error(
          tutorError?.message ||
            "Tutor profile could not be found."
        );
      }

      setTutor(tutorData as Tutor);

      /* =================================================
         GET STUDENT
      ================================================= */

      const {
        data: studentData,
        error: studentError,
      } = await supabase
        .from("students")
        .select(
          "id, full_name, subjects, package"
        )
        .eq("id", studentId)
        .single();

      if (studentError || !studentData) {
        throw new Error(
          studentError?.message ||
            "Student could not be found."
        );
      }

      setStudent(studentData as Student);

      /* =================================================
         GET TUTOR'S ASSIGNED SUBJECTS FOR THIS STUDENT
      ================================================= */

      const {
        data: assignmentData,
        error: assignmentError,
      } = await supabase
        .from("tutor_assignments")
        .select(
          `
            subject_id,
            subjects (
              id,
              name
            )
          `
        )
        .eq(
          "tutor_id",
          tutorData.id
        )
        .eq(
          "student_id",
          studentData.id
        )
        .eq(
          "active",
          true
        )
        .eq(
          "status",
          "Scheduled"
        );

      if (assignmentError) {
        throw new Error(
          assignmentError.message
        );
      }

      /* =================================================
         BUILD CLEAN ASSIGNED SUBJECT LIST
      ================================================= */

      const subjectsForTutor: AssignedSubject[] =
        (assignmentData || [])
          .map((item: any) => {
            const subjectRecord =
              Array.isArray(item.subjects)
                ? item.subjects[0]
                : item.subjects;

            if (
              !subjectRecord?.id ||
              !subjectRecord?.name
            ) {
              return null;
            }

            return {
              id: subjectRecord.id,
              name: subjectRecord.name,
            };
          })
          .filter(
            (
              value
            ): value is AssignedSubject =>
              Boolean(value)
          );

      /* =================================================
         REMOVE DUPLICATE SUBJECTS
      ================================================= */

      const uniqueSubjects =
        subjectsForTutor.filter(
          (
            item,
            index,
            array
          ) =>
            array.findIndex(
              (subjectItem) =>
                subjectItem.id ===
                item.id
            ) === index
        );

      setAssignedSubjects(
        uniqueSubjects
      );

      /* =================================================
         KEEP CURRENT SUBJECT IF IT IS STILL ASSIGNED
         
         If the tutor has never selected a subject,
         select the first assigned subject as the
         initial dropdown value.

         IMPORTANT:
         This is only an initial UI selection.
         The tutor can change it from the dropdown.
      ================================================= */

      setSubject((currentSubject) => {
        const stillAssigned =
          uniqueSubjects.some(
            (item) =>
              item.name
                .toLowerCase()
                .trim() ===
              currentSubject
                .toLowerCase()
                .trim()
          );

        if (stillAssigned) {
          return currentSubject;
        }

        return uniqueSubjects[0]?.name || "";
      });

      /* =================================================
         GET CLASSWORK ASSIGNED TO THIS STUDENT
      ================================================= */

      const {
        data: existingClasswork,
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
            created_at,

            classwork_assignments!inner(
              student_id
            )
          `
        )
        .eq(
          "tutor_id",
          tutorData.id
        )
        .eq(
          "classwork_assignments.student_id",
          studentData.id
        )
        .order("created_at", {
          ascending: false,
        });

      if (classworkError) {
        throw new Error(
          classworkError.message
        );
      }

      /* =================================================
         ONLY SHOW CLASSWORK FOR SUBJECTS THIS TUTOR
         IS ACTUALLY ASSIGNED TO TEACH
      ================================================= */

      const allowedSubjects =
        uniqueSubjects.map(
          (item) =>
            item.name
              .toLowerCase()
              .trim()
        );

      const studentClassworks =
        (existingClasswork || []).filter(
          (work: Classwork) =>
            allowedSubjects.includes(
              work.subject
                .toLowerCase()
                .trim()
            )
        );

      setClassworks(
        studentClassworks as Classwork[]
      );

      /* =================================================
         GET ALL SUBMISSIONS FOR THIS STUDENT'S
         CLASSWORK
      ================================================= */

      const classworkIds =
        studentClassworks.map(
          (work) => work.id
        );

      if (classworkIds.length === 0) {
        setSubmissions([]);
        return;
      }

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
            status,
            submitted_at
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
        .order("submitted_at", {
          ascending: false,
        });

      if (submissionError) {
        throw new Error(
          submissionError.message
        );
      }

      setSubmissions(
        (submissionData || []) as Submission[]
      );
    } catch (err) {
      console.error(
        "Tutor classwork loading error:",
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

  /* =====================================================
     SUBMISSION SUMMARY
  ===================================================== */

  function getSubmissionSummary(
    classworkId: string
  ): SubmissionSummary {
    const matching =
      submissions.filter(
        (submission) =>
          submission.classwork_id ===
          classworkId
      );

    return {
      latest: matching[0] || null,
      count: matching.length,
    };
  }

  /* =====================================================
     FORMAT SUBMISSION STATUS
  ===================================================== */

  function getSubmissionLabel(
    submission: Submission | null
  ) {
    if (!submission) {
      return "Awaiting Submission";
    }

    const status =
      submission.status
        ?.trim()
        .toLowerCase();

    if (status === "graded") {
      return "Graded";
    }

    if (status === "reviewed") {
      return "Reviewed";
    }

    if (status === "returned") {
      return "Returned";
    }

    if (status === "submitted") {
      return "Submitted";
    }

    return (
      submission.status ||
      "Submitted"
    );
  }

  /* =====================================================
     CREATE CLASSWORK
  ===================================================== */

  async function createClasswork(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!student) {
      setError(
        "Student information is unavailable."
      );
      return;
    }

    if (!subject) {
      setError(
        "Please select a subject."
      );
      return;
    }

    if (!title.trim()) {
      setError(
        "Please enter a classwork title."
      );
      return;
    }

    try {
      setCreating(true);
      setError("");
      setMessage("");

      /* =================================================
         AUTH
      ================================================= */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "You must be logged in as a tutor."
        );
      }

      /* =================================================
         VERIFY TUTOR
      ================================================= */

      const {
        data: tutorData,
        error: tutorError,
      } = await supabase
        .from("tutors")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (tutorError || !tutorData) {
        throw new Error(
          tutorError?.message ||
            "Tutor profile could not be found."
        );
      }

      /* =================================================
         VERIFY TUTOR/STUDENT/SUBJECT RELATIONSHIP
         
         We verify the exact selected subject before
         allowing the classwork to be created.
      ================================================= */

      const {
        data: tutorAssignments,
        error: assignmentError,
      } = await supabase
        .from("tutor_assignments")
        .select(
          `
            id,
            subject_id,
            subjects (
              id,
              name
            )
          `
        )
        .eq(
          "tutor_id",
          tutorData.id
        )
        .eq(
          "student_id",
          student.id
        )
        .eq(
          "active",
          true
        )
        .eq(
          "status",
          "Scheduled"
        );

      if (assignmentError) {
        throw new Error(
          assignmentError.message
        );
      }

      /* =================================================
         VERIFY SELECTED SUBJECT
      ================================================= */

      const selectedSubjectAssignment =
        (tutorAssignments || []).find(
          (assignment: any) => {
            const assignmentSubject =
              Array.isArray(
                assignment.subjects
              )
                ? assignment.subjects[0]
                : assignment.subjects;

            return (
              assignmentSubject?.name
                ?.toLowerCase()
                .trim() ===
              subject
                .toLowerCase()
                .trim()
            );
          }
        );

      if (
        !selectedSubjectAssignment
      ) {
        throw new Error(
          "You are not assigned to teach this subject for this student."
        );
      }

      /* =================================================
         UPLOAD TUTOR ATTACHMENT
      ================================================= */

      let attachmentUrl:
        | string
        | null = null;

      if (attachmentFile) {
        const maxSize =
          10 * 1024 * 1024;

        if (
          attachmentFile.size >
          maxSize
        ) {
          throw new Error(
            "Tutor attachment cannot be larger than 10MB."
          );
        }

        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/png",
        ];

        if (
          attachmentFile.type &&
          !allowedTypes.includes(
            attachmentFile.type
          )
        ) {
          throw new Error(
            "Please upload a PDF, DOC, DOCX, JPG or PNG file."
          );
        }

        const safeFileName =
          attachmentFile.name
            .replace(
              /[^a-zA-Z0-9._-]/g,
              "_"
            )
            .replace(
              /\s+/g,
              "_"
            );

        /* =================================================
           TUTOR ATTACHMENT PATH
        ================================================= */

        const filePath =
          `tutor-classworks/${tutorData.id}/${student.id}/${crypto.randomUUID()}-${safeFileName}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from(
            "classwork-submissions"
          )
          .upload(
            filePath,
            attachmentFile,
            {
              cacheControl:
                "3600",
              upsert: false,
              contentType:
                attachmentFile.type ||
                undefined,
            }
          );

        if (uploadError) {
          throw new Error(
            `Attachment upload failed: ${uploadError.message}`
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

        attachmentUrl =
          publicUrlData.publicUrl;
      }

      /* =================================================
         CREATE CLASSWORK
         
         IMPORTANT:
         The selected subject is stored here.
         
         Example:
         Mathematics -> classworks.subject = Mathematics
         Physics     -> classworks.subject = Physics
      ================================================= */

      const {
        data: newClasswork,
        error: classworkError,
      } = await supabase
        .from("classworks")
        .insert({
          tutor_id:
            tutorData.id,

          subject:
            subject.trim(),

          title:
            title.trim(),

          description:
            description.trim() ||
            null,

          attachment_url:
            attachmentUrl,

          due_date: dueDate
            ? new Date(
                dueDate
              ).toISOString()
            : null,

          status:
            "published",
        })
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
        .single();

      if (
        classworkError ||
        !newClasswork
      ) {
        throw new Error(
          classworkError?.message ||
            "Unable to create classwork."
        );
      }

      /* =================================================
         ASSIGN CLASSWORK TO THIS STUDENT
      ================================================= */

      const {
        error:
          assignmentInsertError,
      } = await supabase
        .from(
          "classwork_assignments"
        )
        .insert({
          classwork_id:
            newClasswork.id,

          student_id:
            student.id,
        });

      if (assignmentInsertError) {
        /*
         * Remove the classwork if the assignment
         * could not be created.
         */
        await supabase
          .from("classworks")
          .delete()
          .eq(
            "id",
            newClasswork.id
          );

        throw new Error(
          assignmentInsertError.message
        );
      }

      /* =================================================
         SUCCESS
      ================================================= */

      setMessage(
        `${subject} classwork published successfully.`
      );

      setTitle("");
      setDescription("");
      setDueDate("");
      setAttachmentFile(null);
      setShowForm(false);

      const fileInput =
        document.getElementById(
          "classwork-attachment"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      await loadPage();
    } catch (err) {
      console.error(
        "Create classwork error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create classwork."
      );
    } finally {
      setCreating(false);
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
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

  /* =====================================================
     ERROR
  ===================================================== */

  if (error && !student) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-10">

          <Link
            href={`/tutor-dashboard/students/${studentId}`}
            className="inline-flex items-center gap-2 font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to Student Workspace
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

  /* =====================================================
     MAIN PAGE
  ===================================================== */

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-6xl px-5 py-10">

        {/* =================================================
            BACK
        ================================================= */}

        <Link
          href={`/tutor-dashboard/students/${studentId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Student Workspace
        </Link>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-yellow-600">
              Classwork
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              {student?.full_name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {assignedSubjects.length > 0
                ? `Assigned subjects: ${assignedSubjects
                    .map(
                      (item) =>
                        item.name
                    )
                    .join(", ")}`
                : "No subject assigned"}
            </p>

          </div>

          {/* CREATE */}

          <button
            type="button"
            disabled={
              assignedSubjects.length ===
              0
            }
            onClick={() => {
              setShowForm(
                !showForm
              );

              setError("");
              setMessage("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />

            {showForm
              ? "Close"
              : "Create Classwork"}
          </button>

        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

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
              className="rounded-lg p-1 transition hover:bg-red-100"
            >
              <X size={18} />
            </button>

          </div>
        )}

        {/* =================================================
            CREATE FORM
        ================================================= */}

        {showForm && (
          <form
            onSubmit={
              createClasswork
            }
            className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7"
          >

            <div className="flex items-start justify-between">

              <div>
                <h2 className="text-xl font-extrabold text-slate-950">
                  New Classwork
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select the subject this classwork belongs to.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>

            </div>

            {/* =================================================
                SUBJECT DROPDOWN
            ================================================= */}

            <div className="mt-7">

              <label
                htmlFor="classwork-subject"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Subject
              </label>

              <select
                id="classwork-subject"
                value={subject}
                onChange={(event) => {
                  setSubject(
                    event.target.value
                  );

                  setError("");
                  setMessage("");
                }}
                disabled={
                  creating ||
                  assignedSubjects.length ===
                    0
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              >

                {assignedSubjects.length ===
                0 ? (
                  <option value="">
                    No assigned subjects
                  </option>
                ) : (
                  <>
                    <option value="">
                      Select a subject
                    </option>

                    {assignedSubjects.map(
                      (assignedSubject) => (
                        <option
                          key={
                            assignedSubject.id
                          }
                          value={
                            assignedSubject.name
                          }
                        >
                          {
                            assignedSubject.name
                          }
                        </option>
                      )
                    )}
                  </>
                )}

              </select>

              <p className="mt-2 text-xs text-slate-400">
                You can only select subjects assigned to you for this student.
              </p>

            </div>

            {/* =================================================
                TITLE
            ================================================= */}

            <div className="mt-5">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. Algebra Practice"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
              />

            </div>

            {/* =================================================
                INSTRUCTIONS
            ================================================= */}

            <div className="mt-5">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Instructions
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                rows={6}
                placeholder="Write the assignment instructions..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
              />

            </div>

            {/* =================================================
                DUE DATE
            ================================================= */}

            <div className="mt-5">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Due Date
              </label>

              <input
                type="datetime-local"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
              />

            </div>

            {/* =================================================
                ATTACHMENT
            ================================================= */}

            <div className="mt-5">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Tutor Attachment{" "}
                <span className="font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <label
                htmlFor="classwork-attachment"
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-yellow-500 hover:bg-yellow-50"
              >
                <Upload
                  size={20}
                  className="text-slate-500"
                />

                <span className="min-w-0 truncate text-sm font-semibold text-slate-700">
                  {attachmentFile
                    ? attachmentFile.name
                    : "Choose attachment"}
                </span>

              </label>

              <input
                id="classwork-attachment"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(event) =>
                  setAttachmentFile(
                    event.target
                      .files?.[0] ||
                      null
                  )
                }
              />

              <p className="mt-2 text-xs text-slate-400">
                PDF, DOC, DOCX, JPG or PNG · Maximum 10MB
              </p>

            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

              <button
                type="submit"
                disabled={
                  creating ||
                  !subject ||
                  assignedSubjects.length ===
                    0
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {creating && (
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                )}

                {creating
                  ? "Publishing..."
                  : "Publish Classwork"}

              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setAttachmentFile(
                    null
                  );
                }}
                className="rounded-xl border border-slate-200 px-6 py-3.5 font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

            </div>

          </form>
        )}

        {/* =================================================
            CLASSWORK LIST
        ================================================= */}

        <section className="mt-10">

          <div className="mb-5">

            <h2 className="text-xl font-extrabold text-slate-950">
              Published Classwork
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Open a classwork to view the student's submission and complete submission history.
            </p>

          </div>

          {classworks.length === 0 ? (

            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">

              <FileText
                size={42}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No classwork yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create the first classwork using the button above.
              </p>

            </div>

          ) : (

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              {classworks.map(
                (work) => {

                  const summary =
                    getSubmissionSummary(
                      work.id
                    );

                  const latest =
                    summary.latest;

                  return (

                    <Link
                      key={work.id}
                      href={`/tutor-dashboard/students/${studentId}/classwork/${work.id}`}
                      className="group block border-b border-slate-200 px-5 py-6 last:border-b-0 transition hover:bg-slate-50 md:px-6"
                    >

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        {/* LEFT */}

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="text-xs font-extrabold uppercase tracking-wide text-yellow-600">
                              {work.subject}
                            </span>

                            {work.status && (
                              <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
                                {work.status}
                              </span>
                            )}

                          </div>

                          <h3 className="mt-2 truncate text-lg font-extrabold text-slate-900 transition group-hover:text-yellow-700">
                            {work.title}
                          </h3>

                          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">

                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={14} />

                              {new Date(
                                work.created_at
                              ).toLocaleDateString()}
                            </span>

                            {work.due_date && (
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 size={14} />

                                Due{" "}
                                {new Date(
                                  work.due_date
                                ).toLocaleDateString()}
                              </span>
                            )}

                          </div>

                        </div>

                        {/* RIGHT */}

                        <div className="flex shrink-0 flex-wrap items-center gap-3">

                          {latest ? (

                            <>

                              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                                <CheckCircle2
                                  size={14}
                                />

                                {getSubmissionLabel(
                                  latest
                                )}
                              </span>

                              {summary.count >
                                1 && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                                  <History
                                    size={14}
                                  />

                                  {summary.count} versions
                                </span>
                              )}

                            </>

                          ) : (

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600">
                              <Clock3
                                size={14}
                              />

                              Awaiting Submission
                            </span>

                          )}

                          <span className="text-sm font-bold text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900">
                            Open →
                          </span>

                        </div>

                      </div>

                    </Link>

                  );
                }
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}