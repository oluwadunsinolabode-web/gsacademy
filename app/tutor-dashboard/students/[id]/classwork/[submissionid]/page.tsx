"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle,
  ImageIcon,
  Upload,
  Loader2,
  FileText,
  MessageSquareText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Submission = {
  id: string;
  student_id: string | null;
  student_email: string | null;
  classwork_id: string | null;
  title: string | null;
  status: string | null;
  image_url: string | null;
  text_answer: string | null;
  score: number | null;
  total_marks: number | null;
  percentage: number | null;
  grade: string | null;
  auto_feedback: string | null;
  teacher_feedback: string | null;
  tutor_feedback: string | null;
  correction_file_url: string | null;
  submitted_at: string | null;
  marked_at: string | null;
};

type Classwork = {
  id: string;
  subject: string;
  title: string;
  description: string | null;
};

export default function MarkClassworkPage() {
  const params = useParams();

  const submissionId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [submission, setSubmission] =
    useState<Submission | null>(null);

  const [classwork, setClasswork] =
    useState<Classwork | null>(null);

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const [score, setScore] = useState("");
  const [totalMark, setTotalMark] = useState("");

  const [teacherFeedback, setTeacherFeedback] =
    useState("");

  const [correctionFile, setCorrectionFile] =
    useState<File | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /*
   * =====================================================
   * LOAD SUBMISSION
   * =====================================================
   */
  useEffect(() => {
    if (!submissionId) return;

    async function loadSubmission() {
      try {
        setLoading(true);
        setError("");

        console.log(
          "===================================="
        );

        console.log(
          "TUTOR MARKING PAGE"
        );

        console.log(
          "SUBMISSION ID:",
          submissionId
        );

        console.log(
          "===================================="
        );

        /*
         * GET CURRENT AUTH USER
         */
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        console.log(
          "CURRENT TUTOR:",
          user?.id
        );

        if (authError || !user) {
          throw new Error(
            "Tutor is not logged in."
          );
        }

        /*
         * =================================================
         * FETCH THE ACTUAL SUBMISSION
         *
         * IMPORTANT:
         *
         * image_url = uploaded student file
         *
         * text_answer = student's written answer
         *
         * Both are fetched directly from:
         *
         * classwork_submissions
         * =================================================
         */

        const {
          data,
          error: submissionError,
        } = await supabase
          .from("classwork_submissions")
          .select(`
            id,
            student_id,
            student_email,
            classwork_id,
            title,
            status,
            image_url,
            text_answer,
            score,
            total_marks,
            percentage,
            grade,
            auto_feedback,
            teacher_feedback,
            tutor_feedback,
            correction_file_url,
            submitted_at,
            marked_at
          `)
          .eq("id", submissionId)
          .maybeSingle();

        /*
         * DEBUG
         */
        console.log(
          "===================================="
        );

        console.log(
          "TUTOR SUBMISSION DATA:",
          data
        );

        console.log(
          "TUTOR SUBMISSION ERROR:",
          submissionError
        );

        console.log(
          "STUDENT TEXT ANSWER:",
          data?.text_answer
        );

        console.log(
          "STUDENT UPLOADED FILE:",
          data?.image_url
        );

        console.log(
          "===================================="
        );

        if (submissionError) {
          throw new Error(
            `Unable to fetch submission: ${submissionError.message}`
          );
        }

        if (!data) {
          throw new Error(
            "No submission was found for this submission ID."
          );
        }

        /*
         * SAVE SUBMISSION
         */
        setSubmission(data);

        /*
         * EXISTING SCORE
         */
        if (data.score !== null) {
          setScore(
            String(data.score)
          );
        }

        /*
         * EXISTING TOTAL MARK
         */
        if (data.total_marks !== null) {
          setTotalMark(
            String(data.total_marks)
          );
        }

        /*
         * EXISTING FEEDBACK
         */
        setTeacherFeedback(
          data.teacher_feedback ||
            data.tutor_feedback ||
            ""
        );

        /*
         * =================================================
         * LOAD RELATED CLASSWORK
         * =================================================
         */

        if (data.classwork_id) {
          const {
            data: classworkData,
            error: classworkError,
          } = await supabase
            .from("classworks")
            .select(`
              id,
              subject,
              title,
              description
            `)
            .eq(
              "id",
              data.classwork_id
            )
            .maybeSingle();

          console.log(
            "RELATED CLASSWORK:",
            classworkData
          );

          if (classworkError) {
            console.error(
              "CLASSWORK FETCH ERROR:",
              classworkError
            );
          }

          if (classworkData) {
            setClasswork(
              classworkData
            );
          }
        }

      } catch (err) {
        console.error(
          "Submission loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load submission."
        );

      } finally {
        setLoading(false);
      }
    }

    loadSubmission();
  }, [submissionId]);

  /*
   * =====================================================
   * CALCULATE PERCENTAGE
   * =====================================================
   */
  const percentage = useMemo(() => {
    const s = Number(score);
    const t = Number(totalMark);

    if (
      !Number.isFinite(s) ||
      !Number.isFinite(t) ||
      t <= 0 ||
      s < 0 ||
      s > t
    ) {
      return 0;
    }

    return Math.round(
      (s / t) * 100
    );
  }, [score, totalMark]);

  /*
   * =====================================================
   * CALCULATE GRADE
   * =====================================================
   */
  const grade = useMemo(() => {
    if (percentage >= 75) {
      return "A";
    }

    if (percentage >= 65) {
      return "B";
    }

    if (percentage >= 55) {
      return "C";
    }

    if (percentage >= 45) {
      return "D";
    }

    if (percentage >= 40) {
      return "E";
    }

    if (percentage > 0) {
      return "F";
    }

    return "";
  }, [percentage]);

  /*
   * =====================================================
   * AUTOMATIC FEEDBACK
   * =====================================================
   */
  const automaticFeedback = useMemo(() => {
    if (percentage >= 90) {
      return "Outstanding performance! Excellent understanding of today's lesson.";
    }

    if (percentage >= 80) {
      return "Excellent work. Keep maintaining this standard.";
    }

    if (percentage >= 70) {
      return "Very good work. A little more practice will make you even stronger.";
    }

    if (percentage >= 60) {
      return "Good effort. Revise today's corrections carefully.";
    }

    if (percentage >= 50) {
      return "Fair attempt. More practice is needed on today's topic.";
    }

    if (percentage > 0) {
      return "Please revisit today's lesson and correction. More practice is required.";
    }

    return "";
  }, [percentage]);

  /*
   * =====================================================
   * PUBLISH RESULT
   * =====================================================
   */
  async function publishResult() {
    if (!submission) return;

    setError("");
    setMessage("");

    const s = Number(score);
    const t = Number(totalMark);

    /*
     * VALIDATE
     */
    if (!score || !totalMark) {
      setError(
        "Please enter both the student's score and total mark."
      );
      return;
    }

    if (
      !Number.isFinite(s) ||
      !Number.isFinite(t)
    ) {
      setError(
        "Please enter valid numbers for the score and total mark."
      );
      return;
    }

    if (t <= 0) {
      setError(
        "Total mark must be greater than zero."
      );
      return;
    }

    if (s < 0) {
      setError(
        "Student score cannot be negative."
      );
      return;
    }

    if (s > t) {
      setError(
        "Student score cannot be greater than the total mark."
      );
      return;
    }

    try {
      setPublishing(true);

      /*
       * KEEP EXISTING CORRECTION
       */
      let correctionUrl =
        submission.correction_file_url ||
        null;

      /*
       * =================================================
       * UPLOAD CORRECTION
       * =================================================
       */
      if (correctionFile) {
        const safeFileName =
          correctionFile.name
            .replace(
              /[^a-zA-Z0-9._-]/g,
              "_"
            )
            .replace(
              /\s+/g,
              "_"
            );

        const filePath =
          `corrections/${submission.id}/${crypto.randomUUID()}-${safeFileName}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from(
            "classwork-submissions"
          )
          .upload(
            filePath,
            correctionFile,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                correctionFile.type ||
                undefined,
            }
          );

        if (uploadError) {
          throw new Error(
            `Correction upload failed: ${uploadError.message}`
          );
        }

        const {
          data: publicUrlData,
        } = supabase.storage
          .from(
            "classwork-submissions"
          )
          .getPublicUrl(
            filePath
          );

        correctionUrl =
          publicUrlData.publicUrl;
      }

      /*
       * =================================================
       * FINAL FEEDBACK
       * =================================================
       */
      const finalFeedback =
        teacherFeedback.trim() ||
        automaticFeedback ||
        null;

      /*
       * =================================================
       * UPDATE SUBMISSION
       * =================================================
       */
      const {
        data: updatedSubmission,
        error: updateError,
      } = await supabase
        .from(
          "classwork_submissions"
        )
        .update({
          score: s,
          total_marks: t,
          percentage,
          grade,
          status: "Marked",

          auto_feedback:
            automaticFeedback ||
            null,

          teacher_feedback:
            finalFeedback,

          tutor_feedback:
            finalFeedback,

          correction_file_url:
            correctionUrl,

          marked_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          submission.id
        )
        .select(`
          id,
          student_id,
          student_email,
          classwork_id,
          title,
          status,
          image_url,
          text_answer,
          score,
          total_marks,
          percentage,
          grade,
          auto_feedback,
          teacher_feedback,
          tutor_feedback,
          correction_file_url,
          submitted_at,
          marked_at
        `)
        .single();

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      setSubmission(
        updatedSubmission
      );

      setMessage(
        "Result published successfully. The student can now see the result."
      );

      setCorrectionFile(null);

    } catch (err) {
      console.error(
        "Publish result error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to publish result."
      );

    } finally {
      setPublishing(false);
    }
  }

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */
  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-10 shadow-sm">

        <div className="flex items-center justify-center gap-3">

          <Loader2
            size={24}
            className="animate-spin text-yellow-500"
          />

          <p className="text-slate-500">
            Loading student submission...
          </p>

        </div>

      </div>
    );
  }

  /*
   * =====================================================
   * SUBMISSION NOT FOUND
   * =====================================================
   */
  if (!submission) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

        <ImageIcon
          size={55}
          className="mx-auto text-slate-300"
        />

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Submission Not Found
        </h1>

        <p className="mt-3 text-slate-500">
          {error ||
            "This classwork submission could not be found."}
        </p>

      </div>
    );
  }

  /*
   * =====================================================
   * STUDENT SUBMISSION FILE
   * =====================================================
   */
  const submissionUrl =
    submission.image_url;

  const isPdf =
    !!submissionUrl &&
    /\.pdf(\?.*)?$/i.test(
      submissionUrl
    );

  const isImage =
    !!submissionUrl &&
    /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(
      submissionUrl
    );

  /*
   * =====================================================
   * DASHBOARD
   * =====================================================
   */
  return (
    <div className="pb-10">

      {/* ===============================================
          HEADER
      =============================================== */}

      <div>

        <h1 className="text-4xl font-extrabold text-slate-900">
          Mark Classwork
        </h1>

        <p className="mt-3 text-slate-600">
          Assess this student's submission and publish
          the result.
        </p>

      </div>

      {/* ===============================================
          MESSAGES
      =============================================== */}

      {message && (
        <div className="mt-6 rounded-2xl bg-green-50 p-5 font-semibold text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 p-5 font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* ===============================================
          CLASSWORK INFORMATION
      =============================================== */}

      {classwork && (
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex flex-wrap items-center gap-3">

            <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-700">
              {classwork.subject}
            </span>

            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              {submission.status}
            </span>

          </div>

          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            {classwork.title}
          </h2>

          {classwork.description && (
            <p className="mt-2 whitespace-pre-wrap text-slate-600">
              {classwork.description}
            </p>
          )}

          <p className="mt-3 text-sm text-slate-500">
            Student:{" "}
            <span className="font-semibold text-slate-900">
              {submission.student_email ||
                "Unknown student"}
            </span>
          </p>

          {submission.submitted_at && (
            <p className="mt-2 text-sm text-slate-500">
              Submitted:{" "}
              {new Date(
                submission.submitted_at
              ).toLocaleString()}
            </p>
          )}

        </div>
      )}

      {/* ===============================================
          MAIN CONTENT
      =============================================== */}

      <div className="mt-10 grid gap-10 xl:grid-cols-2">

        {/* =============================================
            LEFT — STUDENT WORK
        ============================================= */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Student Submission
          </h2>

          {/* ===========================================
              WRITTEN ANSWER
          =========================================== */}

          {submission.text_answer ? (

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">

              <div className="flex items-center gap-3">

                <MessageSquareText
                  size={25}
                  className="text-yellow-600"
                />

                <h3 className="text-xl font-bold text-slate-900">
                  Written Answer
                </h3>

              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">

                <p className="whitespace-pre-wrap leading-8 text-slate-700">
                  {submission.text_answer}
                </p>

              </div>

            </div>

          ) : null}

          {/* ===========================================
              UPLOADED FILE
          =========================================== */}

          {submissionUrl ? (

            <div className="mt-8">

              <div className="flex items-center justify-between gap-4">

                <h3 className="text-xl font-bold text-slate-900">
                  Uploaded File
                </h3>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  Student File
                </span>

              </div>

              <div className="mt-4 flex h-[520px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">

                {isPdf ? (

                  <iframe
                    src={submissionUrl}
                    title="Student submission PDF"
                    className="h-full w-full rounded-2xl"
                  />

                ) : isImage ? (

                  <img
                    src={submissionUrl}
                    alt="Student classwork submission"
                    className="h-full w-full rounded-2xl object-contain"
                  />

                ) : (

                  <div className="text-center">

                    <FileText
                      size={60}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-4 font-semibold text-slate-700">
                      Uploaded file
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      This file type cannot be previewed here.
                    </p>

                  </div>

                )}

              </div>

              <a
                href={submissionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
              >

                <FileText
                  size={18}
                />

                Open Submission

              </a>

            </div>

          ) : null}

          {/* ===========================================
              NOTHING SUBMITTED
          =========================================== */}

          {!submission.text_answer &&
            !submissionUrl && (

              <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center">

                <ImageIcon
                  size={55}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-4 font-semibold text-slate-600">
                  No uploaded file or written answer was found.
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Check the browser console to see exactly
                  what was returned from Supabase.
                </p>

              </div>

            )}

        </div>

        {/* =============================================
            RIGHT — ASSESSMENT
        ============================================= */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Assessment
          </h2>

          {/* SCORE */}

          <div className="mt-8 grid grid-cols-2 gap-5">

            <div>

              <label className="block font-semibold text-slate-700">
                Student Score
              </label>

              <input
                type="number"
                min="0"
                value={score}
                onChange={(e) =>
                  setScore(
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-5 py-4 focus:border-yellow-500 focus:outline-none"
                placeholder="7"
              />

            </div>

            <div>

              <label className="block font-semibold text-slate-700">
                Total Mark
              </label>

              <input
                type="number"
                min="1"
                value={totalMark}
                onChange={(e) =>
                  setTotalMark(
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-5 py-4 focus:border-yellow-500 focus:outline-none"
                placeholder="10"
              />

            </div>

          </div>

          {/* PERCENTAGE */}

          <div className="mt-8 rounded-3xl bg-yellow-50 p-6">

            <p className="font-semibold text-slate-600">
              Percentage
            </p>

            <h2 className="mt-3 text-6xl font-extrabold text-yellow-600">
              {percentage}%
            </h2>

          </div>

          {/* GRADE */}

          <div className="mt-5 rounded-3xl bg-blue-50 p-6">

            <p className="font-semibold text-slate-600">
              Grade
            </p>

            <h2 className="mt-2 text-4xl font-extrabold text-blue-700">
              {grade || "—"}
            </h2>

          </div>

          {/* AUTOMATIC FEEDBACK */}

          <div className="mt-8 rounded-3xl bg-slate-100 p-6">

            <h3 className="text-xl font-bold text-slate-900">
              Automatic Feedback
            </h3>

            <p className="mt-4 leading-8 text-slate-700">
              {automaticFeedback ||
                "Feedback will be generated automatically after entering the student's score."}
            </p>

          </div>

          {/* TUTOR FEEDBACK */}

          <div className="mt-8">

            <label className="flex items-center gap-2 text-xl font-bold text-slate-900">

              <MessageSquareText
                size={22}
                className="text-yellow-600"
              />

              Tutor Feedback

            </label>

            <p className="mt-2 text-sm text-slate-500">
              Add your own comments about the student's work.
              If you leave this empty, the automatic feedback will
              be shown to the student.
            </p>

            <textarea
              value={teacherFeedback}
              onChange={(e) =>
                setTeacherFeedback(
                  e.target.value
                )
              }
              rows={7}
              placeholder="Example: Good attempt. Question 3 was correct, but revise how you handle negative numbers..."
              className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 leading-7 text-slate-800 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
            />

          </div>

          {/* ===========================================
              CORRECTION UPLOAD
          =========================================== */}

          <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">

            <h3 className="text-2xl font-bold text-slate-900">

              Correction Upload

              <span className="ml-2 text-sm font-normal text-slate-400">
                (Optional)
              </span>

            </h3>

            <p className="mt-3 text-slate-600">
              Upload the corrected script, worked
              solution, or annotated copy of the
              student's work.
            </p>

            <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-yellow-500 bg-slate-50 p-10 transition hover:bg-yellow-50">

              <Upload
                size={42}
                className="text-yellow-600"
              />

              <p className="mt-4 font-semibold text-slate-900">
                Click to Upload Correction
              </p>

              <p className="mt-2 text-sm text-slate-500">
                PDF, JPG or PNG
              </p>

              <input
                hidden
                type="file"
                accept="image/*,.pdf"
                onChange={(e) =>
                  setCorrectionFile(
                    e.target.files?.[0] ||
                      null
                  )
                }
              />

            </label>

            {correctionFile && (

              <div className="mt-5 rounded-xl bg-green-50 p-4">

                <p className="font-semibold text-green-700">
                  Selected File
                </p>

                <p className="mt-2 text-slate-700">
                  {correctionFile.name}
                </p>

              </div>

            )}

            {submission.correction_file_url && (

              <a
                href={
                  submission.correction_file_url
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-200"
              >

                <FileText
                  size={18}
                />

                View Existing Correction

              </a>

            )}

          </div>

          {/* ===========================================
              PUBLISH RESULT
          =========================================== */}

          <button
            type="button"
            onClick={
              publishResult
            }
            disabled={
              publishing
            }
            className="mt-10 flex w-full items-center justify-center gap-3 rounded-xl bg-yellow-500 py-4 text-lg font-bold text-slate-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {publishing ? (

              <>
                <Loader2
                  size={22}
                  className="animate-spin"
                />

                Publishing Result...
              </>

            ) : (

              <>
                <CheckCircle
                  size={22}
                />

                Publish Result To Student
              </>

            )}

          </button>

        </div>

      </div>

    </div>
  );
}
