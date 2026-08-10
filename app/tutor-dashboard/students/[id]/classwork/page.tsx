"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
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
  status: string | null;
  submitted_at: string | null;
};

/* =====================================================
PAGE
===================================================== */

export default function TutorClassworkPage() {
  const params = useParams();

  const studentId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  /* =====================================================
  DATA
  ===================================================== */

  const [student, setStudent] =
    useState<Student | null>(null);

  const [tutor, setTutor] =
    useState<Tutor | null>(null);

  const [classworks, setClassworks] =
    useState<Classwork[]>([]);

  const [submissions, setSubmissions] =
    useState<Submission[]>([]);

  /* =====================================================
  STATE
  ===================================================== */

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

  /* =====================================================
  FORM
  ===================================================== */

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

  /* =====================================================
  LOAD EVERYTHING
  ===================================================== */

  useEffect(() => {
    if (!studentId) return;

    loadPage();
  }, [studentId]);

  async function loadPage() {
    try {
      setLoading(true);
      setError("");

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
         TUTOR
      ----------------------------------------------- */

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

      setTutor(tutorData);

      /* -----------------------------------------------
         STUDENT
      ----------------------------------------------- */

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
         TUTOR'S ASSIGNED SUBJECTS
      ----------------------------------------------- */

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
        (assignmentData || [])
          .map(
            (item: any) =>
              item.subjects?.name
          )
          .filter(Boolean);

      const firstAssignedSubject =
        assignedSubjects[0] || "";

      setSubject(firstAssignedSubject);

      /* -----------------------------------------------
         EXISTING CLASSWORK
      ----------------------------------------------- */

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
            created_at
          `
        )
        .eq("tutor_id", tutorData.id)
        .order("created_at", {
          ascending: false,
        });

      if (classworkError) {
        throw new Error(
          classworkError.message
        );
      }

      const allowedSubjects =
        assignedSubjects.map(
          (item: string) =>
            item.toLowerCase().trim()
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
        studentClassworks
      );

      /* -----------------------------------------------
         EXISTING STUDENT SUBMISSIONS
         -----------------------------------------------

         IMPORTANT:

         We load submissions using BOTH:

         classwork_id
         +
         student_id

         This makes sure the tutor sees the
         student's actual existing submission
         for the classwork.
      ------------------------------------------------ */

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
  GET LATEST SUBMISSION
  ===================================================== */

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

  /* =====================================================
  CREATE CLASSWORK
  ===================================================== */

  async function createClasswork(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!student) return;

    if (!subject) {
      setError(
        "No subject is assigned to you for this student."
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
         AUTH
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
         VERIFY TUTOR
      ----------------------------------------------- */

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
          "Tutor profile could not be found."
        );
      }

      /* -----------------------------------------------
         VERIFY SUBJECT ASSIGNMENT
      ----------------------------------------------- */

      const {
        data: tutorAssignments,
        error: assignmentError,
      } = await supabase
        .from("tutor_assignments")
        .select(
          `
            id,
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

      if (assignmentError) {
        throw new Error(
          assignmentError.message
        );
      }

      const canTeachSubject =
        (tutorAssignments || []).some(
          (assignment: any) =>
            assignment.subjects?.name
              ?.toLowerCase()
              .trim() ===
            subject
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
      ----------------------------------------------- */

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
          .getPublicUrl(
            filePath
          );

        attachmentUrl =
          publicUrlData.publicUrl;
      }

      /* -----------------------------------------------
         CREATE CLASSWORK
      ----------------------------------------------- */

      const {
        data: newClasswork,
        error: classworkError,
      } = await supabase
        .from("classworks")
        .insert({
          tutor_id:
            tutorData.id,
          subject,
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

      /* -----------------------------------------------
         ASSIGN TO THIS STUDENT
      ----------------------------------------------- */

      const {
        error: assignmentInsertError,
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

      /* -----------------------------------------------
         SUCCESS
      ----------------------------------------------- */

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
          <p className="font-semibold text-slate-600">
            Loading classwork...
          </p>
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

        {/* BACK */}

        <Link
          href={`/tutor-dashboard/students/${studentId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Student Workspace
        </Link>

        {/* HEADER */}

        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-yellow-600">
              Classwork
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              {student?.full_name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {subject ||
                "No subject assigned"}
            </p>
          </div>

          {/* CREATE BUTTON */}

          <button
            type="button"
            onClick={() => {
              setShowForm(
                !showForm
              );
              setError("");
              setMessage("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <Plus size={18} />

            {showForm
              ? "Close"
              : "Create Classwork"}
          </button>
        </div>

        {/* MESSAGES */}

        {message && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
            <CheckCircle2
              size={19}
            />

            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            <div className="flex items-center gap-3">
              <AlertCircle
                size={19}
              />

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

        {/* CREATE FORM */}

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
                  This will be published for this student.
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

            {/* SUBJECT */}

            <div className="mt-7">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Subject
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900">
                {subject ||
                  "No assigned subject"}
              </div>
            </div>

            {/* TITLE */}

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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-yellow-500"
              />
            </div>

            {/* INSTRUCTIONS */}

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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-yellow-500"
              />
            </div>

            {/* DUE DATE */}

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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-yellow-500"
              />
            </div>

            {/* ATTACHMENT */}

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

                <span className="text-sm font-semibold text-slate-700">
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
            </div>

            {/* ACTIONS */}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={
                  creating ||
                  !subject
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

        {/* CLASSWORK LIST */}

        <section className="mt-10">

          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-slate-950">
              Published Classwork
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a classwork to view the assignment and student submission.
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
            <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">

              {classworks.map(
                (work) => {
                  const submission =
                    getSubmission(
                      work.id
                    );

                  return (
                    <Link
                      key={work.id}
                      href={`/tutor-dashboard/students/${studentId}/classwork/${work.id}`}
                      className="group flex items-center justify-between gap-5 px-5 py-5 transition hover:bg-slate-50 md:px-6"
                    >
                      <div className="min-w-0">

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold uppercase tracking-wide text-yellow-600">
                            {work.subject}
                          </span>

                          {work.status && (
                            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
                              {work.status}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 truncate text-base font-extrabold text-slate-900 group-hover:text-yellow-700 md:text-lg">
                          {work.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">

                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays
                              size={14}
                            />

                            {new Date(
                              work.created_at
                            ).toLocaleDateString()}
                          </span>

                          {work.due_date && (
                            <span>
                              Due{" "}
                              {new Date(
                                work.due_date
                              ).toLocaleDateString()}
                            </span>
                          )}

                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">

                        {submission ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                            <CheckCircle2
                              size={14}
                            />
                            Submitted
                          </span>
                        ) : (
                          <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600">
                            Awaiting Submission
                          </span>
                        )}

                        <span className="text-sm font-bold text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900">
                          Open →
                        </span>

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
