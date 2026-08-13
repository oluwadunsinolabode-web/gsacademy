"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Upload,
  FileText,
} from "lucide-react";

export default function SubjectResourcesPage() {
  const params = useParams();

  const studentId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const subject = Array.isArray(params.subject)
    ? params.subject[0]
    : params.subject;

  const subjectName = subject
    ? decodeURIComponent(subject)
    : "Subject";

  return (
    <div className="mx-auto max-w-6xl">

      {/* =====================================
          BACK TO SUBJECTS
      ===================================== */}

      <Link
        href={`/tutor-dashboard/students/${studentId}/resources`}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 transition hover:text-slate-950"
      >
        <ArrowLeft size={18} />
        Back to Subjects
      </Link>

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="mt-8">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500">
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
              Add lesson notes and learning resources
              for this subject.
            </p>

          </div>

        </div>

      </div>

      {/* =====================================
          ADD RESOURCE
      ===================================== */}

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
            Add a title and attach the lesson note
            you want to make available to the student.
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
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
            />

            <p className="mt-2 text-sm text-slate-500">
              Upload a PDF, DOCX, image or other lesson
              material.
            </p>

          </div>

          {/* BUTTON */}

          <button
            type="button"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-7 py-3 font-bold text-slate-950 transition hover:bg-yellow-400"
          >
            <Upload size={18} />
            Upload Resource
          </button>

        </div>

      </section>

      {/* =====================================
          EXISTING RESOURCES
      ===================================== */}

      <section className="mt-10">

        <div className="mb-6">

          <h2 className="text-2xl font-extrabold text-slate-900">
            Existing Resources
          </h2>

          <p className="mt-2 text-slate-600">
            Lesson notes already added for{" "}
            <span className="font-bold text-slate-900">
              {subjectName}
            </span>
            .
          </p>

        </div>

        {/* EMPTY STATE */}

        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">

          <FileText
            size={42}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-5 text-lg font-bold text-slate-900">
            No resources yet
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Resources you upload for this subject
            will appear here.
          </p>

        </div>

      </section>

    </div>
  );
}