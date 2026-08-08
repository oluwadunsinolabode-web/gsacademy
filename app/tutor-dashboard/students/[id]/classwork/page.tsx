"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Users,
  Clock,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Classwork = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  created_at: string;
  deadline: string | null;
};

type Submission = {
  id: string;
  classwork_id: string;
  status: string | null;
};

export default function TutorClassworkPage() {
  const [classwork, setClasswork] = useState<Classwork[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClasswork() {
      setLoading(true);

      const { data: classworkData, error: classworkError } =
        await supabase
          .from("classwork")
          .select("*")
          .order("created_at", { ascending: false });

      if (classworkError) {
        console.error(classworkError);
        setLoading(false);
        return;
      }

      const { data: submissionData, error: submissionError } =
        await supabase
          .from("classwork_submissions")
          .select("id, classwork_id, status");

      if (submissionError) {
        console.error(submissionError);
      }

      setClasswork(classworkData || []);
      setSubmissions(submissionData || []);
      setLoading(false);
    }

    loadClasswork();
  }, []);

  function getSubmissionCount(classworkId: string) {
    return submissions.filter(
      (submission) => submission.classwork_id === classworkId
    ).length;
  }

  function getMarkedCount(classworkId: string) {
    return submissions.filter(
      (submission) =>
        submission.classwork_id === classworkId &&
        submission.status?.toLowerCase() === "marked"
    ).length;
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-slate-900">
        Classwork
      </h1>

      <p className="mt-3 text-slate-600">
        Create classwork, review student submissions and mark completed work.
      </p>

      {/* Top Action */}
      <div className="mt-8 flex justify-end">
        <Link
          href="/tutor-dashboard/classwork/create"
          className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-900 transition hover:bg-yellow-400"
        >
          + Create Classwork
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-10 rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="text-slate-500">Loading classwork...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && classwork.length === 0 && (
        <div className="mt-10 rounded-3xl bg-white p-10 text-center shadow-sm">
          <ClipboardCheck
            size={50}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            No classwork yet
          </h2>

          <p className="mt-2 text-slate-500">
            Create your first classwork for your students.
          </p>

          <Link
            href="/tutor-dashboard/classwork/create"
            className="mt-6 inline-block rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-900"
          >
            Create Classwork
          </Link>
        </div>
      )}

      {/* Classwork List */}
      {!loading && classwork.length > 0 && (
        <div className="mt-10 space-y-6">
          {classwork.map((item) => {
            const submitted = getSubmissionCount(item.id);
            const marked = getMarkedCount(item.id);

            return (
              <div
                key={item.id}
                className="rounded-3xl bg-white p-8 shadow-sm"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {item.title}
                      </h2>

                      <span className="rounded-full bg-yellow-100 px-4 py-1 text-sm font-semibold text-yellow-700">
                        {item.subject}
                      </span>
                    </div>

                    {item.description && (
                      <p className="mt-3 text-slate-600">
                        {item.description}
                      </p>
                    )}

                    <p className="mt-3 text-sm text-slate-400">
                      Created{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <Link
                    href={`/tutor-dashboard/classwork/${item.id}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-800"
                  >
                    View Submissions
                    <ChevronRight size={18} />
                  </Link>
                </div>

                {/* Stats */}
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      <Users
                        size={24}
                        className="text-yellow-500"
                      />

                      <span className="font-semibold text-slate-600">
                        Submitted
                      </span>
                    </div>

                    <p className="mt-3 text-3xl font-extrabold text-slate-900">
                      {submitted}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      <CheckCircle
                        size={24}
                        className="text-green-600"
                      />

                      <span className="font-semibold text-slate-600">
                        Marked
                      </span>
                    </div>

                    <p className="mt-3 text-3xl font-extrabold text-green-600">
                      {marked}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      <Clock
                        size={24}
                        className="text-yellow-500"
                      />

                      <span className="font-semibold text-slate-600">
                        Deadline
                      </span>
                    </div>

                    <p className="mt-3 font-bold text-slate-900">
                      {item.deadline
                        ? new Date(item.deadline).toLocaleDateString()
                        : "No deadline"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}