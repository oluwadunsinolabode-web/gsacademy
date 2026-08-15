"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  Download,
  FileText,
  ImageIcon,
  BookOpen,
  Loader2,
  AlertCircle,
  CalendarDays,
  ExternalLink,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

/* =====================================================
   TYPES
===================================================== */

type LessonResource = {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: string;
  title: string;
  file_name: string | null;
  file_url: string;
  file_path: string | null;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
};

/* =====================================================
   PAGE
===================================================== */

export default function SubjectResourcesPage() {
  const params = useParams();

  const subject = decodeURIComponent(
    Array.isArray(params.subject)
      ? params.subject[0]
      : params.subject || ""
  );

  const [resources, setResources] =
    useState<LessonResource[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD RESOURCES
  ===================================================== */

  useEffect(() => {
    if (!subject) {
      setLoading(false);
      return;
    }

    loadResources();
  }, [subject]);

  async function loadResources() {
    try {
      setLoading(true);
      setError("");

      /* ===============================================
         AUTH
      =============================================== */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "You must be logged in."
        );
      }

      /* ===============================================
         GET STUDENT
      =============================================== */

      const {
        data: studentData,
        error: studentError,
      } = await supabase
        .from("students")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (studentError || !studentData) {
        throw new Error(
          studentError?.message ||
            "Student profile could not be found."
        );
      }

      /* ===============================================
         GET RESOURCES
      =============================================== */

      const {
        data,
        error: resourceError,
      } = await supabase
        .from("lesson_resources")
        .select(
          `
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
          `
        )
        .eq(
          "student_id",
          studentData.id
        )
        .ilike(
          "subject",
          subject
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
        (data || []) as LessonResource[]
      );
    } catch (err) {
      console.error(
        "STUDENT RESOURCES ERROR:",
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
     FILE ICON
  ===================================================== */

  function getFileIcon(
    fileType: string | null
  ) {
    if (
      fileType?.startsWith("image/")
    ) {
      return (
        <ImageIcon
          size={28}
          className="text-yellow-600"
        />
      );
    }

    return (
      <FileText
        size={28}
        className="text-yellow-600"
      />
    );
  }

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
     DOWNLOAD RESOURCE
  ===================================================== */

  async function downloadResource(
    resource: LessonResource
  ) {
    try {
      setError("");

      /*
       * If we have the original Supabase
       * storage path, use Supabase download.
       *
       * This is preferable because it tells
       * Supabase that the user wants the file
       * downloaded rather than simply opened.
       */

      if (resource.file_path) {
        const {
          data,
          error: downloadError,
        } = await supabase.storage
          .from("classwork-submissions")
          .download(
            resource.file_path
          );

        if (downloadError || !data) {
          throw new Error(
            downloadError?.message ||
              "Unable to download this resource."
          );
        }

        const blobUrl =
          window.URL.createObjectURL(
            data
          );

        const link =
          document.createElement("a");

        link.href = blobUrl;

        link.download =
          resource.file_name ||
          resource.title ||
          "learning-resource";

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          blobUrl
        );

        return;
      }

      /*
       * Fallback:
       *
       * If an older resource does not have
       * file_path, use the existing public URL.
       */

      const response =
        await fetch(
          resource.file_url
        );

      if (!response.ok) {
        throw new Error(
          "Unable to download this resource."
        );
      }

      const blob =
        await response.blob();

      const blobUrl =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = blobUrl;

      link.download =
        resource.file_name ||
        resource.title ||
        "learning-resource";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        blobUrl
      );
    } catch (err) {
      console.error(
        "RESOURCE DOWNLOAD ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to download the resource."
      );
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-white">

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <Loader2
              size={36}
              className="mx-auto animate-spin text-yellow-500"
            />

            <p className="mt-4 font-semibold text-slate-600">
              Loading {subject} resources...
            </p>

          </div>

        </div>

      </main>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <main className="min-h-screen bg-white">

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

          <Link
            href="/dashboard/resources/lesson-notes"
            className="inline-flex items-center gap-2 font-bold text-slate-700 hover:text-slate-950"
          >
            <ArrowLeft size={18} />
            Back to Subjects
          </Link>

          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6">

            <div className="flex items-start gap-3">

              <AlertCircle
                size={22}
                className="mt-0.5 text-red-600"
              />

              <div>

                <h1 className="text-xl font-bold text-red-800">
                  Unable to load resources
                </h1>

                <p className="mt-2 font-medium text-red-700">
                  {error}
                </p>

              </div>

            </div>

          </div>

        </div>

      </main>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main className="min-h-screen bg-white">

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* =================================================
            BACK
        ================================================= */}

        <Link
          href="/dashboard/resources/lesson-notes"
          className="inline-flex items-center gap-2 font-bold text-slate-700 hover:text-slate-950"
        >
          <ArrowLeft size={18} />
          Back to Subjects
        </Link>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mt-8">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">

              <BookOpen
                size={28}
                className="text-yellow-600"
              />

            </div>

            <div>

              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-yellow-600">
                Learning Resources
              </p>

              <h1 className="mt-1 text-3xl font-black text-slate-950 sm:text-4xl">
                {subject}
              </h1>

            </div>

          </div>

          <p className="mt-4 max-w-2xl text-slate-600">
            Lesson notes and learning materials
            provided by your tutor for {subject}.
          </p>

        </div>

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        {/* =================================================
            NO RESOURCES
        ================================================= */}

        {resources.length === 0 ? (

          <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center">

            <FileText
              size={44}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No resources yet
            </h2>

            <p className="mt-2 text-slate-600">
              Your tutor has not uploaded any{" "}
              {subject} resources yet.
            </p>

          </div>

        ) : (

          /* =================================================
             RESOURCE LIST
          ================================================= */

          <div className="mt-10 space-y-5">

            {resources.map(
              (resource) => (

                <div
                  key={resource.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-yellow-400 hover:shadow-md"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* =================================================
                        LEFT
                    ================================================= */}

                    <div className="flex min-w-0 items-start gap-4">

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100">
                        {getFileIcon(
                          resource.file_type
                        )}
                      </div>

                      <div className="min-w-0">

                        <h2 className="break-words text-xl font-black text-slate-950">
                          {resource.title}
                        </h2>

                        {resource.file_name && (
                          <p className="mt-1 break-all text-sm font-medium text-slate-500">
                            {resource.file_name}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">

                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays
                              size={14}
                            />

                            {new Date(
                              resource.created_at
                            ).toLocaleDateString()}
                          </span>

                          {resource.file_size && (
                            <span>
                              {formatFileSize(
                                resource.file_size
                              )}
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">

                      {/* OPEN */}

                      <a
                        href={
                          resource.file_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >

                        <ExternalLink
                          size={18}
                        />

                        Open Document

                      </a>

                      {/* DOWNLOAD */}

                      <button
                        type="button"
                        onClick={() =>
                          downloadResource(
                            resource
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-bold text-slate-900 transition hover:bg-yellow-400"
                      >

                        <Download
                          size={18}
                        />

                        Download

                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </main>
  );
}