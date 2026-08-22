"use client";

import { useEffect, useMemo, useState } from "react";
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

type ParsedQuestion = {
  question_text: string;
  question_type: "multiple_choice" | "short_answer";
  expected_answer: string | null;
  marks: number;
  explanation: string | null;
  options: Record<string, string> | null;
};

type PublishedMock = MockExam & {
  subject_name: string;
};

type ViewQuestion = ParsedQuestion & {
  id: string;
};

type Mode = "create" | "published";

export default function MonthlyMockPage() {
  const [mode, setMode] = useState<Mode>("create");

  /* =========================================================
     GLOBAL DATA
  ========================================================= */

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);

  /* =========================================================
     CREATE / PREPARE MOCK
  ========================================================= */

  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");

  const [bulkText, setBulkText] = useState("");

  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);

  const [parsing, setParsing] = useState(false);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [currentExam, setCurrentExam] =
    useState<MockExam | null>(null);

  /* =========================================================
     PUBLISHED MOCK VIEWER
  ========================================================= */

  const [viewerStudentId, setViewerStudentId] =
    useState("");

  const [viewerSubjectId, setViewerSubjectId] =
    useState("");

  const [publishedMocks, setPublishedMocks] =
    useState<PublishedMock[]>([]);

  const [loadingPublished, setLoadingPublished] =
    useState(false);

  const [selectedPublishedMock, setSelectedPublishedMock] =
    useState<PublishedMock | null>(null);

  const [viewerQuestions, setViewerQuestions] =
    useState<ViewQuestion[]>([]);

  const [loadingViewerQuestions, setLoadingViewerQuestions] =
    useState(false);

  /* =========================================================
     MESSAGES
  ========================================================= */

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =========================================================
     LOAD STUDENTS + SUBJECTS
  ========================================================= */

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          { data: studentData, error: studentError },
          { data: subjectData, error: subjectError },
        ] = await Promise.all([
          supabase
            .from("students")
            .select("id, full_name, email, subjects")
            .order("full_name"),

          supabase
            .from("subjects")
            .select("id, name")
            .order("name"),
        ]);

        if (studentError) {
          throw new Error(studentError.message);
        }

        if (subjectError) {
          throw new Error(subjectError.message);
        }

        setStudents((studentData || []) as Student[]);
        setSubjects((subjectData || []) as Subject[]);
      } catch (err) {
        console.error("MONTHLY MOCK LOAD ERROR:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load students and subjects."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /* =========================================================
     SELECTED CREATE STUDENT
  ========================================================= */

  const selectedStudent = useMemo(() => {
    return students.find(
      (student) => student.id === studentId
    );
  }, [students, studentId]);

  /* =========================================================
     REGISTERED SUBJECTS FOR CREATE STUDENT
  ========================================================= */

  const registeredSubjects = useMemo(() => {
    if (!selectedStudent) {
      return [];
    }

    const studentSubjects =
      selectedStudent.subjects || [];

    return subjects.filter((subject) =>
      studentSubjects.some(
        (studentSubject) =>
          studentSubject.toLowerCase() ===
          subject.name.toLowerCase()
      )
    );
  }, [selectedStudent, subjects]);

  /* =========================================================
     VIEWER STUDENT
  ========================================================= */

  const viewerStudent = useMemo(() => {
    return students.find(
      (student) =>
        student.id === viewerStudentId
    );
  }, [students, viewerStudentId]);

  /* =========================================================
     VIEWER REGISTERED SUBJECTS
  ========================================================= */

  const viewerRegisteredSubjects = useMemo(() => {
    if (!viewerStudent) {
      return [];
    }

    const studentSubjects =
      viewerStudent.subjects || [];

    return subjects.filter((subject) =>
      studentSubjects.some(
        (studentSubject) =>
          studentSubject.toLowerCase() ===
          subject.name.toLowerCase()
      )
    );
  }, [viewerStudent, subjects]);

  /* =========================================================
     CHANGE CREATE STUDENT
  ========================================================= */

  function handleCreateStudentChange(
    value: string
  ) {
    setStudentId(value);
    setSubjectId("");

    setCurrentExam(null);
    setQuestions([]);
    setBulkText("");

    setMessage("");
    setError("");
  }

  /* =========================================================
     PARSER
  ========================================================= */

  function parseBulkQuestions(
    text: string
  ): ParsedQuestion[] {
    const cleaned = text
      .replace(/\r\n/g, "\n")
      .trim();

    if (!cleaned) {
      return [];
    }

    const blocks = cleaned.split(
      /(?=^\s*\d+\s*[.)]\s*)/gm
    );

    const parsed: ParsedQuestion[] = [];

    for (const rawBlock of blocks) {
      const block = rawBlock.trim();

      if (!block) continue;

      const questionMatch = block.match(
        /^\s*(\d+)\s*[.)]\s*([\s\S]+)$/
      );

      if (!questionMatch) {
        continue;
      }

      let content =
        questionMatch[2].trim();

      /* =====================================================
         MARKS
      ===================================================== */

      let marks = 1;

      const marksMatch = content.match(
        /\n?\s*Marks?\s*:\s*(\d+)\s*$/i
      );

      if (marksMatch) {
        marks = Number(marksMatch[1]);

        content = content
          .replace(
            /\n?\s*Marks?\s*:\s*\d+\s*$/i,
            ""
          )
          .trim();
      }

      /* =====================================================
         EXPLANATION
      ===================================================== */

      let explanation: string | null = null;

      const explanationMatch =
        content.match(
          /\n\s*Explanation\s*:\s*([\s\S]*?)(?=\n\s*(?:Answer|Marks)\s*:|$)/i
        );

      if (explanationMatch) {
        explanation =
          explanationMatch[1].trim();

        content = content
          .replace(
            explanationMatch[0],
            ""
          )
          .trim();
      }

      /* =====================================================
         ANSWER
      ===================================================== */

      let answer: string | null = null;

      const answerMatch = content.match(
        /\n?\s*Answer\s*:\s*([\s\S]*?)$/i
      );

      if (answerMatch) {
        answer =
          answerMatch[1].trim();

        content = content
          .replace(
            answerMatch[0],
            ""
          )
          .trim();
      }

      /* =====================================================
         OPTIONS
      ===================================================== */

      const optionMatches = [
        ...content.matchAll(
          /^\s*([A-D])[.)]\s*(.+)$/gm
        ),
      ];

      const options: Record<
        string,
        string
      > = {};

      optionMatches.forEach((match) => {
        options[match[1]] =
          match[2].trim();
      });

      const hasOptions =
        Object.keys(options).length >= 2;

      if (hasOptions) {
        content = content
          .replace(
            /^\s*[A-D][.)]\s*.+$/gm,
            ""
          )
          .trim();
      }

      /* =====================================================
         TYPE
      ===================================================== */

      let questionType:
        | "multiple_choice"
        | "short_answer";

      if (hasOptions) {
        questionType =
          "multiple_choice";

        if (answer) {
          const letterMatch =
            answer.match(
              /^([A-D])(?:[.)]|\s|$)/i
            );

          if (letterMatch) {
            answer =
              letterMatch[1].toUpperCase();
          }
        }
      } else {
        questionType =
          "short_answer";
      }

      parsed.push({
        question_text: content,
        question_type: questionType,
        expected_answer: answer,
        marks,
        explanation,
        options: hasOptions
          ? options
          : null,
      });
    }

    return parsed;
  }

  /* =========================================================
     PREVIEW QUESTIONS
  ========================================================= */

  function parseQuestions() {
    try {
      setParsing(true);
      setError("");
      setMessage("");

      const parsed =
        parseBulkQuestions(bulkText);

      if (parsed.length === 0) {
        throw new Error(
          "No questions could be detected. Make sure each question starts with a number such as 1. or 2."
        );
      }

      setQuestions(parsed);

      setMessage(
        `${parsed.length} question${
          parsed.length === 1
            ? ""
            : "s"
        } detected. Review them below before saving.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to parse questions."
      );
    } finally {
      setParsing(false);
    }
  }

  /* =========================================================
     UPDATE QUESTION
  ========================================================= */

  function updateQuestion(
    index: number,
    field: keyof ParsedQuestion,
    value: any
  ) {
    setQuestions((current) =>
      current.map((question, i) =>
        i === index
          ? {
              ...question,
              [field]: value,
            }
          : question
      )
    );
  }

  /* =========================================================
     UPDATE OPTION
  ========================================================= */

  function updateOption(
    questionIndex: number,
    optionKey: string,
    value: string
  ) {
    setQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        return {
          ...question,
          options: {
            ...(question.options || {}),
            [optionKey]: value,
          },
        };
      })
    );
  }

  /* =========================================================
     DELETE QUESTION
  ========================================================= */

  function deleteQuestion(index: number) {
    setQuestions((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  }

  /* =========================================================
     ADD QUESTION
  ========================================================= */

  function addQuestion() {
    setQuestions((current) => [
      ...current,
      {
        question_text: "",
        question_type:
          "multiple_choice",
        expected_answer: "",
        marks: 1,
        explanation: "",
        options: {
          A: "",
          B: "",
          C: "",
          D: "",
        },
      },
    ]);
  }

  /* =========================================================
     TOTAL MARKS
  ========================================================= */

  const totalMarks = useMemo(() => {
    return questions.reduce(
      (total, question) =>
        total +
        Number(question.marks || 0),
      0
    );
  }, [questions]);

  /* =========================================================
     CREATE MOCK
  ========================================================= */

  async function createMock() {
    try {
      setError("");
      setMessage("");

      if (!studentId) {
        throw new Error(
          "Select a student first."
        );
      }

      if (!subjectId) {
        throw new Error(
          "Select a subject."
        );
      }

      if (!title.trim()) {
        throw new Error(
          "Enter a mock title."
        );
      }

      const duration =
        Number(durationMinutes);

      if (
        !Number.isInteger(duration) ||
        duration <= 0
      ) {
        throw new Error(
          "Please select a valid examination duration."
        );
      }

      const {
        data: exam,
        error: examError,
      } = await supabase
        .from("mock_exams")
        .insert({
          title: title.trim(),
          description:
            description.trim() ||
            null,
          subject_id: subjectId,
          duration_minutes: duration,
          status: "draft",
        })
        .select()
        .single();

      if (examError || !exam) {
        throw new Error(
          examError?.message ||
            "Unable to create mock exam."
        );
      }

      const {
        error: assignmentError,
      } = await supabase
        .from("mock_student_exams")
        .insert({
          exam_id: exam.id,
          student_id: studentId,
          status: "assigned",
        });

      if (assignmentError) {
        throw new Error(
          assignmentError.message
        );
      }

      setCurrentExam(exam);

      setMessage(
        "Mock created. You can now paste and review the questions."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create mock."
      );
    }
  }

  /* =========================================================
     SAVE QUESTIONS
  ========================================================= */

  async function saveQuestions() {
    try {
      setSavingQuestions(true);
      setError("");
      setMessage("");

      if (!currentExam) {
        throw new Error(
          "Create the mock examination first."
        );
      }

      if (questions.length === 0) {
        throw new Error(
          "There are no questions to save."
        );
      }

      for (const question of questions) {
        if (
          !question.question_text.trim()
        ) {
          throw new Error(
            "Every question must have question text."
          );
        }

        if (
          !Number.isInteger(
            Number(question.marks)
          ) ||
          Number(question.marks) <= 0
        ) {
          throw new Error(
            "Every question must have valid marks."
          );
        }

        if (
          question.question_type ===
          "multiple_choice"
        ) {
          const options =
            question.options || {};

          if (
            !options.A?.trim() ||
            !options.B?.trim()
          ) {
            throw new Error(
              "Multiple-choice questions must have at least options A and B."
            );
          }

          if (
            !question.expected_answer?.trim()
          ) {
            throw new Error(
              "Every multiple-choice question must have a correct answer."
            );
          }
        }

        if (
          question.question_type ===
            "short_answer" &&
          !question.expected_answer?.trim()
        ) {
          throw new Error(
            "Every short-answer question must have an expected answer."
          );
        }
      }

      /* =====================================================
         REMOVE OLD QUESTIONS
      ===================================================== */

      const {
        error: deleteError,
      } = await supabase
        .from("mock_questions")
        .delete()
        .eq(
          "exam_id",
          currentExam.id
        );

      if (deleteError) {
        throw new Error(
          deleteError.message
        );
      }

      /* =====================================================
         INSERT REVIEWED QUESTIONS
      ===================================================== */

      const rows =
        questions.map((question) => ({
          exam_id: currentExam.id,
          question_text:
            question.question_text.trim(),
          question_type:
            question.question_type,
          expected_answer:
            question.expected_answer?.trim() ||
            null,
          marks: Number(
            question.marks
          ),
          explanation:
            question.explanation?.trim() ||
            null,
          options:
            question.question_type ===
            "multiple_choice"
              ? question.options
              : null,
        }));

      const {
        error: insertError,
      } = await supabase
        .from("mock_questions")
        .insert(rows);

      if (insertError) {
        throw new Error(
          insertError.message
        );
      }

      setMessage(
        `${questions.length} question${
          questions.length === 1
            ? ""
            : "s"
        } saved successfully.`
      );
    } catch (err) {
      console.error(
        "SAVE QUESTIONS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save questions."
      );
    } finally {
      setSavingQuestions(false);
    }
  }

  /* =========================================================
     PUBLISH
  ========================================================= */

  async function publishMock() {
    try {
      setPublishing(true);
      setError("");
      setMessage("");

      if (!currentExam) {
        throw new Error(
          "Create a mock first."
        );
      }

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
        data: savedQuestions,
        error: questionsError,
      } = await supabase
        .from("mock_questions")
        .select("id")
        .eq(
          "exam_id",
          currentExam.id
        );

      if (questionsError) {
        throw new Error(
          questionsError.message
        );
      }

      if (
        !savedQuestions ||
        savedQuestions.length === 0
      ) {
        throw new Error(
          "You cannot publish this mock because no questions have been saved."
        );
      }

      /* =====================================================
         MAKE SURE ASSIGNMENT EXISTS
      ===================================================== */

      const {
        data: assignment,
        error: assignmentError,
      } = await supabase
        .from("mock_student_exams")
        .select("id")
        .eq(
          "exam_id",
          currentExam.id
        )
        .maybeSingle();

      if (assignmentError) {
        throw new Error(
          assignmentError.message
        );
      }

      if (assignment) {
        const {
          error: updateAssignmentError,
        } = await supabase
          .from("mock_student_exams")
          .update({
            student_id: studentId,
            status: "assigned",
          })
          .eq(
            "id",
            assignment.id
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
            exam_id:
              currentExam.id,
            student_id: studentId,
            status: "assigned",
          });

        if (insertAssignmentError) {
          throw new Error(
            insertAssignmentError.message
          );
        }
      }

      /* =====================================================
         PUBLISH
      ===================================================== */

      const {
        error: publishError,
      } = await supabase
        .from("mock_exams")
        .update({
          subject_id: subjectId,
          status: "published",
        })
        .eq(
          "id",
          currentExam.id
        );

      if (publishError) {
        throw new Error(
          publishError.message
        );
      }

      setCurrentExam((current) =>
        current
          ? {
              ...current,
              subject_id: subjectId,
              status: "published",
            }
          : current
      );

      setMessage(
        "Mock published successfully. The selected student can now receive this examination."
      );
    } catch (err) {
      console.error(
        "PUBLISH MOCK ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to publish mock."
      );
    } finally {
      setPublishing(false);
    }
  }

  /* =========================================================
     LOAD PUBLISHED MOCKS
  ========================================================= */

  async function loadPublishedMocks() {
    try {
      setLoadingPublished(true);
      setError("");
      setMessage("");

      setSelectedPublishedMock(null);
      setViewerQuestions([]);

      if (!viewerStudentId) {
        setPublishedMocks([]);
        return;
      }

      if (!viewerSubjectId) {
        setPublishedMocks([]);
        return;
      }

      /*
        Find exams assigned to this student.
        Then only keep published exams belonging
        to the selected subject.
      */

      const {
        data: assignments,
        error: assignmentError,
      } = await supabase
        .from("mock_student_exams")
        .select("exam_id")
        .eq(
          "student_id",
          viewerStudentId
        );

      if (assignmentError) {
        throw new Error(
          assignmentError.message
        );
      }

      const examIds =
        (assignments || []).map(
          (item) => item.exam_id
        );

      if (examIds.length === 0) {
        setPublishedMocks([]);
        return;
      }

      const {
        data: exams,
        error: examsError,
      } = await supabase
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
        .in("id", examIds)
        .eq(
          "subject_id",
          viewerSubjectId
        )
        .eq(
          "status",
          "published"
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (examsError) {
        throw new Error(
          examsError.message
        );
      }

      const subjectName =
        subjects.find(
          (subject) =>
            subject.id ===
            viewerSubjectId
        )?.name || "Subject";

      const result =
        (exams || []).map(
          (exam) => ({
            ...(exam as MockExam),
            subject_name:
              subjectName,
          })
        );

      setPublishedMocks(result);

      if (result.length === 0) {
        setMessage(
          "No published mock has been assigned to this student for the selected subject."
        );
      }
    } catch (err) {
      console.error(
        "LOAD PUBLISHED MOCKS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load published mocks."
      );
    } finally {
      setLoadingPublished(false);
    }
  }

  /* =========================================================
     VIEW PUBLISHED MOCK
  ========================================================= */

  async function viewPublishedMock(
    mock: PublishedMock
  ) {
    try {
      setSelectedPublishedMock(mock);
      setLoadingViewerQuestions(true);
      setError("");

      const {
        data,
        error: questionsError,
      } = await supabase
        .from("mock_questions")
        .select(
          `
            id,
            question_text,
            question_type,
            expected_answer,
            marks,
            explanation,
            options
          `
        )
        .eq(
          "exam_id",
          mock.id
        )
        .order("created_at");

      if (questionsError) {
        throw new Error(
          questionsError.message
        );
      }

      setViewerQuestions(
        (data || []) as ViewQuestion[]
      );
    } catch (err) {
      console.error(
        "VIEW PUBLISHED MOCK ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load published questions."
      );
    } finally {
      setLoadingViewerQuestions(false);
    }
  }

  /* =========================================================
     VIEWER STUDENT CHANGE
  ========================================================= */

  function handleViewerStudentChange(
    value: string
  ) {
    setViewerStudentId(value);
    setViewerSubjectId("");
    setPublishedMocks([]);
    setSelectedPublishedMock(null);
    setViewerQuestions([]);
    setError("");
    setMessage("");
  }

  /* =========================================================
     VIEWER SUBJECT CHANGE
  ========================================================= */

  function handleViewerSubjectChange(
    value: string
  ) {
    setViewerSubjectId(value);
    setPublishedMocks([]);
    setSelectedPublishedMock(null);
    setViewerQuestions([]);
    setError("");
    setMessage("");
  }

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="font-semibold text-slate-700">
          Loading Monthly Mock...
        </p>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="mx-auto max-w-7xl pb-16">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <p className="font-bold uppercase tracking-[0.2em] text-yellow-600">
            GS Academy Assessment
          </p>

          <h1 className="mt-3 text-4xl font-extrabold text-slate-900">
            Monthly Mock
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            Prepare, publish and verify student mock
            examinations from one place.
          </p>
        </div>

        {/* TOP VIEW PUBLISHED BUTTON */}

        <button
          type="button"
          onClick={() => {
            setMode(
              mode === "published"
                ? "create"
                : "published"
            );

            setError("");
            setMessage("");
          }}
          className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-800"
        >
          {mode === "published"
            ? "← Prepare New Mock"
            : "View Published Mocks"}
        </button>
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
          PUBLISHED MOCK VIEWER
      ===================================================== */}

      {mode === "published" && (
        <section className="mt-10">

          {/* SELECT STUDENT + SUBJECT */}

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

            <div className="flex h-1 w-16 rounded-full bg-yellow-500" />

            <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
              View Published Mock
            </h2>

            <p className="mt-2 max-w-3xl text-slate-600">
              Select a student and one of their registered
              subjects. Published mocks already assigned to
              that student will appear below exactly as
              they are available to the student.
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">

              {/* STUDENT */}

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Student
                </label>

                <select
                  value={viewerStudentId}
                  onChange={(e) =>
                    handleViewerStudentChange(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900"
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
              </div>

              {/* SUBJECT */}

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Subject
                </label>

                <select
                  value={viewerSubjectId}
                  onChange={(e) =>
                    handleViewerSubjectChange(
                      e.target.value
                    )
                  }
                  disabled={
                    !viewerStudentId ||
                    viewerRegisteredSubjects.length ===
                      0
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 disabled:bg-slate-100"
                >
                  <option value="">
                    {!viewerStudentId
                      ? "Select student first"
                      : "Select subject"}
                  </option>

                  {viewerRegisteredSubjects.map(
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
              </div>
            </div>

            {/* LOAD */}

            <button
              type="button"
              onClick={loadPublishedMocks}
              disabled={
                loadingPublished ||
                !viewerStudentId ||
                !viewerSubjectId
              }
              className="mt-7 rounded-xl bg-yellow-500 px-7 py-3 font-bold text-slate-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingPublished
                ? "Checking Published Mocks..."
                : "Show Published Mocks"}
            </button>
          </div>

          {/* =================================================
              PUBLISHED MOCK LIST
          ================================================= */}

          {publishedMocks.length > 0 && (
            <div className="mt-8">

              <div className="mb-5">
                <p className="text-sm font-bold uppercase tracking-wide text-yellow-600">
                  Published
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Mocks for{" "}
                  {viewerStudent?.full_name}
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {publishedMocks.map(
                  (mock) => (
                    <button
                      type="button"
                      key={mock.id}
                      onClick={() =>
                        viewPublishedMock(
                          mock
                        )
                      }
                      className={`text-left rounded-3xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                        selectedPublishedMock?.id ===
                        mock.id
                          ? "border-yellow-500 ring-2 ring-yellow-200"
                          : "border-slate-200"
                      }`}
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-green-600">
                            Published
                          </p>

                          <h3 className="mt-2 text-xl font-extrabold text-slate-900">
                            {mock.title}
                          </h3>
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          {mock.duration_minutes ||
                            0}{" "}
                          min
                        </span>

                      </div>

                      {mock.description && (
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                          {mock.description}
                        </p>
                      )}

                      <p className="mt-5 text-sm font-bold text-slate-500">
                        {mock.subject_name}
                      </p>

                      <p className="mt-3 font-bold text-yellow-600">
                        View as student →
                      </p>

                    </button>
                  )
                )}

              </div>
            </div>
          )}

          {/* =================================================
              STUDENT-SIDE PREVIEW
          ================================================= */}

          {selectedPublishedMock && (
            <section className="mt-10">

              <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
                      Student Preview
                    </p>

                    <h2 className="mt-3 text-3xl font-extrabold">
                      {selectedPublishedMock.title}
                    </h2>

                    <p className="mt-3 text-slate-300">
                      {selectedPublishedMock.subject_name}
                      {" • "}
                      {selectedPublishedMock.duration_minutes ||
                        0}{" "}
                      minutes
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 px-6 py-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Student
                    </p>

                    <p className="mt-1 font-extrabold text-yellow-400">
                      {viewerStudent?.full_name}
                    </p>
                  </div>

                </div>

              </div>

              {loadingViewerQuestions ? (
                <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
                  <p className="font-semibold text-slate-600">
                    Loading student view...
                  </p>
                </div>
              ) : (
                <div className="mt-8 space-y-6">

                  {viewerQuestions.map(
                    (question, index) => (
                      <article
                        key={question.id}
                        className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                      >

                        <div className="flex items-start gap-4">

                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 font-extrabold text-white">
                            {index + 1}
                          </span>

                          <div className="flex-1">

                            <div className="flex flex-wrap items-center gap-3">

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  question.question_type ===
                                  "multiple_choice"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {question.question_type ===
                                "multiple_choice"
                                  ? "Multiple Choice"
                                  : "Short Answer"}
                              </span>

                              <span className="text-sm font-bold text-slate-500">
                                {question.marks}{" "}
                                mark
                                {question.marks ===
                                1
                                  ? ""
                                  : "s"}
                              </span>

                            </div>

                            <p className="mt-5 whitespace-pre-wrap text-lg font-semibold leading-8 text-slate-900">
                              {question.question_text}
                            </p>

                            {/* OPTIONS */}

                            {question.question_type ===
                              "multiple_choice" &&
                              question.options && (
                                <div className="mt-6 grid gap-3">

                                  {Object.entries(
                                    question.options
                                  ).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className="flex items-start gap-3 rounded-xl border border-slate-200 p-4"
                                      >
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-700">
                                          {key}
                                        </span>

                                        <span className="pt-1 text-slate-800">
                                          {value}
                                        </span>
                                      </div>
                                    )
                                  )}

                                </div>
                              )}

                            {/* SHORT ANSWER AREA */}

                            {question.question_type ===
                              "short_answer" && (
                                <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5">

                                  <p className="text-sm font-semibold text-slate-400">
                                    Student answer
                                  </p>

                                  <div className="mt-4 h-20" />

                                </div>
                              )}

                          </div>

                        </div>

                      </article>
                    )
                  )}

                </div>
              )}

              {/* CONFIRMATION */}

              {!loadingViewerQuestions &&
                viewerQuestions.length > 0 && (
                  <div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-8">

                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Confirmation
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold text-slate-900">
                      This is what the student will see.
                    </h3>

                    <p className="mt-3 max-w-3xl leading-7 text-slate-700">
                      Student:{" "}
                      <strong>
                        {viewerStudent?.full_name}
                      </strong>
                      {" • "}
                      Subject:{" "}
                      <strong>
                        {
                          selectedPublishedMock.subject_name
                        }
                      </strong>
                      {" • "}
                      Questions:{" "}
                      <strong>
                        {viewerQuestions.length}
                      </strong>
                      {" • "}
                      Total marks:{" "}
                      <strong>
                        {viewerQuestions.reduce(
                          (total, question) =>
                            total +
                            Number(
                              question.marks ||
                                0
                            ),
                          0
                        )}
                      </strong>
                    </p>

                  </div>
                )}

            </section>
          )}

        </section>
      )}

      {/* =====================================================
          CREATE MODE
      ===================================================== */}

      {mode === "create" && (
        <section className="mt-10">

          {/* =================================================
              STEP 1 — STUDENT + SUBJECT
          ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500 font-black text-slate-900">
                1
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-yellow-600">
                  Prepare
                </p>

                <h2 className="text-2xl font-extrabold text-slate-900">
                  Student & Subject
                </h2>
              </div>

            </div>

            <p className="mt-4 max-w-3xl text-slate-600">
              Select the student first. The subject list will
              intelligently show only subjects registered by
              that student.
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">

              {/* STUDENT */}

              <div>

                <label className="text-sm font-bold text-slate-700">
                  Student
                </label>

                <select
                  value={studentId}
                  onChange={(e) =>
                    handleCreateStudentChange(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
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

              </div>

              {/* SUBJECT */}

              <div>

                <label className="text-sm font-bold text-slate-700">
                  Subject
                </label>

                <select
                  value={subjectId}
                  onChange={(e) =>
                    setSubjectId(
                      e.target.value
                    )
                  }
                  disabled={
                    !studentId ||
                    registeredSubjects.length ===
                      0
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 disabled:bg-slate-100"
                >

                  <option value="">
                    {!studentId
                      ? "Select student first"
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
                    <p className="mt-3 text-sm font-semibold text-red-600">
                      No registered subjects found
                      for this student.
                    </p>
                  )}

              </div>

            </div>

          </section>

          {/* =================================================
              STEP 2 — MOCK DETAILS
          ================================================= */}

          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-black text-white">
                2
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-yellow-600">
                  Examination
                </p>

                <h2 className="text-2xl font-extrabold text-slate-900">
                  Mock Details
                </h2>
              </div>

            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">

              {/* TITLE */}

              <div>

                <label className="text-sm font-bold text-slate-700">
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

              <div>

                <label className="text-sm font-bold text-slate-700">
                  Examination Duration
                </label>

                <select
                  value={durationMinutes}
                  onChange={(e) =>
                    setDurationMinutes(
                      e.target.value
                    )
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

              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="mt-6">

              <label className="text-sm font-bold text-slate-700">
                Instructions
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Optional instructions for the student"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />

            </div>

            {/* CREATE */}

            {!currentExam && (
              <button
                type="button"
                onClick={createMock}
                disabled={
                  !studentId ||
                  !subjectId ||
                  !title.trim()
                }
                className="mt-7 rounded-xl bg-slate-900 px-7 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create Mock & Continue
              </button>
            )}

            {/* CURRENT MOCK */}

            {currentExam && (
              <div className="mt-7 rounded-2xl bg-green-50 p-5">

                <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                  Draft Created
                </p>

                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  {currentExam.title}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  {selectedStudent?.full_name}
                  {" • "}
                  {
                    subjects.find(
                      (subject) =>
                        subject.id ===
                        subjectId
                    )?.name
                  }
                </p>

              </div>
            )}

          </section>

          {/* =================================================
              STEP 3 — QUESTIONS
          ================================================= */}

          {currentExam && (
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                <div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-black text-white">
                      3
                    </div>

                    <h2 className="text-2xl font-extrabold text-slate-900">
                      Questions
                    </h2>

                  </div>

                  <p className="mt-3 max-w-3xl text-slate-600">
                    Paste the entire question set. The system
                    will intelligently detect multiple-choice
                    and short-answer questions.
                  </p>

                </div>

                <div className="flex gap-3">

                  <div className="rounded-xl bg-slate-900 px-5 py-3 text-center text-white">
                    <p className="text-xs uppercase text-slate-400">
                      Questions
                    </p>

                    <p className="text-xl font-extrabold">
                      {questions.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-yellow-500 px-5 py-3 text-center text-slate-900">
                    <p className="text-xs uppercase">
                      Marks
                    </p>

                    <p className="text-xl font-extrabold">
                      {totalMarks}
                    </p>
                  </div>

                </div>

              </div>

              {/* EXAMPLE */}

              <div className="mt-7 rounded-2xl bg-slate-950 p-6 text-sm leading-7 text-slate-300">

                <p className="font-bold text-yellow-400">
                  Example format
                </p>

                <pre className="mt-4 whitespace-pre-wrap font-mono">
{`1. What is 25% of 200?

A. 25
B. 40
C. 50
D. 75

Answer: C
Marks: 2
Explanation: 25% of 200 is 50.

2. Explain why the angles in a triangle
add up to 180 degrees.

Answer: The interior angles of a triangle
sum to 180 degrees.

Marks: 3`}
                </pre>

              </div>

              <textarea
                value={bulkText}
                onChange={(e) =>
                  setBulkText(
                    e.target.value
                  )
                }
                placeholder="Paste your complete question set here..."
                className="mt-6 min-h-[300px] w-full rounded-2xl border border-slate-300 bg-slate-50 p-5 font-mono text-sm leading-7 text-slate-900"
              />

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={parseQuestions}
                  disabled={
                    parsing ||
                    !bulkText.trim()
                  }
                  className="rounded-xl bg-slate-900 px-7 py-3 font-bold text-white disabled:opacity-50"
                >
                  {parsing
                    ? "Reading Questions..."
                    : "Preview Questions"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setBulkText("")
                  }
                  className="rounded-xl border border-slate-300 px-7 py-3 font-bold text-slate-700"
                >
                  Clear
                </button>

              </div>

            </section>
          )}

          {/* =================================================
              STEP 4 — REVIEW
          ================================================= */}

          {currentExam &&
            questions.length > 0 && (
              <section className="mt-8">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500 font-black text-slate-900">
                        4
                      </div>

                      <h2 className="text-2xl font-extrabold text-slate-900">
                        Review Questions
                      </h2>

                    </div>

                    <p className="mt-3 text-slate-600">
                      This is your final editing stage before
                      the questions are saved.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={addQuestion}
                    className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-900"
                  >
                    + Add Question
                  </button>

                </div>

                <div className="mt-7 space-y-6">

                  {questions.map(
                    (
                      question,
                      index
                    ) => (
                      <article
                        key={index}
                        className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                      >

                        <div className="flex items-center justify-between gap-4">

                          <div className="flex items-center gap-3">

                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-extrabold text-white">
                              {index + 1}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                question.question_type ===
                                "multiple_choice"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {question.question_type ===
                              "multiple_choice"
                                ? "Multiple Choice"
                                : "Short Answer"}
                            </span>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              deleteQuestion(
                                index
                              )
                            }
                            className="text-sm font-bold text-red-600"
                          >
                            Remove
                          </button>

                        </div>

                        <div className="mt-6 grid gap-5 md:grid-cols-[1fr_180px]">

                          <div>

                            <label className="text-sm font-bold text-slate-700">
                              Question
                            </label>

                            <textarea
                              value={
                                question.question_text
                              }
                              onChange={(e) =>
                                updateQuestion(
                                  index,
                                  "question_text",
                                  e.target.value
                                )
                              }
                              rows={4}
                              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                            />

                          </div>

                          <div>

                            <label className="text-sm font-bold text-slate-700">
                              Question Type
                            </label>

                            <select
                              value={
                                question.question_type
                              }
                              onChange={(e) =>
                                updateQuestion(
                                  index,
                                  "question_type",
                                  e.target.value
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                            >

                              <option value="multiple_choice">
                                Multiple Choice
                              </option>

                              <option value="short_answer">
                                Short Answer
                              </option>

                            </select>

                            <label className="mt-5 block text-sm font-bold text-slate-700">
                              Marks
                            </label>

                            <input
                              type="number"
                              min="1"
                              value={
                                question.marks
                              }
                              onChange={(e) =>
                                updateQuestion(
                                  index,
                                  "marks",
                                  Number(
                                    e.target.value
                                  )
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                            />

                          </div>

                        </div>

                        {/* OPTIONS */}

                        {question.question_type ===
                          "multiple_choice" && (
                          <div className="mt-6">

                            <label className="text-sm font-bold text-slate-700">
                              Answer Options
                            </label>

                            <div className="mt-3 grid gap-4 md:grid-cols-2">

                              {[
                                "A",
                                "B",
                                "C",
                                "D",
                              ].map(
                                (option) => (
                                  <div
                                    key={option}
                                    className="flex items-center gap-3"
                                  >

                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 font-bold text-white">
                                      {option}
                                    </span>

                                    <input
                                      value={
                                        question.options?.[
                                          option
                                        ] || ""
                                      }
                                      onChange={(e) =>
                                        updateOption(
                                          index,
                                          option,
                                          e.target.value
                                        )
                                      }
                                      placeholder={`Option ${option}`}
                                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                                    />

                                  </div>
                                )
                              )}

                            </div>

                          </div>
                        )}

                        {/* EXPECTED ANSWER */}

                        <div className="mt-6">

                          <label className="text-sm font-bold text-slate-700">
                            {question.question_type ===
                            "multiple_choice"
                              ? "Correct Answer"
                              : "Expected Answer"}
                          </label>

                          {question.question_type ===
                          "multiple_choice" ? (
                            <select
                              value={
                                question.expected_answer ||
                                ""
                              }
                              onChange={(e) =>
                                updateQuestion(
                                  index,
                                  "expected_answer",
                                  e.target.value
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                            >

                              <option value="">
                                Select correct answer
                              </option>

                              <option value="A">
                                A
                              </option>

                              <option value="B">
                                B
                              </option>

                              <option value="C">
                                C
                              </option>

                              <option value="D">
                                D
                              </option>

                            </select>
                          ) : (
                            <textarea
                              value={
                                question.expected_answer ||
                                ""
                              }
                              onChange={(e) =>
                                updateQuestion(
                                  index,
                                  "expected_answer",
                                  e.target.value
                                )
                              }
                              rows={3}
                              placeholder="Enter the expected short-text answer..."
                              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                            />
                          )}

                        </div>

                        {/* EXPLANATION */}

                        <div className="mt-6">

                          <label className="text-sm font-bold text-slate-700">
                            Explanation / Solution
                          </label>

                          <textarea
                            value={
                              question.explanation ||
                              ""
                            }
                            onChange={(e) =>
                              updateQuestion(
                                index,
                                "explanation",
                                e.target.value
                              )
                            }
                            rows={3}
                            placeholder="Optional explanation or solution..."
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                          />

                        </div>

                      </article>
                    )
                  )}

                </div>

                {/* SAVE */}

                <div className="mt-8 rounded-3xl bg-slate-900 p-8 text-white">

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                      <p className="text-sm font-bold uppercase tracking-wide text-yellow-400">
                        Ready to save
                      </p>

                      <h2 className="mt-2 text-2xl font-extrabold">
                        {questions.length} Questions •{" "}
                        {totalMarks} Marks
                      </h2>

                      <p className="mt-2 text-slate-300">
                        Save the reviewed question set before
                        publishing.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={saveQuestions}
                      disabled={
                        savingQuestions
                      }
                      className="rounded-xl bg-yellow-500 px-8 py-4 font-extrabold text-slate-900 disabled:opacity-50"
                    >
                      {savingQuestions
                        ? "Saving Questions..."
                        : "Save Questions"}
                    </button>

                  </div>

                </div>

              </section>
            )}

          {/* =================================================
              STEP 5 — FINAL PUBLISH
          ================================================= */}

          {currentExam &&
            questions.length > 0 && (
              <section className="mt-8 mb-10 rounded-3xl border border-green-200 bg-green-50 p-8">

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                  <div>

                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Final Confirmation
                    </p>

                    <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                      Ready to publish?
                    </h2>

                    <p className="mt-3 max-w-3xl leading-7 text-slate-700">

                      <strong>
                        Student:
                      </strong>{" "}
                      {selectedStudent?.full_name}

                      {" • "}

                      <strong>
                        Subject:
                      </strong>{" "}
                      {
                        subjects.find(
                          (subject) =>
                            subject.id ===
                            subjectId
                        )?.name
                      }

                      {" • "}

                      <strong>
                        Questions:
                      </strong>{" "}
                      {questions.length}

                      {" • "}

                      <strong>
                        Marks:
                      </strong>{" "}
                      {totalMarks}

                    </p>

                    <p className="mt-3 text-sm font-semibold text-green-700">
                      Publishing will make this mock available
                      to the selected student under this subject.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={publishMock}
                    disabled={
                      publishing ||
                      currentExam.status ===
                        "published"
                    }
                    className="rounded-xl bg-green-600 px-8 py-4 font-extrabold text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    {publishing
                      ? "Publishing..."
                      : currentExam.status ===
                        "published"
                      ? "Published"
                      : "Publish Mock"}
                  </button>

                </div>

              </section>
            )}

        </section>
      )}

    </main>
  );
}