"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  full_name: string;
  email: string;
  subjects: string[] | null;
};

type Subject = {
  id: string;
  name: string;
};

type MockExam = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  status: string | null;
  subject_id: string | null;
};

export default function ManageMockPage() {
  const params = useParams();
  const router = useRouter();

  const examId = params.id as string;

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mock, setMock] = useState<MockExam | null>(null);

  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =========================================================
     LOAD STUDENTS, SUBJECTS AND MOCK
  ========================================================= */

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const [
          { data: studentData, error: studentError },
          { data: subjectData, error: subjectError },
          { data: mockData, error: mockError },
        ] = await Promise.all([
          supabase
            .from("students")
            .select(
              "id, full_name, email, subjects"
            )
            .order("full_name"),

          supabase
            .from("subjects")
            .select("id, name")
            .order("name"),

          supabase
            .from("mock_exams")
            .select(
              `
                id,
                title,
                description,
                duration_minutes,
                status,
                subject_id
              `
            )
            .eq("id", examId)
            .single(),
        ]);

        if (studentError) {
          throw new Error(
            studentError.message
          );
        }

        if (subjectError) {
          throw new Error(
            subjectError.message
          );
        }

        if (mockError || !mockData) {
          throw new Error(
            mockError?.message ||
              "Mock examination not found."
          );
        }

        setStudents(
          (studentData || []) as Student[]
        );

        setSubjects(
          (subjectData || []) as Subject[]
        );

        setMock(
          mockData as MockExam
        );

        /* =====================================================
           FIND THE STUDENT THIS MOCK IS ASSIGNED TO
        ===================================================== */

        const {
          data: assignment,
          error: assignmentError,
        } = await supabase
          .from("mock_student_exams")
          .select("student_id")
          .eq("exam_id", examId)
          .limit(1)
          .maybeSingle();

        if (assignmentError) {
          throw new Error(
            assignmentError.message
          );
        }

        if (assignment?.student_id) {
          setStudentId(
            assignment.student_id
          );
        }

        if (mockData.subject_id) {
          setSubjectId(
            mockData.subject_id
          );
        }
      } catch (err) {
        console.error(
          "MANAGE MOCK ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load mock examination."
        );
      } finally {
        setLoading(false);
      }
    }

    if (examId) {
      loadData();
    }
  }, [examId]);

  /* =========================================================
     SELECTED STUDENT
  ========================================================= */

  const selectedStudent = useMemo(() => {
    return students.find(
      (student) =>
        student.id === studentId
    );
  }, [students, studentId]);

  /* =========================================================
     REGISTERED SUBJECTS FOR SELECTED STUDENT
  ========================================================= */

  const registeredSubjects = useMemo(() => {
    if (!selectedStudent) {
      return [];
    }

    const studentSubjects =
      selectedStudent.subjects || [];

    if (studentSubjects.length === 0) {
      return [];
    }

    return subjects.filter((subject) =>
      studentSubjects.some(
        (studentSubject) =>
          studentSubject.toLowerCase() ===
          subject.name.toLowerCase()
      )
    );
  }, [
    selectedStudent,
    subjects,
  ]);

  /* =========================================================
     CHANGE STUDENT
  ========================================================= */

  function handleStudentChange(
    value: string
  ) {
    setStudentId(value);
    setSubjectId("");
    setMessage("");
    setError("");
  }

  /* =========================================================
     SAVE STUDENT + SUBJECT
  ========================================================= */

  async function saveAssignment() {
    if (!studentId) {
      setError(
        "Please select a student."
      );
      return;
    }

    if (!subjectId) {
      setError(
        "Please select a subject."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      /* =====================================================
         UPDATE MOCK SUBJECT
      ===================================================== */

      const {
        error: mockUpdateError,
      } = await supabase
        .from("mock_exams")
        .update({
          subject_id: subjectId,
        })
        .eq("id", examId);

      if (mockUpdateError) {
        throw new Error(
          mockUpdateError.message
        );
      }

      /* =====================================================
         FIND EXISTING ASSIGNMENT
      ===================================================== */

      const {
        data: existingAssignment,
        error: existingError,
      } = await supabase
        .from("mock_student_exams")
        .select("id")
        .eq("exam_id", examId)
        .maybeSingle();

      if (existingError) {
        throw new Error(
          existingError.message
        );
      }

      /* =====================================================
         UPDATE OR CREATE ASSIGNMENT
      ===================================================== */

      if (existingAssignment) {
        const {
          error: updateAssignmentError,
        } = await supabase
          .from("mock_student_exams")
          .update({
            student_id: studentId,
          })
          .eq(
            "id",
            existingAssignment.id
          );

        if (updateAssignmentError) {
          throw new Error(
            updateAssignmentError.message
          );
        }
      } else {
        const {
          error: insertAssignmentError,
        } = await supabase
          .from("mock_student_exams")
          .insert({
            exam_id: examId,
            student_id: studentId,
            status: "assigned",
          });

        if (insertAssignmentError) {
          throw new Error(
            insertAssignmentError.message
          );
        }
      }

      setMessage(
        "Student and subject saved successfully."
      );
    } catch (err) {
      console.error(
        "SAVE ASSIGNMENT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save assignment."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     PUBLISH MOCK
  ========================================================= */

  async function publishMock() {
    try {
      setPublishing(true);
      setError("");
      setMessage("");

      if (!studentId) {
        throw new Error(
          "Select a student before publishing."
        );
      }

      if (!subjectId) {
        throw new Error(
          "Select a subject before publishing."
        );
      }

      const {
        data: questions,
        error: questionsError,
      } = await supabase
        .from("mock_questions")
        .select("id")
        .eq("exam_id", examId);

      if (questionsError) {
        throw new Error(
          questionsError.message
        );
      }

      if (!questions || questions.length === 0) {
        throw new Error(
          "You cannot publish this mock because no questions have been added yet."
        );
      }

      const {
        error: publishError,
      } = await supabase
        .from("mock_exams")
        .update({
          subject_id: subjectId,
          status: "published",
        })
        .eq("id", examId);

      if (publishError) {
        throw new Error(
          publishError.message
        );
      }

      setMock((current) =>
        current
          ? {
              ...current,
              subject_id: subjectId,
              status: "published",
            }
          : current
      );

      setMessage(
        "Mock examination published successfully."
      );
    } catch (err) {
      console.error(
        "PUBLISH MOCK ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to publish mock examination."
      );
    } finally {
      setPublishing(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="font-semibold text-slate-700">
          Loading mock examination...
        </p>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error && !mock) {
    return (
      <main>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Unable to load mock examination
          </h1>

          <p className="mt-3 text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="max-w-6xl">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <p className="font-bold uppercase tracking-[0.2em] text-yellow-600">
          GS Academy Assessment
        </p>

        <h1 className="mt-3 text-4xl font-extrabold text-slate-900">
          Manage Mock Examination
        </h1>

        <p className="mt-3 max-w-3xl text-slate-600">
          Prepare this examination for the selected
          student and subject before adding and publishing
          the questions.
        </p>
      </div>


      {/* =====================================================
          MOCK SUMMARY
      ===================================================== */}

      {mock && (
        <div className="mt-8 rounded-3xl bg-slate-900 p-8 text-white shadow-xl">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-yellow-400">
                Mock Examination
              </p>

              <h2 className="mt-2 text-3xl font-extrabold">
                {mock.title}
              </h2>

              {mock.description && (
                <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                  {mock.description}
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-white/10 px-6 py-4 text-center">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Duration
              </p>

              <p className="mt-1 text-2xl font-extrabold text-yellow-400">
                {mock.duration_minutes || 0} min
              </p>

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          STUDENT + SUBJECT
      ===================================================== */}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">

        {/* STUDENT */}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="h-1 w-16 rounded-full bg-yellow-500" />

          <h2 className="mt-6 text-2xl font-extrabold text-slate-900">
            Student
          </h2>

          <p className="mt-2 text-slate-600">
            Select the real student who will receive
            this examination.
          </p>

          <select
            value={studentId}
            onChange={(e) =>
              handleStudentChange(
                e.target.value
              )
            }
            className="mt-6 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
          >
            <option value="">
              Select student
            </option>

            {students.map(
              (student) => (
                <option
                  key={student.id}
                  value={student.id}
                >
                  {student.full_name} —{" "}
                  {student.email}
                </option>
              )
            )}
          </select>

          {selectedStudent && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-5">

              <p className="text-sm font-semibold text-slate-500">
                Selected Student
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {selectedStudent.full_name}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {selectedStudent.email}
              </p>

            </div>
          )}

        </div>


        {/* SUBJECT */}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="h-1 w-16 rounded-full bg-slate-900" />

          <h2 className="mt-6 text-2xl font-extrabold text-slate-900">
            Subject
          </h2>

          <p className="mt-2 text-slate-600">
            Only subjects registered for by the selected
            student will appear here.
          </p>

          <select
            value={subjectId}
            onChange={(e) =>
              setSubjectId(
                e.target.value
              )
            }
            disabled={
              !studentId ||
              registeredSubjects.length === 0
            }
            className="mt-6 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">
              {!studentId
                ? "Select a student first"
                : registeredSubjects.length ===
                  0
                ? "No registered subjects found"
                : "Select subject"}
            </option>

            {registeredSubjects.map(
              (subject) => (
                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {subject.name}
                </option>
              )
            )}
          </select>

          {studentId &&
            registeredSubjects.length ===
              0 && (
              <p className="mt-4 text-sm font-semibold text-red-600">
                No registered subjects were found
                for this student.
              </p>
            )}

        </div>

      </div>


      {/* =====================================================
          STATUS
      ===================================================== */}

      {(message || error) && (
        <div
          className={`mt-8 rounded-2xl p-5 font-semibold ${
            error
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {error || message}
        </div>
      )}


      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

        <h2 className="text-2xl font-extrabold text-slate-900">
          Examination Setup
        </h2>

        <p className="mt-2 text-slate-600">
          Save the student and subject first. Then continue
          to the question manager.
        </p>


        <div className="mt-6 flex flex-col gap-4 sm:flex-row">

          <button
            type="button"
            onClick={saveAssignment}
            disabled={
              saving ||
              !studentId ||
              !subjectId
            }
            className="rounded-xl bg-slate-900 px-7 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Assignment"}
          </button>


          <button
            type="button"
            onClick={() =>
              router.push(
                `/admin-dashboard/monthly-mock/${examId}/questions`
              )
            }
            disabled={
              !studentId ||
              !subjectId
            }
            className="rounded-xl bg-yellow-500 px-7 py-3 font-bold text-slate-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Manage Questions
          </button>

        </div>

      </div>


      {/* =====================================================
          PUBLISH
      ===================================================== */}

      <div className="mt-8 mb-10 rounded-3xl border border-yellow-200 bg-yellow-50 p-8">

        <h2 className="text-2xl font-extrabold text-slate-900">
          Publish Examination
        </h2>

        <p className="mt-2 max-w-3xl leading-7 text-slate-700">
          Publishing makes this examination available to
          the assigned student. The student will only see
          this mock under the corresponding subject.
        </p>

        <button
          type="button"
          onClick={publishMock}
          disabled={
            publishing ||
            !studentId ||
            !subjectId ||
            mock?.status === "published"
          }
          className="mt-6 rounded-xl bg-green-600 px-7 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {publishing
            ? "Publishing..."
            : mock?.status === "published"
            ? "Published"
            : "Publish Mock Examination"}
        </button>

      </div>

    </main>
  );
}