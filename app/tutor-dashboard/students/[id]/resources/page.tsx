"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Upload, User } from "lucide-react";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  full_name: string | null;
  subjects: string[] | null;
};

export default function SendResourcesPage() {
  const params = useParams();

  const studentId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [student, setStudent] =
    useState<Student | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadStudent() {
      try {
        setLoading(true);
        setError("");

        if (!studentId) {
          throw new Error(
            "Student ID is missing."
          );
        }

        /* =========================================
           GET STUDENT
        ========================================= */

        const {
          data,
          error: studentError,
        } = await supabase
          .from("students")
          .select(`
            id,
            full_name,
            subjects
          `)
          .eq("id", studentId)
          .single();

        if (studentError) {
          console.error(
            "RESOURCE STUDENT ERROR:",
            studentError
          );

          throw new Error(
            studentError.message ||
              "Unable to load student."
          );
        }

        if (!data) {
          throw new Error(
            "Student not found."
          );
        }

        setStudent(data);

      } catch (err) {
        console.error(
          "SEND RESOURCES ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load student."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStudent();
  }, [studentId]);

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-yellow-500" />

          <p className="mt-5 font-semibold text-slate-600">
            Loading student subjects...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     ERROR
  ========================================= */

  if (error || !student) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-white p-10 shadow-sm">

          <h1 className="text-2xl font-extrabold text-slate-900">
            Unable to load resources
          </h1>

          <p className="mt-3 text-red-600">
            {error ||
              "Student could not be found."}
          </p>

          <Link
            href={`/tutor-dashboard/students/${studentId}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white"
          >
            <ArrowLeft size={18} />
            Back to Student
          </Link>

        </div>
      </div>
    );
  }

  /* =========================================
     STUDENT SUBJECTS
  ========================================= */

  const subjects =
    Array.isArray(student.subjects)
      ? student.subjects.filter(
          (subject) =>
            typeof subject === "string" &&
            subject.trim() !== ""
        )
      : [];

  /* =========================================
     PAGE
  ========================================= */

  return (
    <div className="mx-auto max-w-6xl">

      {/* =====================================
          BACK
      ===================================== */}

      <Link
        href={`/tutor-dashboard/students/${student.id}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 transition hover:text-slate-950"
      >
        <ArrowLeft size={18} />
        Back to Student
      </Link>

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="mt-8">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-500">
            <Upload
              size={28}
              className="text-slate-950"
            />
          </div>

          <div>

            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-yellow-600">
              Tutor Resources
            </p>

            <h1 className="mt-1 text-3xl font-extrabold text-slate-950 sm:text-4xl">
              Send Resources
            </h1>

            <p className="mt-2 text-slate-600">
              Choose a subject for{" "}
              <span className="font-bold text-slate-900">
                {student.full_name ||
                  "this student"}
              </span>
              .
            </p>

          </div>

        </div>

      </div>

      {/* =====================================
          SUBJECTS
      ===================================== */}

      <section className="mt-10">

        <div className="mb-6">

          <h2 className="text-2xl font-extrabold text-slate-900">
            Select Subject
          </h2>

          <p className="mt-2 text-slate-600">
            Choose the subject you want to send
            lesson notes or learning materials for.
          </p>

        </div>

        {/* ===================================
            NO SUBJECTS
        =================================== */}

        {subjects.length === 0 ? (

          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <BookOpen
              size={45}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              No subjects assigned
            </h3>

            <p className="mt-2 text-slate-600">
              This student does not currently
              have any subjects assigned.
            </p>

          </div>

        ) : (

          /* ===================================
             SUBJECT TILES
          =================================== */

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {subjects.map(
              (subject) => {

                const cleanSubject =
                  subject.trim();

                return (
                  <Link
                    key={cleanSubject}
                    href={`/tutor-dashboard/students/${student.id}/resources/${encodeURIComponent(
                      cleanSubject
                    )}`}
                    className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-yellow-400 hover:shadow-lg"
                  >

                    {/* ICON */}

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 transition group-hover:bg-yellow-500">

                      <BookOpen
                        size={28}
                        className="text-yellow-600 transition group-hover:text-slate-950"
                      />

                    </div>

                    {/* SUBJECT */}

                    <h3 className="mt-6 text-2xl font-extrabold text-slate-900 transition group-hover:text-yellow-600">
                      {cleanSubject}
                    </h3>

                    {/* DESCRIPTION */}

                    <p className="mt-3 leading-7 text-slate-600">
                      Add lesson notes, attachments
                      and other learning resources
                      for this subject.
                    </p>

                    {/* FOOTER */}

                    <div className="mt-7 flex items-center justify-between">

                      <span className="text-sm font-bold text-slate-500">
                        Add Resource
                      </span>

                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
                        →
                      </span>

                    </div>

                  </Link>
                );
              }
            )}

          </div>

        )}

      </section>

      {/* =====================================
          STUDENT INFORMATION
      ===================================== */}

      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

        <div className="flex items-center gap-3">

          <User
            size={24}
            className="text-yellow-600"
          />

          <h2 className="text-xl font-extrabold text-slate-900">
            Student
          </h2>

        </div>

        <p className="mt-3 font-semibold text-slate-700">
          {student.full_name ||
            "Unnamed Student"}
        </p>

        <p className="mt-1 text-sm text-slate-600">
          {subjects.length > 0
            ? `${subjects.length} subject${
                subjects.length === 1
                  ? ""
                  : "s"
              } assigned`
            : "No subjects assigned"}
        </p>

      </div>

    </div>
  );
}