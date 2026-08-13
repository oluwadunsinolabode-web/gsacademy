"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Upload,
  FileText,
  Eye,
  Download,
  Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

type Resource = {
  id: string;
  student_id: string;
  tutor_id: string | null;
  subject: string;
  title: string;
  file_name: string;
  file_url: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
};

export default function SubjectResourcesPage() {
  const params = useParams();

  const studentId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const subjectParam = Array.isArray(params.subject)
    ? params.subject[0]
    : params.subject;

  const subjectName = subjectParam
    ? decodeURIComponent(subjectParam)
    : "Subject";

  const [resources, setResources] =
    useState<Resource[]>([]);

  const [title, setTitle] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  /* =====================================================
     LOAD RESOURCES
  ===================================================== */

  async function loadResources() {
    try {
      setLoading(true);
      setError("");

      if (!studentId) {
        throw new Error(
          "Student ID is missing."
        );
      }

      const {
        data,
        error: resourceError,
      } = await supabase
        .from("lesson_resources")
        .select(`
          id,
          student_id,
          tutor_id,
          subject,
          title,
          file_name,
          file_url,
          file_path,
          file_type,
          file_size,
          created_at
        `)
        .eq(
          "student_id",
          studentId
        )
        .eq(
          "subject",
          subjectName
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (resourceError) {
        throw new Error(
          resourceError.message
        );
      }

      setResources(
        (data || []) as Resource[]
      );
    } catch (err) {
      console.error(
        "LOAD RESOURCES ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load resources."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadResources();
  }, [studentId, subjectName]);

  /* =====================================================
     FILE SIZE
  ===================================================== */

  function formatFileSize(
    bytes: number | null
  ) {
    if (!bytes) {
      return "";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  /* =====================================================
     UPLOAD
  ===================================================== */

  async function handleUpload() {
    try {
      setError("");
      setMessage("");

      if (!studentId) {
        throw new Error(
          "Student ID is missing."
        );
      }

      if (!title.trim()) {
        throw new Error(
          "Please enter a resource title."
        );
      }

      if (!selectedFile) {
        throw new Error(
          "Please select a file."
        );
      }

      setUploading(true);

      /* ===============================================
         GET LOGGED-IN TUTOR
      =============================================== */

      const {
        data: { user },
        error: authError,
      } =
        await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "You must be logged in as a tutor."
        );
      }

      /* ===============================================
         CREATE SAFE FILE NAME
      =============================================== */

      const originalName =
        selectedFile.name;

      const extension =
        originalName.includes(".")
          ? originalName
              .split(".")
              .pop()
          : "";

      const safeTitle =
        title
          .trim()
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          );

      const uniqueName =
        `${Date.now()}-${safeTitle || "resource"}${
          extension
            ? `.${extension}`
            : ""
        }`;

      /* ===============================================
         STORAGE PATH
      =============================================== */

      const filePath =
        `${studentId}/${encodeURIComponent(
          subjectName
        )}/${uniqueName}`;

      /* ===============================================
         UPLOAD FILE
      =============================================== */

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from("lesson-resources")
          .upload(
            filePath,
            selectedFile,
            {
              cacheControl: "3600",
              upsert: false,
            }
          );

      if (uploadError) {
        throw new Error(
          uploadError.message
        );
      }

      /* ===============================================
         GET PUBLIC URL
         
         This works if your bucket is public.
         If your bucket is private, we'll switch
         this to signed URLs in the next step.
      =============================================== */

      const {
        data: publicUrlData,
      } =
        supabase.storage
          .from("lesson-resources")
          .getPublicUrl(
            filePath
          );

      const fileUrl =
        publicUrlData.publicUrl;

      /* ===============================================
         SAVE DATABASE RECORD
      =============================================== */

      const {
        error: insertError,
      } =
        await supabase
          .from("lesson_resources")
          .insert({
            student_id:
              studentId,

            tutor_id:
              user.id,

            subject:
              subjectName,

            title:
              title.trim(),

            file_name:
              originalName,

            file_url:
              fileUrl,

            file_path:
              filePath,

            file_type:
              selectedFile.type ||
              null,

            file_size:
              selectedFile.size ||
              null,
          });

      if (insertError) {
        /* =============================================
           DELETE FILE IF DATABASE INSERT FAILS
        ============================================= */

        await supabase.storage
          .from("lesson-resources")
          .remove([
            filePath,
          ]);

        throw new Error(
          insertError.message
        );
      }

      /* ===============================================
         RESET FORM
      =============================================== */

      setTitle("");
      setSelectedFile(null);

      const fileInput =
        document.getElementById(
          "resource-file"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      setMessage(
        "Resource uploaded successfully."
      );

      /* ===============================================
         REFRESH LIST
      =============================================== */

      await loadResources();

    } catch (err) {
      console.error(
        "UPLOAD RESOURCE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload resource."
      );
    } finally {
      setUploading(false);
    }
  }

  /* =====================================================
     DELETE RESOURCE
  ===================================================== */

  async function handleDelete(
    resource: Resource
  ) {
    try {
      setDeletingId(
        resource.id
      );

      setError("");
      setMessage("");

      /* ===============================================
         DELETE FILE
      =============================================== */

      const {
        error: storageError,
      } =
        await supabase.storage
          .from("lesson-resources")
          .remove([
            resource.file_path,
          ]);

      if (storageError) {
        console.error(
          "STORAGE DELETE ERROR:",
          storageError
        );
      }

      /* ===============================================
         DELETE DATABASE RECORD
      =============================================== */

      const {
        error: databaseError,
      } =
        await supabase
          .from("lesson_resources")
          .delete()
          .eq(
            "id",
            resource.id
          );

      if (databaseError) {
        throw new Error(
          databaseError.message
        );
      }

      setResources(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              resource.id
          )
      );

      setMessage(
        "Resource deleted successfully."
      );

    } catch (err) {
      console.error(
        "DELETE RESOURCE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete resource."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">

        <div className="rounded-3xl bg-white p-12 text-center shadow-sm">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-yellow-500" />

          <p className="mt-5 font-semibold text-slate-600">
            Loading resources...
          </p>

        </div>

      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="mx-auto max-w-6xl">

      {/* =================================================
          BACK
      ================================================= */}

      <Link
        href={`/tutor-dashboard/students/${studentId}/resources`}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 transition hover:text-slate-950"
      >
        <ArrowLeft size={18} />
        Back to Subjects
      </Link>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mt-8">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-500">

            <BookOpen
              size={28}
              className="text-slate-950"
            />

          </div>

          <div>

            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-yellow-600">
              Tutor Resources
            </p>

            <h1 className="mt-1 text-3xl font-extrabold text-slate-950 sm:text-4xl">
              {subjectName}
            </h1>

            <p className="mt-2 text-slate-600">
              Add lesson notes and learning
              resources for this subject.
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          ALERTS
      ================================================= */}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">

          <p className="font-semibold text-red-700">
            {error}
          </p>

        </div>
      )}

      {message && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">

          <p className="font-semibold text-green-700">
            {message}
          </p>

        </div>
      )}

      {/* =================================================
          ADD RESOURCE
      ================================================= */}

      <section className="mt-10">

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

          <div className="flex items-center gap-3">

            <Upload
              size={26}
              className="text-yellow-600"
            />

            <h2 className="text-2xl font-extrabold text-slate-900">
              Add Lesson Note
            </h2>

          </div>

          <p className="mt-2 text-slate-600">
            Add a title and attach the lesson
            note you want to make available
            to the student.
          </p>

          {/* TITLE */}

          <div className="mt-7">

            <label
              htmlFor="resource-title"
              className="block text-sm font-bold text-slate-900"
            >
              Resource Title
            </label>

            <input
              id="resource-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="e.g. Algebra Revision Notes"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
            />

          </div>

          {/* FILE */}

          <div className="mt-6">

            <label
              htmlFor="resource-file"
              className="block text-sm font-bold text-slate-900"
            >
              Attachment
            </label>

            <input
              id="resource-file"
              type="file"
              onChange={(event) =>
                setSelectedFile(
                  event.target.files?.[0] ||
                    null
                )
              }
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
            />

            {selectedFile && (
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Selected:{" "}
                {selectedFile.name}
              </p>
            )}

            <p className="mt-2 text-sm text-slate-500">
              Upload a PDF, DOCX, image or
              other lesson material.
            </p>

          </div>

          {/* BUTTON */}

          <button
            type="button"
            onClick={
              handleUpload
            }
            disabled={
              uploading
            }
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-7 py-3 font-bold text-slate-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <Upload size={18} />

            {uploading
              ? "Uploading..."
              : "Upload Resource"}

          </button>

        </div>

      </section>

      {/* =================================================
          EXISTING RESOURCES
      ================================================= */}

      <section className="mt-10">

        <div className="mb-6">

          <h2 className="text-2xl font-extrabold text-slate-900">
            Existing Resources
          </h2>

          <p className="mt-2 text-slate-600">
            Resources already uploaded for{" "}
            <span className="font-bold text-slate-900">
              {subjectName}
            </span>
            .
          </p>

        </div>

        {resources.length === 0 ? (

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">

            <FileText
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No resources yet
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Resources you upload will appear
              here and remain available after
              refreshing the page.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {resources.map(
              (resource) => (

                <div
                  key={
                    resource.id
                  }
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* RESOURCE INFO */}

                    <div className="flex min-w-0 items-start gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100">

                        <FileText
                          size={24}
                          className="text-yellow-600"
                        />

                      </div>

                      <div className="min-w-0">

                        <h3 className="break-words text-lg font-extrabold text-slate-900">
                          {resource.title}
                        </h3>

                        <p className="mt-1 break-all text-sm text-slate-600">
                          {resource.file_name}
                        </p>

                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          {formatFileSize(
                            resource.file_size
                          )}

                          {" • "}

                          {new Date(
                            resource.created_at
                          ).toLocaleDateString()}
                        </p>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex flex-wrap gap-3">

                      {/* VIEW */}

                      <a
                        href={
                          resource.file_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-5 py-3 font-bold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                      >

                        <Eye size={18} />

                        View

                      </a>

                      {/* DOWNLOAD */}

                      <a
                        href={
                          resource.file_url
                        }
                        download={
                          resource.file_name
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-yellow-400"
                      >

                        <Download size={18} />

                        Download

                      </a>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            resource
                          )
                        }
                        disabled={
                          deletingId ===
                          resource.id
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-5 py-3 font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        <Trash2
                          size={18}
                        />

                        {deletingId ===
                        resource.id
                          ? "Deleting..."
                          : "Delete"}

                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
}