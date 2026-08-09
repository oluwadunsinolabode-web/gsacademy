"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Loader2,
  CalendarDays,
  FileText,
  Upload,
} from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  full_name: string | null;
  subjects: string[] | null;
  package: string | null;
};

type Tutor = {
  id: string;
  subjects: string[] | null;
};

type Classwork = {
  id: string;
  subject: string;
  title: string;
  description: string | null;
  attachment_url: string | null;
  due_date: string | null;
  status: string;
  created_at: string;
};

export default function StudentClassworkPage() {
  const params = useParams();

  const studentId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [student, setStudent] = useState<Student | null>(null);
  const [classworks, setClassworks] = useState<Classwork[]>([]);
  const [allowedSubject, setAllowedSubject] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(
    null
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;

    loadStudentAndClasswork();
  }, [studentId]);

  async function loadStudentAndClasswork() {
    try {
      setLoading(true);
      setError("");

      /*
       * Get logged-in tutor.
       */
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("You must be logged in as a tutor.");
      }

      /*
       * Get tutor profile and assigned subjects.
       */
      const {
        data: tutor,
        error: tutorError,
      } = await supabase
        .from("tutors")
        .select("id, subjects")
        .eq("auth_id", user.id)
        .single();

      if (tutorError || !tutor) {
        throw new Error("Tutor profile not found.");
      }

      /*
       * Get the student.
       */
      const {
        data: studentData,
        error: studentError,
      } = await supabase
        .from("students")
        .select("id, full_name, subjects, package")
        .eq("id", studentId)
        .single();

      if (studentError || !studentData) {
        throw new Error(
          studentError?.message || "Student could not be found."
        );
      }

      setStudent(studentData);

      /*
       * Find subjects that BOTH the tutor and student have.
       */
    const tutorSubjects: string[] = tutor.subjects || [];
const studentSubjects: string[] = studentData.subjects || [];

const sharedSubjects = studentSubjects.filter(
  (subject: string) =>
    tutorSubjects.some(
      (tutorSubject: string) =>
        tutorSubject.toLowerCase().trim() ===
        subject.toLowerCase().trim()
    )
);

      /*
       * For now, we expect one shared subject.
       */
      if (sharedSubjects.length > 0) {
        setAllowedSubject(sharedSubjects[0]);
      } else {
        setAllowedSubject("");
      }

      /*
       * Get classworks assigned to this student.
       */
      const {
        data: assignments,
        error: assignmentError,
      } = await supabase
        .from("classwork_assignments")
        .select("classwork_id")
        .eq("student_id", studentId);

      if (assignmentError) {
        throw new Error(assignmentError.message);
      }

      const classworkIds =
        assignments?.map((item) => item.classwork_id) || [];

      if (classworkIds.length === 0) {
        setClassworks([]);
        return;
      }

      /*
       * Get the actual classworks.
       */
      const {
        data: classworkData,
        error: classworkError,
      } = await supabase
        .from("classworks")
        .select(
          `
          id,
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
        .order("created_at", {
          ascending: false,
        });

      if (classworkError) {
        throw new Error(classworkError.message);
      }

      setClassworks(classworkData || []);
    } catch (err) {
      console.error("Classwork loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load classwork."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createClasswork(event: FormEvent) {
    event.preventDefault();

    if (!student) return;

    /*
     * A tutor must have a subject shared with this student.
     */
    if (!allowedSubject) {
      setError(
        "You are not assigned to teach any subject for this student."
      );
      return;
    }

    if (!title.trim()) {
      setError("Please enter a classwork title.");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setMessage("");

      /*
       * Get logged-in tutor.
       */
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("You must be logged in as a tutor.");
      }

      /*
       * Get tutor profile.
       */
      const {
        data: tutor,
        error: tutorError,
      } = await supabase
        .from("tutors")
        .select("id, subjects")
        .eq("auth_id", user.id)
        .single();

      if (tutorError || !tutor) {
        throw new Error("Tutor profile not found.");
      }

      /*
       * Verify the tutor still teaches this subject.
       */
     const tutorCanTeachSubject = (tutor.subjects || []).some(
  (item: string) =>
    item.toLowerCase().trim() ===
    allowedSubject.toLowerCase().trim()
);

      if (!tutorCanTeachSubject) {
        throw new Error(
          "You are not assigned to teach this subject."
        );
      }

      /*
       * Optional attachment upload.
       */
      let attachmentUrl: string | null = null;

      if (attachmentFile) {
        const fileExtension =
          attachmentFile.name.split(".").pop() || "file";

        const safeFileName = attachmentFile.name
          .replace(/[^a-zA-Z0-9._-]/g, "_")
          .replace(/\s+/g, "_");

        const filePath = `tutor-classworks/${user.id}/${student.id}/${crypto.randomUUID()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("classwork-submissions")
          .upload(filePath, attachmentFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: attachmentFile.type || undefined,
          });

        if (uploadError) {
          throw new Error(
            `Attachment upload failed: ${uploadError.message}`
          );
        }

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("classwork-submissions")
          .getPublicUrl(filePath);

        attachmentUrl = publicUrlData.publicUrl;
      }

      /*
       * Create the classwork.
       */
      const {
        data: newClasswork,
        error: classworkError,
      } = await supabase
        .from("classworks")
        .insert({
          tutor_id: tutor.id,
          subject: allowedSubject,
          title: title.trim(),
          description: description.trim() || null,
          attachment_url: attachmentUrl,
          due_date: dueDate
            ? new Date(dueDate).toISOString()
            : null,
          status: "published",
        })
        .select()
        .single();

      if (classworkError || !newClasswork) {
        throw new Error(
          classworkError?.message ||
            "Unable to create classwork."
        );
      }

      /*
       * Automatically assign the classwork
       * to the student whose workspace we are in.
       */
      const {
        error: assignmentError,
      } = await supabase
        .from("classwork_assignments")
        .insert({
          classwork_id: newClasswork.id,
          student_id: student.id,
        });

      if (assignmentError) {
        /*
         * Remove the classwork if assignment fails.
         */
        await supabase
          .from("classworks")
          .delete()
          .eq("id", newClasswork.id);

        throw new Error(assignmentError.message);
      }

      setMessage("Classwork published successfully.");

      setTitle("");
      setDescription("");
      setDueDate("");
      setAttachmentFile(null);
      setShowForm(false);

      /*
       * Reset file input visually.
       */
      const fileInput = document.getElementById(
        "classwork-attachment"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      await loadStudentAndClasswork();
    } catch (err) {
      console.error("Create classwork error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create classwork."
      );
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-10 shadow-sm">
        <p className="text-slate-500">
          Loading classwork...
        </p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="rounded-3xl bg-white p-10 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Student Not Found
        </h1>

        <p className="mt-3 text-slate-500">
          {error || "Unable to load this student."}
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

  return (
    <div>
      {/* Header */}

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href={`/tutor-dashboard/students/${student.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to Student Workspace
          </Link>

          <h1 className="mt-5 text-4xl font-extrabold text-slate-900">
            Classwork
          </h1>

          <p className="mt-2 text-slate-600">
            {student.full_name}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {student.subjects?.join(" • ") ||
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
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-4 font-bold text-slate-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={21} />
          Create Classwork
        </button>
      </div>

      {/* Messages */}

      {message && (
        <div className="mt-6 rounded-2xl bg-green-50 p-4 font-semibold text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* No shared subject */}

      {!allowedSubject && (
        <div className="mt-6 rounded-2xl bg-yellow-50 p-5 text-yellow-800">
          <p className="font-bold">
            No teaching subject assigned
          </p>

          <p className="mt-1 text-sm">
            You can only create classwork for subjects you
            are assigned to teach this student.
          </p>
        </div>
      )}

      {/* Create Form */}

      {showForm && allowedSubject && (
        <form
          onSubmit={createClasswork}
          className="mt-8 rounded-3xl bg-white p-8 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-slate-900">
            Create Classwork
          </h2>

          <p className="mt-2 text-slate-500">
            This classwork will automatically be assigned
            to {student.full_name}.
          </p>

          {/* Subject + Due Date */}

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Subject
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900">
                {allowedSubject}
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Automatically selected from your assigned
                subject for this student.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Due Date
              </label>

              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Title */}

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. Algebra Practice"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-yellow-500"
            />
          </div>

          {/* Instructions */}

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Instructions
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={5}
              placeholder="Enter instructions for the student..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-yellow-500"
            />
          </div>

          {/* Attachment */}

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
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-yellow-500 hover:bg-yellow-50"
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
                  e.target.files?.[0] || null;

                setAttachmentFile(file);
              }}
            />

            <p className="mt-2 text-xs text-slate-400">
              Optional: PDF, Word document or image.
            </p>
          </div>

          {/* Buttons */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
              className="rounded-xl border border-slate-200 px-7 py-4 font-bold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Existing Classwork */}

      <div className="mt-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            Published Classwork
          </h2>

          <span className="text-sm text-slate-500">
            {classworks.length}{" "}
            {classworks.length === 1
              ? "classwork"
              : "classworks"}
          </span>
        </div>

        {classworks.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <FileText
              size={48}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              No classwork yet
            </h3>

            <p className="mt-2 text-slate-500">
              Create the first classwork for this
              student.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {classworks.map((work) => (
              <div
                key={work.id}
                className="rounded-3xl bg-white p-7 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700">
                        {work.subject}
                      </span>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                        {work.status}
                      </span>
                    </div>

                    <h3 className="mt-4 text-2xl font-bold text-slate-900">
                      {work.title}
                    </h3>

                    {work.description && (
                      <p className="mt-3 whitespace-pre-wrap text-slate-600">
                        {work.description}
                      </p>
                    )}
                  </div>

                  {work.due_date && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <CalendarDays size={18} />

                      {new Date(
                        work.due_date
                      ).toLocaleString()}
                    </div>
                  )}
                </div>

                {work.attachment_url && (
                  <a
                    href={work.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    <FileText size={18} />
                    Open Attachment
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
