"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MockExam = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  status: string | null;
  subject_id: string | null;
};

type Subject = {
  id: string;
  name: string;
};

type ParsedQuestion = {
  question_text: string;
  question_type: "multiple_choice" | "short_answer";
  expected_answer: string | null;
  marks: number;
  explanation: string | null;
  options: Record<string, string> | null;
};

export default function ManageQuestionsPage() {
  const params = useParams();
  const router = useRouter();

  const examId = params.id as string;

  const [mock, setMock] = useState<MockExam | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);

  const [questions, setQuestions] = useState<
    ParsedQuestion[]
  >([]);

  const [bulkText, setBulkText] = useState("");

  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =========================================================
     LOAD MOCK
  ========================================================= */

  useEffect(() => {
    async function loadMock() {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const {
          data: mockData,
          error: mockError,
        } = await supabase
          .from("mock_exams")
          .select(`
            id,
            title,
            description,
            duration_minutes,
            status,
            subject_id
          `)
          .eq("id", examId)
          .single();

        if (mockError || !mockData) {
          throw new Error(
            mockError?.message ||
              "Mock examination not found."
          );
        }

        setMock(mockData);

        if (mockData.subject_id) {
          const {
            data: subjectData,
            error: subjectError,
          } = await supabase
            .from("subjects")
            .select("id, name")
            .eq(
              "id",
              mockData.subject_id
            )
            .single();

          if (subjectError) {
            throw new Error(
              subjectError.message
            );
          }

          setSubject(subjectData);
        }

        /* =====================================================
           LOAD EXISTING QUESTIONS
        ===================================================== */

        const {
          data: existingQuestions,
          error: questionsError,
        } = await supabase
          .from("mock_questions")
          .select(`
            question_text,
            question_type,
            expected_answer,
            marks,
            explanation,
            options
          `)
          .eq("exam_id", examId)
          .order("created_at");

        if (questionsError) {
          throw new Error(
            questionsError.message
          );
        }

        setQuestions(
          (existingQuestions || []).map(
            (question) => ({
              question_text:
                question.question_text,
              question_type:
                question.question_type ===
                "multiple_choice"
                  ? "multiple_choice"
                  : "short_answer",
              expected_answer:
                question.expected_answer,
              marks:
                question.marks || 1,
              explanation:
                question.explanation,
              options:
                question.options,
            })
          )
        );
      } catch (err) {
        console.error(
          "MANAGE QUESTIONS ERROR:",
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
      loadMock();
    }
  }, [examId]);

  /* =========================================================
     PARSER
  ========================================================= */

  function parseBulkQuestions(
    text: string
  ): ParsedQuestion[] {
    const cleaned =
      text
        .replace(/\r\n/g, "\n")
        .trim();

    if (!cleaned) {
      return [];
    }

    /*
      Questions are expected to begin with:

      1.
      2.
      3)

      etc.
    */

    const blocks =
      cleaned.split(
        /(?=^\s*\d+\s*[\.\)]\s*)/gm
      );

    const parsed: ParsedQuestion[] = [];

    for (const rawBlock of blocks) {
      const block =
        rawBlock.trim();

      if (!block) continue;

      const questionMatch =
        block.match(
          /^\s*(\d+)\s*[\.\)]\s*([\s\S]+)$/
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

      const marksMatch =
        content.match(
          /\n?\s*Marks?\s*:\s*(\d+)\s*$/i
        );

      if (marksMatch) {
        marks = Number(
          marksMatch[1]
        );

        content =
          content
            .replace(
              /\n?\s*Marks?\s*:\s*\d+\s*$/i,
              ""
            )
            .trim();
      }

      /* =====================================================
         EXPLANATION
      ===================================================== */

      let explanation:
        | string
        | null = null;

      const explanationMatch =
        content.match(
          /\n\s*Explanation\s*:\s*([\s\S]*?)(?=\n\s*(?:Answer|Marks)\s*:|$)/i
        );

      if (explanationMatch) {
        explanation =
          explanationMatch[1].trim();

        content =
          content
            .replace(
              explanationMatch[0],
              ""
            )
            .trim();
      }

      /* =====================================================
         ANSWER
      ===================================================== */

      let answer:
        | string
        | null = null;

      const answerMatch =
        content.match(
          /\n?\s*Answer\s*:\s*([\s\S]*?)$/i
        );

      if (answerMatch) {
        answer =
          answerMatch[1].trim();

        content =
          content
            .replace(
              answerMatch[0],
              ""
            )
            .trim();
      }

      /* =====================================================
         OPTIONS
      ===================================================== */

      const optionMatches =
        [
          ...content.matchAll(
            /^\s*([A-D])[\.\)]\s*(.+)$/gm
          ),
        ];

      const options: Record<
        string,
        string
      > = {};

      optionMatches.forEach(
        (match) => {
          options[match[1]] =
            match[2].trim();
        }
      );

      const hasOptions =
        Object.keys(options)
          .length >= 2;

      /* Remove options from question text */

      if (hasOptions) {
        content =
          content
            .replace(
              /^\s*[A-D][\.\)]\s*.+$/gm,
              ""
            )
            .trim();
      }

      /* =====================================================
         DETERMINE TYPE
      ===================================================== */

      let questionType:
        | "multiple_choice"
        | "short_answer";

      if (hasOptions) {
        questionType =
          "multiple_choice";

        /*
          If answer is C, store C.
          If answer is "C. 50", also extract C.
        */

        if (answer) {
          const letterMatch =
            answer.match(
              /^([A-D])(?:[\.\)]|\s|$)/i
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
        question_text:
          content,
        question_type:
          questionType,
        expected_answer:
          answer,
        marks,
        explanation,
        options:
          hasOptions
            ? options
            : null,
      });
    }

    return parsed;
  }

  /* =========================================================
     PREVIEW QUESTIONS
  ========================================================= */

  async function parseQuestions() {
    try {
      setParsing(true);
      setError("");
      setMessage("");

      const parsed =
        parseBulkQuestions(
          bulkText
        );

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
    setQuestions(
      (current) =>
        current.map(
          (question, i) =>
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
    setQuestions(
      (current) =>
        current.map(
          (question, index) => {
            if (
              index !==
              questionIndex
            ) {
              return question;
            }

            return {
              ...question,
              options: {
                ...(question.options ||
                  {}),
                [optionKey]: value,
              },
            };
          }
        )
    );
  }

  /* =========================================================
     DELETE QUESTION
  ========================================================= */

  function deleteQuestion(
    index: number
  ) {
    setQuestions(
      (current) =>
        current.filter(
          (_, i) =>
            i !== index
        )
    );
  }

  /* =========================================================
     ADD MANUAL QUESTION
  ========================================================= */

  function addQuestion() {
    setQuestions(
      (current) => [
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
      ]
    );
  }

  /* =========================================================
     SAVE QUESTIONS
  ========================================================= */

  async function saveQuestions() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (
        questions.length === 0
      ) {
        throw new Error(
          "There are no questions to save."
        );
      }

      for (
        const question of questions
      ) {
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
          Number(question.marks) <=
            0
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
         Then replace them with the reviewed set.
      ===================================================== */

      const {
        error: deleteError,
      } = await supabase
        .from("mock_questions")
        .delete()
        .eq("exam_id", examId);

      if (deleteError) {
        throw new Error(
          deleteError.message
        );
      }

      /* =====================================================
         INSERT QUESTIONS
      ===================================================== */

      const rows =
        questions.map(
          (question) => ({
            exam_id: examId,
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
          })
        );

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

      setBulkText("");
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
      setSaving(false);
    }
  }

  /* =========================================================
     TOTAL MARKS
  ========================================================= */

  const totalMarks =
    useMemo(
      () =>
        questions.reduce(
          (total, question) =>
            total +
            Number(
              question.marks || 0
            ),
          0
        ),
      [questions]
    );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="font-semibold text-slate-700">
          Loading question manager...
        </p>
      </div>
    );
  }

  if (!mock) {
    return (
      <main>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Mock examination not found
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
    <main className="max-w-7xl">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/admin-dashboard/monthly-mock/${examId}`
              )
            }
            className="text-sm font-bold text-slate-500 transition hover:text-slate-900"
          >
            ← Back to Mock
          </button>

          <p className="mt-6 font-bold uppercase tracking-[0.2em] text-yellow-600">
            Question Manager
          </p>

          <h1 className="mt-3 text-4xl font-extrabold text-slate-900">
            {mock.title}
          </h1>

          <p className="mt-3 text-slate-600">
            {subject?.name ||
              "Subject"}{" "}
            •{" "}
            {mock.duration_minutes ||
              0}{" "}
            minutes
          </p>

        </div>


        {/* SUMMARY */}

        <div className="flex gap-3">

          <div className="rounded-2xl bg-slate-900 px-6 py-4 text-center text-white">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Questions
            </p>

            <p className="mt-1 text-2xl font-extrabold">
              {questions.length}
            </p>
          </div>

          <div className="rounded-2xl bg-yellow-500 px-6 py-4 text-center text-slate-900">
            <p className="text-xs font-semibold uppercase">
              Total Marks
            </p>

            <p className="mt-1 text-2xl font-extrabold">
              {totalMarks}
            </p>
          </div>

        </div>

      </div>


      {/* =====================================================
          BULK PASTE
      ===================================================== */}

      <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500 font-black text-slate-900">
                1
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900">
                Paste Question Set
              </h2>

            </div>

            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              Paste the entire question set at once.
              Multiple-choice and short-answer questions
              can be mixed together.
            </p>

          </div>

        </div>


        {/* EXAMPLE */}

        <div className="mt-6 rounded-2xl bg-slate-950 p-6 text-sm leading-7 text-slate-200">

          <p className="font-bold text-yellow-400">
            Example format
          </p>

          <pre className="mt-4 whitespace-pre-wrap font-mono text-slate-300">
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
Marks: 3

3. If x + 7 = 15, find x.
A. 6
B. 7
C. 8
D. 9
Answer: C
Marks: 2`}
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
          className="mt-6 min-h-[350px] w-full rounded-2xl border border-slate-300 bg-slate-50 p-5 font-mono text-sm leading-7 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
        />


        <div className="mt-5 flex flex-col gap-3 sm:flex-row">

          <button
            type="button"
            onClick={parseQuestions}
            disabled={
              parsing ||
              !bulkText.trim()
            }
            className="rounded-xl bg-slate-900 px-7 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="rounded-xl border border-slate-300 bg-white px-7 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Clear
          </button>

        </div>

      </section>


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
          QUESTION PREVIEW
      ===================================================== */}

      {questions.length > 0 && (
        <section className="mt-10">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-black text-white">
                  2
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900">
                  Review Questions
                </h2>

              </div>

              <p className="mt-3 text-slate-600">
                Review and edit the questions before
                saving them to this student's mock.
              </p>

            </div>


            <button
              type="button"
              onClick={addQuestion}
              className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-900 transition hover:bg-yellow-400"
            >
              + Add Question
            </button>

          </div>


          <div className="mt-8 space-y-6">

            {questions.map(
              (
                question,
                index
              ) => (
                <article
                  key={index}
                  className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                >

                  {/* QUESTION HEADER */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-extrabold text-white">
                        {index + 1}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
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
                      className="text-sm font-bold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>

                  </div>


                  {/* QUESTION TYPE */}

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
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
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
                            e.target
                              .value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
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
                              e.target
                                .value
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

                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 font-bold text-white">
                                {option}
                              </span>

                              <input
                                value={
                                  question
                                    .options?.[
                                    option
                                  ] ||
                                  ""
                                }
                                onChange={(e) =>
                                  updateOption(
                                    index,
                                    option,
                                    e.target
                                      .value
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
                            e.target
                              .value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
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
                            e.target
                              .value
                          )
                        }
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                      />
                    )}

                  </div>


                  {/* EXPLANATION */}

                  <div className="mt-6">

                    <label className="text-sm font-bold text-slate-700">
                      Explanation
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


          {/* =================================================
              SAVE
          ================================================= */}

          <div className="mt-8 mb-12 rounded-3xl bg-slate-900 p-8 text-white">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <p className="text-sm font-bold uppercase tracking-wide text-yellow-400">
                  Ready to save?
                </p>

                <h2 className="mt-2 text-2xl font-extrabold">
                  {questions.length} Questions •{" "}
                  {totalMarks} Marks
                </h2>

                <p className="mt-2 text-slate-300">
                  Saving will replace the current question
                  set for this draft with the reviewed version.
                </p>

              </div>


              <button
                type="button"
                onClick={saveQuestions}
                disabled={saving}
                className="rounded-xl bg-yellow-500 px-8 py-4 font-extrabold text-slate-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving Questions..."
                  : "Save Questions"}
              </button>

            </div>

          </div>

        </section>
      )}

    </main>
  );
}