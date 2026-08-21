"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  full_name: string;
  email: string;
};

type Subject = {
  id: string;
  name: string;
};

export default function MonthlyMockPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [durationMinutes, setDurationMinutes] =
    useState("60");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setMessage("");

      const [
        { data: studentData, error: studentError },
        { data: subjectData, error: subjectError },
      ] = await Promise.all([
        supabase
          .from("students")
          .select("id, full_name, email")
          .order("full_name"),

        supabase
          .from("subjects")
          .select("id, name")
          .order("name"),
      ]);

      if (studentError) {
        setMessage(studentError.message);
      }

      if (subjectError) {
        setMessage(subjectError.message);
      }

      setStudents(studentData || []);
      setSubjects(subjectData || []);

      setLoading(false);
    }

    loadData();
  }, []);

  async function createMock() {
    if (!studentId || !subjectId || !title.trim()) {
      setMessage(
        "Select a student, subject and enter a mock title."
      );
      return;
    }

    const duration = Number(durationMinutes);

    if (
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      setMessage(
        "Please select a valid examination duration."
      );
      return;
    }

    setCreating(true);
    setMessage("");

    const { data: exam, error: examError } =
      await supabase
        .from("mock_exams")
        .insert({
          title: title.trim(),
          description:
            description.trim() || null,
          subject_id: subjectId,
          duration_minutes: duration,
          status: "draft",
        })
        .select()
        .single();

    if (examError || !exam) {
      setMessage(
        examError?.message ||
          "Unable to create mock exam."
      );
      setCreating(false);
      return;
    }

    const { error: assignmentError } =
      await supabase
        .from("mock_student_exams")
        .insert({
          exam_id: exam.id,
          student_id: studentId,
          status: "assigned",
        });

    if (assignmentError) {
      setMessage(assignmentError.message);
      setCreating(false);
      return;
    }

    setMessage(
      "Mock exam created and assigned successfully."
    );

    setTitle("");
    setDescription("");
    setStudentId("");
    setSubjectId("");
    setDurationMinutes("60");

    setCreating(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="font-semibold text-slate-700">
          Loading students and subjects...
        </p>
      </div>
    );
  }

  return (
    <main>
      <h1 className="text-4xl font-extrabold text-slate-900">
        Monthly Mock Exams
      </h1>

      <p className="mt-3 text-slate-600">
        Create a mock exam and assign it to a specific student.
      </p>

      <div className="mt-10 max-w-3xl rounded-3xl bg-white p-8 shadow-sm">

        {/* STUDENT */}

        <div>
          <label className="font-semibold text-slate-900">
            Student
          </label>

          <select
            value={studentId}
            onChange={(e) =>
              setStudentId(e.target.value)
            }
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="">
              Select student
            </option>

            {students.map((student) => (
              <option
                key={student.id}
                value={student.id}
              >
                {student.full_name} — {student.email}
              </option>
            ))}
          </select>
        </div>

        {/* SUBJECT */}

        <div className="mt-6">
          <label className="font-semibold text-slate-900">
            Subject
          </label>

          <select
            value={subjectId}
            onChange={(e) =>
              setSubjectId(e.target.value)
            }
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="">
              Select subject
            </option>

            {subjects.map((subject) => (
              <option
                key={subject.id}
                value={subject.id}
              >
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* TITLE */}

        <div className="mt-6">
          <label className="font-semibold text-slate-900">
            Mock Title
          </label>

          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="e.g. August Mathematics Mock"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </div>

        {/* DURATION */}

        <div className="mt-6">
          <label className="font-semibold text-slate-900">
            Examination Duration
          </label>

          <select
            value={durationMinutes}
            onChange={(e) =>
              setDurationMinutes(e.target.value)
            }
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="30">
              30 minutes
            </option>

            <option value="45">
              45 minutes
            </option>

            <option value="60">
              60 minutes
            </option>

            <option value="75">
              75 minutes
            </option>

            <option value="90">
              90 minutes
            </option>

            <option value="120">
              120 minutes
            </option>

            <option value="150">
              150 minutes
            </option>

            <option value="180">
              180 minutes
            </option>
          </select>

          <p className="mt-2 text-sm text-slate-500">
            The student's countdown will automatically use
            this duration.
          </p>
        </div>

        {/* DESCRIPTION */}

        <div className="mt-6">
          <label className="font-semibold text-slate-900">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            placeholder="Optional instructions for the student"
            rows={4}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="mt-6 rounded-xl bg-slate-100 p-4 font-medium text-slate-700">
            {message}
          </div>
        )}

        {/* CREATE */}

        <button
          onClick={createMock}
          disabled={creating}
          className="mt-6 rounded-xl bg-slate-900 px-7 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {creating
            ? "Creating..."
            : "Create Mock Exam"}
        </button>
      </div>
    </main>
  );
}