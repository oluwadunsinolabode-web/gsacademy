"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  User,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useParams } from "next/navigation";

type Student = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  subjects: string[] | null;
  package: string | null;
  status: string | null;
  tutor_id: string | null;
  google_meet_link: string | null;
};

export default function StudentWorkspace() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudent() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/tutor/students/${studentId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load student"
          );
        }

        setStudent(data.student);
      } catch (err) {
        console.error("Student loading error:", err);

        setStudent(null);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load student information."
        );
      } finally {
        setLoading(false);
      }
    }

    if (studentId) {
      loadStudent();
    }
  }, [studentId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="text-slate-500">
            Loading student information...
          </p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

          <User
            size={50}
            className="mx-auto text-slate-300"
          />

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Student Not Found
          </h1>

          <p className="mt-3 text-slate-500">
            {error || "This student could not be found."}
          </p>

          <Link
            href="/tutor-dashboard/students"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-6 py-3 font-bold text-white"
          >
            Back to My Students
          </Link>

        </div>
      </div>
    );
  }

  const subjects = student.subjects?.length
    ? student.subjects.join(" • ")
    : "No subjects assigned";
    const meetLink = student.google_meet_link?.trim() || "";

  return (
    <div className="mx-auto max-w-7xl">

      {/* Header */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-4xl font-extrabold text-slate-900">
            {student.full_name || "Unnamed Student"}
          </h1>

          <p className="mt-3 text-slate-600">
            {subjects}
            {student.package
              ? ` • ${student.package}`
              : ""}
          </p>

        </div>

        <span
          className={`rounded-full px-5 py-3 font-semibold ${
            student.status?.toLowerCase() === "active"
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {student.status || "Unknown"} Student
        </span>

      </div>
        {/* Start Class */}

 <div className="mt-8 flex flex-wrap items-center gap-4">

  {meetLink ? (
    <a
      href={meetLink}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-xl bg-yellow-500 px-7 py-4 font-bold text-slate-900 transition hover:bg-yellow-400"
    >
      Start Class
    </a>
  ) : (
    <div className="rounded-2xl bg-slate-100 px-5 py-4 text-sm text-slate-500">
      No Google Meet link added yet.
    </div>
  )}

</div>

      {/* Statistics */}

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <GraduationCap
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 text-slate-600">
            Average Score
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            --
          </h2>

        </div>


        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <ClipboardCheck
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 text-slate-600">
            Submitted Classwork
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            0
          </h2>

        </div>


        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <BookOpen
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 text-slate-600">
            Homework
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            0
          </h2>

        </div>


        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <TrendingUp
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 text-slate-600">
            Progress
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            --
          </h2>

        </div>

      </div>


      {/* Actions */}

      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

        {/* Classwork */}

        <Link
          href={`/tutor-dashboard/students/${student.id}/classwork`}
          className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >

          <ClipboardCheck
            size={42}
            className="text-yellow-500"
          />

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            View Classwork
          </h2>

          <p className="mt-3 text-slate-600">
            Review submissions, score work and send feedback.
          </p>

        </Link>


        {/* Homework */}

        <Link
          href={`/tutor-dashboard/students/${student.id}/homework`}
          className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >

          <BookOpen
            size={42}
            className="text-yellow-500"
          />

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Homework
          </h2>

          <p className="mt-3 text-slate-600">
            Assign homework and review completed work.
          </p>

        </Link>


        {/* Resources */}

        <Link
          href={`/tutor-dashboard/students/${student.id}/resources`}
          className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >

          <Upload
            size={42}
            className="text-yellow-500"
          />

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Send Resources
          </h2>

          <p className="mt-3 text-slate-600">
            Upload corrections, notes and extra learning materials.
          </p>

        </Link>


        {/* Progress Report */}

        <Link
          href={`/tutor-dashboard/students/${student.id}/report`}
          className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >

          <FileText
            size={42}
            className="text-yellow-500"
          />

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Progress Report
          </h2>

          <p className="mt-3 text-slate-600">
            View performance history and assessment records.
          </p>

        </Link>


        {/* Profile */}

        <Link
          href={`/tutor-dashboard/students/${student.id}/profile`}
          className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >

          <User
            size={42}
            className="text-yellow-500"
          />

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Student Profile
          </h2>

          <p className="mt-3 text-slate-600">
            Contact information, package and enrolled subjects.
          </p>

        </Link>

      </div>


      {/* Student Information */}

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <h2 className="text-2xl font-bold text-slate-900">
          Student Information
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">

          <div className="rounded-2xl bg-slate-50 p-5">

            <p className="text-sm text-slate-500">
              Email
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {student.email || "No email"}
            </p>

          </div>


          <div className="rounded-2xl bg-slate-50 p-5">

            <p className="text-sm text-slate-500">
              Phone
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {student.phone || "No phone number"}
            </p>

          </div>


          <div className="rounded-2xl bg-slate-50 p-5">

            <p className="text-sm text-slate-500">
              Subjects
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {subjects}
            </p>

          </div>


          <div className="rounded-2xl bg-slate-50 p-5">

            <p className="text-sm text-slate-500">
              Package
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {student.package || "No package assigned"}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}
