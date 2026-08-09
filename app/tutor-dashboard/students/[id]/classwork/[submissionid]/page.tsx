"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle,
  ImageIcon,
  Upload,
  Loader2,
  FileText,
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
  score: number | null;
  total_marks: number | null;
  percentage: number | null;
  auto_feedback: string | null;
  correction_file_url: string | null;
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

  const [correctionFile, setCorrectionFile] =
    useState<File | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /*
   * Load submission
   */
  useEffect(() => {
    if (!submissionId) return;

    async function loadSubmission() {
      try {
        setLoading(true);
        setError("");

        const {
          data,
          error: submissionError,
        } = await supabase
          .from("classwork_submissions")
          .select(
            `
              id,
              student_id,
              student_email,
              classwork_id,
              title,
              status,
              image_url,
              score,
              total_marks,
              percentage,
              auto_feedback,
              correction_file_url
            `
          )
          .eq("id", submissionId)
          .single();

        if (submissionError || !data) {
          throw new Error(
            submissionError?.message ||
              "Submission could not be found."
          );
        }

        setSubmission(data);

        /*
         * If already marked, load existing score.
         */
        if (data.score !== null) {
          setScore(String(data.score));
        }

        if (data.total_marks !== null) {
          setTotalMark(String(data.total_marks));
        }

        /*
         * Load related classwork.
         */
        if (data.classwork_id) {
          const {
            data: classworkData,
            error: classworkError,
          } = await supabase
            .from("classworks")
            .select(
              `
                id,
                subject,
                title,
                description
              `
            )
            .eq("id", data.classwork_id)
            .single();

          if (!classworkError && classworkData) {
            setClasswork(classworkData);
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
   * Calculate percentage
   */
  const percentage = useMemo(() => {
    const s = Number(score);
    const t = Number(totalMark);

    if (
      !Number.isFinite(s) ||
      !Number.isFinite(t) ||
      t <= 0 ||
      s < 0
    ) {
      return 0;
    }

    if (s > t) {
      return 0;
    }

    return Math.round((s / t) * 100);
  }, [score, totalMark]);

  /*
   * Generate automatic feedback
   */
  const feedback = useMemo(() => {
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
   * Publish result
   */
  async function publishResult() {
    if (!submission) return;

    setError("");
    setMessage("");

    const s = Number(score);
    const t = Number(totalMark);

    /*
     * Validate score
     */
    if (!score || !totalMark) {
      setError(
        "Please enter both the student's score and total mark."
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
       * Correction file URL
       */
      let correctionUrl =
        submission.correction_file_url || null;

      /*
       * Upload correction if selected.
       */
      if (correctionFile) {
        const safeFileName =
          correctionFile.name
            .replace(
              /[^a-zA-Z0-9._-]/g,
              "_"
            )
            .replace(/\s+/g, "_");

        const filePath =
          `corrections/${submission.id}/${crypto.randomUUID()}-${safeFileName}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("classwork-submissions")
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
          .from("classwork-submissions")
          .getPublicUrl(filePath);

        correctionUrl =
          publicUrlData.publicUrl;
      }

      /*
       * Update submission.
       */
      const {
        data: updatedSubmission,
        error: updateError,
      } = await supabase
        .from("classwork_submissions")
        .update({
          score: s,
          total_marks: t,
          percentage,
          status: "Marked",
          auto_feedback: feedback,
          correction_file_url:
            correctionUrl,
          marked_at:
            new Date().toISOString(),
        })
        .eq("id", submission.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      setSubmission(updatedSubmission);

      setMessage(
        "Result published successfully. The student can now see the result."
      );
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
   * Loading
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
   * Submission not found
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

  return (
    <div>
      {/* Header */}

      <div>
        <h1 className="text-4xl font-extrabold text-slate-900">
          Mark Classwork
        </h1>

        <p className="mt-3 text-slate-600">
          Assess this student's submission and publish
          the result.
        </p>
      </div>

      {/* Messages */}

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

      {/* Classwork information */}

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
        </div>
      )}

      {/* Main */}

      <div className="mt-10 grid gap-10 xl:grid-cols-2">
        {/* LEFT */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            Student Submission
          </h2>

          <div className="mt-8 flex h-[520px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
            {submission.image_url ? (
              submission.image_url
                .toLowerCase()
                .includes(".pdf") ? (
                <iframe
                  src={submission.image_url}
                  title="Student submission"
                  className="h-full w-full rounded-2xl"
                />
              ) : (
                <img
                  src={submission.image_url}
                  alt="Student submission"
                  className="h-full w-full rounded-2xl object-contain"
                />
              )
            ) : (
              <div className="text-center">
                <ImageIcon
                  size={60}
                  className="mx-auto text-slate-400"
                />

                <p className="mt-4 text-slate-500">
                  No uploaded submission file found.
                </p>
              </div>
            )}
          </div>

          {submission.image_url && (
            <a
              href={submission.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
              <FileText size={18} />
              Open Submission
            </a>
          )}
        </div>

        {/* RIGHT */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            Assessment
          </h2>

          {/* Score */}

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
                  setScore(e.target.value)
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
                  setTotalMark(e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-5 py-4 focus:border-yellow-500 focus:outline-none"
                placeholder="10"
              />
            </div>
          </div>

          {/* Percentage */}

          <div className="mt-8 rounded-3xl bg-yellow-50 p-6">
            <p className="font-semibold text-slate-600">
              Percentage
            </p>

            <h2 className="mt-3 text-6xl font-extrabold text-yellow-600">
              {percentage}%
            </h2>
          </div>

          {/* Feedback */}

          <div className="mt-8 rounded-3xl bg-slate-100 p-6">
            <h3 className="text-xl font-bold text-slate-900">
              Generated Feedback
            </h3>

            <p className="mt-4 leading-8 text-slate-700">
              {feedback ||
                "Feedback will be generated automatically after entering the student's score."}
            </p>
          </div>

          {/* Correction Upload */}

          <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900">
              Correction Upload (Optional)
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
                    e.target.files?.[0] ?? null
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
                <FileText size={18} />
                View Existing Correction
              </a>
            )}
          </div>

          {/* Publish */}

          <button
            onClick={publishResult}
            disabled={publishing}
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
                <CheckCircle size={22} />

                Publish Result To Student
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}