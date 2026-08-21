"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type MockExam = {
  id: string;
  title: string;
  status: string;
  subject: {
    id: string;
    name: string;
  } | null;
};

export default function MockExamsPage() {
  const [exams, setExams] = useState<MockExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExams() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("No logged-in student found.");
        }

        const { data: student, error: studentError } =
          await supabase
            .from("students")
            .select("id")
            .eq("auth_id", user.id)
            .single();

        if (studentError || !student) {
          throw new Error(
            studentError?.message ||
              "Student profile not found."
          );
        }

        const { data, error: examError } =
          await supabase
            .from("mock_student_exams")
            .select(`
              id,
              status,
              mock_exams (
                id,
                title,
                status,
                subjects (
                  id,
                  name
                )
              )
            `)
            .eq("student_id", student.id);

        if (examError) {
          throw new Error(examError.message);
        }

        const formatted: MockExam[] = (data || [])
          .map((item: any) => {
            const exam = Array.isArray(item.mock_exams)
              ? item.mock_exams[0]
              : item.mock_exams;

            if (!exam) return null;

            const subject = Array.isArray(exam.subjects)
              ? exam.subjects[0]
              : exam.subjects;

            return {
              id: item.id,
              title: exam.title,
              status: item.status,
              subject: subject
                ? {
                    id: subject.id,
                    name: subject.name,
                  }
                : null,
            };
          })
          .filter(Boolean) as MockExam[];

        setExams(formatted);
      } catch (err) {
        console.error("MOCK EXAMS ERROR:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load mock exams."
        );
      } finally {
        setLoading(false);
      }
    }

    loadExams();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="font-semibold text-slate-700">
          Loading your mock exams...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Unable to load mock exams
        </h1>

        <p className="mt-3 text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <main>
      <div>
        <p className="font-bold uppercase tracking-wide text-yellow-600">
          GS Academy Assessment
        </p>

        <h1 className="mt-3 text-4xl font-extrabold text-slate-900">
          My Mock Exams
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Select a subject to view your assigned mock examination.
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            No mock exams yet
          </h2>

          <p className="mt-3 text-slate-600">
            Your assigned mock examinations will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-1 w-16 rounded-full bg-yellow-500" />

              <p className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-500">
                {exam.subject?.name || "Subject"}
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                {exam.title}
              </h2>

              <p className="mt-4 text-sm text-slate-600">
                Assigned mock examination
              </p>

              <Link
                href={`/dashboard/resources/mock-exams/${exam.id}`}
                className="mt-7 block w-full rounded-xl bg-slate-900 py-3 text-center font-bold text-white transition hover:bg-slate-800"
              >
                View Mock
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}