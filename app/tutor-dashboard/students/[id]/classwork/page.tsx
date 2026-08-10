"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Loader2,
  CalendarDays,
  FileText,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock3,
  ExternalLink,
  Download,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type Student = {
  id: string;
  full_name: string | null;
  subjects: string[] | null;
  package: string | null;
};

type Tutor = {
  id: string;
  full_name?: string | null;
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

  return new Date(value).toLocaleString();
}

function formatShortDate(value: string | null) {
  if (!value) return "No due date";

  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isImage(url: string | null) {
  return (
    !!url &&
    /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url)
  );
}

function isPdf(url: string | null) {
  return !!url && /\.pdf(\?.*)?$/i.test(url);
}

/* =========================================================
   PAGE
========================================================= */

export default function StudentClassworkPage() {
  const params = useParams();

  const studentId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  /* =======================================================
     DATA
  ======================================================= */

  const [student, setStudent] =
    useState<Student | null>(null);

  const [tutor, setTutor] =
    useState<Tutor | null>(null);

  const [classworks, setClassworks] =
    useState<Classwork[]>([]);

  const [submissions, setSubmissions] =
    useState<Submission[]>([]);

  const [allowedSubject, setAllowedSubject] =
    useState("");

  /* =======================================================
     LOADING
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  /* =======================================================
     FORM
  ======================================================= */

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [attachmentFile, setAttachmentFile] =
    useState<File | null>(null);

  /* =======================================================
     UI
  ======================================================= */

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [subjectFilter, setSubjectFilter] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("newest");

  const [expandedClasswork, setExpandedClasswork] =
    useState<string | null>(null);

  /* =======================================================
     LOAD PAGE
  ======================================================= */

  useEffect(() => {
    if (!studentId) return;

    loadStudentAndClasswork();
  }, [studentId]);

  async function loadStudentAndClasswork() {
    try {
      setLoading(true);
      setError("");

      /* -----------------------------------------------
         LOGGED-IN USER
      ------------------------------------------------ */

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
      ------------------------------------------------ */

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
            "Tutor profile not found."
        );
      }

      setTutor(tutorData);

      /* -----------------------------------------------
         GET STUDENT
      ------------------------------------------------ */

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

      setStudent(studentData);

      /* -----------------------------------------------
         VERIFY TUTOR ASSIGNMENT
      ------------------------------------------------ */

      const {
        data: tutorAssignments,
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
        .eq("tutor_id", tutorData.id)
        .eq("student_id", studentData.id)
        .eq("active", true)
        .eq("status", "Scheduled");

      if (assignmentError) {
        throw new Error(
          assignmentError.message
        );
      }

      const assignedSubjects =
        tutorAssignments
          ?.map(
            (assignment: any) =>
              assignment.subjects?.name
          )
          .filter(Boolean) || [];

      setAllowedSubject(
        assignedSubjects.length > 0
          ? assignedSubjects[0]
          : ""
      );

      /* -----------------------------------------------
         GET ASSIGNED CLASSWORK
      ------------------------------------------------ */

      const {
        data: assignments,
        error: classworkAssignmentError,
      } = await supabase
        .from("classwork_assignments")
        .select("classwork_id")
        .eq(
          "student_id",
          studentData.id
        );

      if (classworkAssignmentError) {
        throw new Error(
          classworkAssignmentError.message
        );
      }

      const classworkIds =
        assignments
          ?.map(
            (item) => item.classwork_id
          )
          .filter(Boolean) || [];

      if (classworkIds.length === 0) {
        setClassworks([]);
        setSubmissions([]);
        return;
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
        .in("id", classworkIds)
        .eq("tutor_id", tutorData.id)
        .order("created_at", {
          ascending: false,
        });

      if (classworkError) {
        throw new Error(
          classworkError.message
        );
      }

      setClassworks(
        (classworkData || []) as Classwork[]
      );

      /* -----------------------------------------------
         GET ALL STUDENT SUBMISSIONS
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
          "student_id",
          studentData.id
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

  /* =======================================================
     GET SUBMISSION
  ======================================================= */

  function getSubmission(
    classworkId: string
  ) {
    return (
      submissions.find(
        (submission) =>
          submission.classwork_id ===
          classworkId
      ) || null
    );
  }

  /* =======================================================
     GET SUBMISSION STATE
  ======================================================= */

  function getWorkStatus(
    classwork: Classwork
  ) {
    const submission =
      getSubmission(classwork.id);

    if (!submission) {
      return "pending";
    }

    if (
      submission.score !== null ||
      submission.percentage !== null ||
      submission.grade
    ) {
      return "marked";
    }

    return "submitted";
  }

  /* =======================================================
     FILTER OPTIONS
  ======================================================= */

  const subjects = useMemo(() => {
    return Array.from(
      new Set(
        classworks
          .map((work) => work.subject)
          .filter(Boolean)
      )
    );
  }, [classworks]);

  /* =======================================================
     FILTERED CLASSWORK
  ======================================================= */

  const filteredClassworks =
    useMemo(() => {
      let result = [...classworks];

      /* SEARCH */

      if (search.trim()) {
        const query =
          search.toLowerCase().trim();

        result = result.filter(
          (work) =>
            work.title
              .toLowerCase()
              .includes(query) ||
            work.description
              ?.toLowerCase()
              .includes(query) ||
            work.subject
              .toLowerCase()
              .includes(query)
        );
      }

      /* SUBJECT */

      if (subjectFilter !== "all") {
        result = result.filter(
          (work) =>
            work.subject ===
            subjectFilter
        );
      }

      /* STATUS */

      if (statusFilter !== "all") {
        result = result.filter(
          (work) =>
            getWorkStatus(work) ===
            statusFilter
        );
      }

      /* SORT */

      result.sort((a, b) => {
        if (sortBy === "oldest") {
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );
        }

        if (sortBy === "due") {
          const aDate = a.due_date
            ? new Date(a.due_date).getTime()
            : Number.MAX_SAFE_INTEGER;

          const bDate = b.due_date
            ? new Date(b.due_date).getTime()
            : Number.MAX_SAFE_INTEGER;

          return aDate - bDate;
        }

        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      });

      return result;
    }, [
      classworks,
      search,
      subjectFilter,
      statusFilter,
      sortBy,
      submissions,
    ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalClasswork =
    classworks.length;

  const submittedCount =
    classworks.filter(
      (work) =>
        getWorkStatus(work) ===
        "submitted"
    ).length;

  const pendingCount =
    classworks.filter(
      (work) =>
        getWorkStatus(work) ===
        "pending"
    ).length;

  const markedCount =
    classworks.filter(
      (work) =>
        getWorkStatus(work) ===
        "marked"
    ).length;

  /* =======================================================
     CREATE CLASSWORK
  ======================================================= */

  async function createClasswork(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!student) return;

    if (!allowedSubject) {
      setError(
        "You are not assigned to teach any subject for this student."
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

      /* -----------------------------------------------
         USER
      ------------------------------------------------ */

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
         TUTOR
      ------------------------------------------------ */

      const {
        data: tutorData,
        error: tutorError,
      } = await supabase
        .from("tutors")
        .select("id, subjects")
        .eq("auth_id", user.id)
        .single();

      if (tutorError || !tutorData) {
        throw new Error(
          "Tutor profile not found."
        );
      }

      /* -----------------------------------------------
         VERIFY SUBJECT
      ------------------------------------------------ */

      const {
        data: subjectAssignment,
        error: subjectAssignmentError,
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
        .eq("active", true)
        .eq("status", "Scheduled");

      if (subjectAssignmentError) {
        throw new Error(
          subjectAssignmentError.message
        );
      }

      const canTeachSubject =
        subjectAssignment?.some(
          (assignment: any) =>
            assignment.subjects?.name
              ?.toLowerCase()
              .trim() ===
            allowedSubject
              .toLowerCase()
              .trim()
        );

      if (!canTeachSubject) {
        throw new Error(
          "You are not assigned to teach this subject for this student."
        );
      }

      /* -----------------------------------------------
         UPLOAD ATTACHMENT
      ------------------------------------------------ */

      let attachmentUrl:
        | string
        | null = null;

      if (attachmentFile) {
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

        const filePath =
          `tutor-classworks/${user.id}/${student.id}/${crypto.randomUUID()}-${safeFileName}`;

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
              cacheControl: "3600",
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
        } = supabase.storage
          .from(
            "classwork-submissions"
          )
          .getPublicUrl(filePath);

        attachmentUrl =
          publicUrlData.publicUrl;
      }

      /* -----------------------------------------------
         CREATE CLASSWORK
      ------------------------------------------------ */

      const {
        data: newClasswork,
        error: classworkError,
      } = await supabase
        .from("classworks")
        .insert({
          tutor_id: tutorData.id,
          subject: allowedSubject,
          title: title.trim(),
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
          status: "published",
        })
        .select()
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

      /* -----------------------------------------------
         ASSIGN TO STUDENT
      ------------------------------------------------ */

      const {
        error:
          createAssignmentError,
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

      if (createAssignmentError) {
        await supabase
          .from("classworks")
          .delete()
          .eq(
            "id",
            newClasswork.id
          );

        throw new Error(
          createAssignmentError.message
        );
      }

      /* -----------------------------------------------
         SUCCESS
      ------------------------------------------------ */

      setMessage(
        "Classwork published successfully."
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

      await loadStudentAndClasswork();
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

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={38}
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
     STUDENT NOT FOUND
  ======================================================= */

  if (!student) {
    return (
      <div className="rounded-3xl bg-white p-10 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Student Not Found
        </h1>

        <p className="mt-3 text-red-600">
          {error ||
            "Unable to load this student."}
        </p>

        <Link
          href="/tutor-dashboard/students"
          className="mt-6 inline-flex rounded-xl bg-slate-900 px-6 py-3 font-bold text-white"
        >
          Back to My Students
        </Link>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="pb-16">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <Link
            href={`/tutor-dashboard/students/${student.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to Student Workspace
          </Link>

          <p className="mt-6 text-sm font-bold uppercase tracking-wider text-yellow-600">
            Student Classwork
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
            {student.full_name}
          </h1>

          <p className="mt-2 text-slate-500">
            {student.subjects?.join(
              " • "
            ) ||
              "No subjects assigned"}
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setMessage("");
            setError("");
          }}
          disabled={!allowedSubject}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-4 font-bold text-slate-900 shadow-sm transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={21} />

          {showForm
            ? "Close Form"
            : "Create Classwork"}
        </button>

      </div>

      {/* =================================================
          MESSAGES
      ================================================= */}

      {message && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} />
            <span className="font-semibold">
              {message}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setMessage("")
            }
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="font-semibold">
              {error}
            </span>
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
          SUMMARY
      ================================================= */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Total Classwork
          </p>

          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {totalClasswork}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Submitted
          </p>

          <p className="mt-2 text-3xl font-extrabold text-green-600">
            {submittedCount}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Awaiting Submission
          </p>

          <p className="mt-2 text-3xl font-extrabold text-orange-500">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Marked
          </p>

          <p className="mt-2 text-3xl font-extrabold text-blue-600">
            {markedCount}
          </p>
        </div>

      </div>

      {/* =================================================
          CREATE FORM
      ================================================= */}

      {showForm && allowedSubject && (
        <form
          onSubmit={createClasswork}
          className="mt-8 rounded-3xl bg-white p-7 shadow-sm"
        >

          <div className="flex items-start justify-between">

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Create Classwork
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                This assignment will automatically
                be assigned to{" "}
                <strong>
                  {student.full_name}
                </strong>
                .
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowForm(false)
              }
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>

          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">

            {/* SUBJECT */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Subject
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900">
                {allowedSubject}
              </div>
            </div>

            {/* DUE DATE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Due Date
              </label>

              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-yellow-500"
              />
            </div>

          </div>

          {/* TITLE */}

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="e.g. Algebra Practice"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-yellow-500"
            />
          </div>

          {/* DESCRIPTION */}

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Instructions
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows={5}
              placeholder="Enter instructions for the student..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-yellow-500"
            />
          </div>

          {/* FILE */}

          <div className="mt-6">

            <label
              htmlFor="classwork-attachment"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Attachment{" "}
              <span className="font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <label
              htmlFor="classwork-attachment"
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 hover:border-yellow-500 hover:bg-yellow-50"
            >
              <Upload
                size={21}
                className="text-slate-500"
              />

              <span className="font-semibold text-slate-700">
                {attachmentFile
                  ? attachmentFile.name
                  : "Choose a file"}
              </span>
            </label>

            <input
              id="classwork-attachment"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const file =
                  e.target.files?.[0] ||
                  null;

                setAttachmentFile(
                  file
                );
              }}
            />

            <p className="mt-2 text-xs text-slate-400">
              PDF, Word document or image.
            </p>

          </div>

          {/* BUTTONS */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-4 font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating && (
                <Loader2
                  size={20}
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
                setAttachmentFile(null);
              }}
              className="rounded-xl border border-slate-200 px-7 py-4 font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

          </div>

        </form>
      )}

      {/* =================================================
          FILTER BAR
      ================================================= */}

      <div className="mt-10 rounded-3xl bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4 xl:flex-row">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search classwork..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-yellow-500"
            />

          </div>

          {/* SUBJECT */}

          <div className="relative">
            <Filter
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={subjectFilter}
              onChange={(e) =>
                setSubjectFilter(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-8 font-semibold text-slate-700 outline-none focus:border-yellow-500"
            >
              <option value="all">
                All Subjects
              </option>

              {subjects.map(
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
          </div>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 outline-none focus:border-yellow-500"
          >
            <option value="all">
              All Status
            </option>
            <option value="pending">
              Awaiting Submission
            </option>
            <option value="submitted">
              Submitted
            </option>
            <option value="marked">
              Marked
            </option>
          </select>

          {/* SORT */}

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 outline-none focus:border-yellow-500"
          >
            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>

            <option value="due">
              Due Date
            </option>
          </select>

        </div>

        {(search ||
          subjectFilter !== "all" ||
          statusFilter !== "all") && (
          <div className="mt-4 flex items-center justify-between">

            <p className="text-sm font-semibold text-slate-500">
              Showing{" "}
              {filteredClassworks.length}{" "}
              of{" "}
              {classworks.length}{" "}
              classNamework
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSubjectFilter(
                  "all"
                );
                setStatusFilter(
                  "all"
                );
              }}
              className="text-sm font-bold text-red-500 hover:text-red-700"
            >
              Clear filters
            </button>

          </div>
        )}

      </div>

      {/* =================================================
          CLASSWORK LIST
      ================================================= */}

      <div className="mt-8">

        <div className="mb-5 flex items-center justify-between">

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Classwork
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage assignments and review submissions.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
            {filteredClassworks.length}{" "}
            {filteredClassworks.length === 1
              ? "item"
              : "items"}
          </span>

        </div>

        {filteredClassworks.length === 0 ? (

          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">

            <FileText
              size={50}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              No classwork found
            </h3>

            <p className="mt-2 text-slate-500">
              {classworks.length === 0
                ? "Create the first classwork for this student."
                : "Try changing your search or filters."}
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {filteredClassworks.map(
              (work) => {

                const submission =
                  getSubmission(
                    work.id
                  );

                const workStatus =
                  getWorkStatus(
                    work
                  );

                const expanded =
                  expandedClasswork ===
                  work.id;

                return (
                  <div
                    key={work.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >

                    {/* =================================
                        COMPACT CLASSWORK ROW
                    ================================= */}

                    <div className="p-5 md:p-6">

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                              {work.subject}
                            </span>

                            {workStatus ===
                              "pending" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                                <Clock3
                                  size={13}
                                />
                                Awaiting Submission
                              </span>
                            )}

                            {workStatus ===
                              "submitted" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                <CheckCircle2
                                  size={13}
                                />
                                Submitted
                              </span>
                            )}

                            {workStatus ===
                              "marked" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                <CheckCircle2
                                  size={13}
                                />
                                Marked
                              </span>
                            )}

                          </div>

                          <h3 className="mt-3 truncate text-xl font-extrabold text-slate-900 md:text-2xl">
                            {work.title}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">

                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays
                                size={16}
                              />

                              Created{" "}
                              {formatShortDate(
                                work.created_at
                              )}
                            </span>

                            {work.due_date && (
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3
                                  size={16}
                                />

                                Due{" "}
                                {formatShortDate(
                                  work.due_date
                                )}
                              </span>
                            )}

                            {submission?.submitted_at && (
                              <span className="inline-flex items-center gap-1.5 text-green-600">
                                <CheckCircle2
                                  size={16}
                                />

                                Submitted{" "}
                                {formatShortDate(
                                  submission.submitted_at
                                )}
                              </span>
                            )}

                          </div>

                        </div>

                        {/* ACTION */}

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedClasswork(
                              expanded
                                ? null
                                : work.id
                            )
                          }
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
                        >
                          <FileText
                            size={18}
                          />

                          {expanded
                            ? "Hide Details"
                            : submission
                            ? "View Submission"
                            : "View Details"}

                          {expanded ? (
                            <ChevronUp
                              size={18}
                            />
                          ) : (
                            <ChevronDown
                              size={18}
                            />
                          )}
                        </button>

                      </div>

                    </div>

                    {/* =================================
                        EXPANDED DETAILS
                    ================================= */}

                    {expanded && (
                      <div className="border-t border-slate-200 bg-slate-50 p-5 md:p-7">

                        {/* DESCRIPTION */}

                        {work.description && (
                          <div className="rounded-2xl bg-white p-5">

                            <h4 className="font-bold text-slate-900">
                              Instructions
                            </h4>

                            <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
                              {
                                work.description
                              }
                            </p>

                          </div>
                        )}

                        {/* ASSIGNMENT ATTACHMENT */}

                        {work.attachment_url && (
                          <div className="mt-5 rounded-2xl bg-white p-5">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                              <div className="flex items-center gap-3">

                                <FileText
                                  size={25}
                                  className="text-yellow-600"
                                />

                                <div>
                                  <h4 className="font-bold text-slate-900">
                                    Assignment Attachment
                                  </h4>

                                  <p className="text-sm text-slate-500">
                                    File attached by tutor.
                                  </p>
                                </div>

                              </div>

                              <a
                                href={
                                  work.attachment_url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white"
                              >
                                <ExternalLink
                                  size={17}
                                />
                                Open Assignment
                              </a>

                            </div>

                          </div>
                        )}

                        {/* NO SUBMISSION */}

                        {!submission && (
                          <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-6">

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
                        )}

                        {/* SUBMISSION */}

                        {submission && (
                          <div className="mt-5 space-y-5">

                            {/* SUBMISSION HEADER */}

                            <div className="rounded-2xl border border-green-200 bg-green-50 p-5">

                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

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

                                  <h4 className="mt-2 text-xl font-extrabold text-slate-900">
                                    Student Submission
                                  </h4>

                                </div>

                                {submission.grade && (
                                  <div className="rounded-xl bg-white px-4 py-3 text-center">

                                    <p className="text-xs font-bold uppercase text-slate-400">
                                      Grade
                                    </p>

                                    <p className="text-2xl font-extrabold text-blue-600">
                                      {
                                        submission.grade
                                      }
                                    </p>

                                  </div>
                                )}

                              </div>

                            </div>

                            {/* WRITTEN ANSWER */}

                            {submission.text_answer && (
                              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">

                                <div className="flex items-center gap-3">

                                  <MessageSquare
                                    size={23}
                                    className="text-yellow-600"
                                  />

                                  <h4 className="text-lg font-bold text-slate-900">
                                    Student's Written Answer
                                  </h4>

                                </div>

                                <div className="mt-4 rounded-2xl bg-white p-5">

                                  <p className="whitespace-pre-wrap leading-8 text-slate-700">
                                    {
                                      submission.text_answer
                                    }
                                  </p>

                                </div>

                              </div>
                            )}

                            {/* UPLOADED WORK */}

                            {submission.image_url && (
                              <div className="rounded-2xl border border-slate-200 bg-white p-5">

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                  <div className="flex items-center gap-3">

                                    <FileText
                                      size={25}
                                      className="text-yellow-600"
                                    />

                                    <div>

                                      <h4 className="text-lg font-bold text-slate-900">
                                        Uploaded Work
                                      </h4>

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
                                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white"
                                    >
                                      <ExternalLink
                                        size={17}
                                      />
                                      View
                                    </a>

                                    <a
                                      href={
                                        submission.image_url
                                      }
                                      download
                                      className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 font-bold text-slate-900"
                                    >
                                      <Download
                                        size={17}
                                      />
                                      Download
                                    </a>

                                  </div>

                                </div>

                                {/* IMAGE */}

                                {isImage(
                                  submission.image_url
                                ) && (
                                  <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">

                                    <img
                                      src={
                                        submission.image_url
                                      }
                                      alt="Student submitted work"
                                      className="mx-auto max-h-[700px] w-auto max-w-full rounded-xl object-contain"
                                    />

                                  </div>
                                )}

                                {/* PDF */}

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

                                {/* OTHER FILE */}

                                {!isImage(
                                  submission.image_url
                                ) &&
                                  !isPdf(
                                    submission.image_url
                                  ) && (
                                    <div className="mt-5 rounded-2xl bg-slate-50 p-6 text-center">

                                      <FileText
                                        size={45}
                                        className="mx-auto text-slate-400"
                                      />

                                      <p className="mt-3 font-semibold text-slate-600">
                                        The submitted file is available using the View or Download buttons above.
                                      </p>

                                    </div>
                                  )}

                              </div>
                            )}

                            {/* RESULT */}

                            {(submission.score !== null ||
                              submission.percentage !== null ||
                              submission.grade) && (
                              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">

                                <h4 className="text-xl font-bold text-slate-900">
                                  Marked Result
                                </h4>

                                <div className="mt-4 grid gap-3 sm:grid-cols-3">

                                  {submission.score !== null && (
                                    <div className="rounded-xl bg-white p-4">

                                      <p className="text-xs font-bold uppercase text-slate-400">
                                        Score
                                      </p>

                                      <p className="mt-1 text-xl font-extrabold text-blue-700">
                                        {
                                          submission.score
                                        }

                                        {submission.total_marks !==
                                          null &&
                                          ` / ${submission.total_marks}`}
                                      </p>

                                    </div>
                                  )}

                                  {submission.percentage !==
                                    null && (
                                    <div className="rounded-xl bg-white p-4">

                                      <p className="text-xs font-bold uppercase text-slate-400">
                                        Percentage
                                      </p>

                                      <p className="mt-1 text-xl font-extrabold text-purple-700">
                                        {
                                          submission.percentage
                                        }
                                        %
                                      </p>

                                    </div>
                                  )}

                                  {submission.grade && (
                                    <div className="rounded-xl bg-white p-4">

                                      <p className="text-xs font-bold uppercase text-slate-400">
                                        Grade
                                      </p>

                                      <p className="mt-1 text-xl font-extrabold text-yellow-600">
                                        {
                                          submission.grade
                                        }
                                      </p>

                                    </div>
                                  )}

                                </div>

                              </div>
                            )}

                            {/* FEEDBACK */}

                            {(submission.teacher_feedback ||
                              submission.tutor_feedback) && (
                              <div className="rounded-2xl border border-green-200 bg-green-50 p-6">

                                <div className="flex items-center gap-3">

                                  <MessageSquare
                                    size={23}
                                    className="text-green-600"
                                  />

                                  <h4 className="text-xl font-bold text-slate-900">
                                    Tutor Feedback
                                  </h4>

                                </div>

                                <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-700">
                                  {submission.teacher_feedback ||
                                    submission.tutor_feedback}
                                </p>

                              </div>
                            )}

                            {/* CORRECTION */}

                            {submission.correction_file_url && (
                              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                  <div>

                                    <h4 className="text-xl font-bold text-slate-900">
                                      Correction File
                                    </h4>

                                    <p className="mt-1 text-sm text-slate-600">
                                      Correction attached to this submission.
                                    </p>

                                  </div>

                                  <a
                                    href={
                                      submission.correction_file_url
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
                                  >
                                    <ExternalLink
                                      size={17}
                                    />
                                    View Correction
                                  </a>

                                </div>

                              </div>
                            )}

                            {/* EMPTY SUBMISSION */}

                            {!submission.text_answer &&
                              !submission.image_url && (
                                <div className="rounded-2xl bg-white p-6 text-center">

                                  <p className="text-slate-500">
                                    This submission does not contain a written answer or uploaded file.
                                  </p>

                                </div>
                              )}

                          </div>
                        )}

                      </div>
                    )}

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