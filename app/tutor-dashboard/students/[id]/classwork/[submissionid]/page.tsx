"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle,
  ImageIcon,
  Upload,
} from "lucide-react";

export default function MarkClassworkPage() {
  const [score, setScore] = useState("");
  const [totalMark, setTotalMark] = useState("");

  const [correctionFile, setCorrectionFile] =
    useState<File | null>(null);

  const percentage = useMemo(() => {
    const s = Number(score);
    const t = Number(totalMark);

    if (!s || !t) return 0;

    return Math.round((s / t) * 100);
  }, [score, totalMark]);

  const feedback = useMemo(() => {
    if (percentage >= 90)
      return "Outstanding performance! Excellent understanding of today's lesson.";

    if (percentage >= 80)
      return "Excellent work. Keep maintaining this standard.";

    if (percentage >= 70)
      return "Very good work. A little more practice will make you even stronger.";

    if (percentage >= 60)
      return "Good effort. Revise today's corrections carefully.";

    if (percentage >= 50)
      return "Fair attempt. More practice is needed on today's topic.";

    if (percentage > 0)
      return "Please revisit today's lesson and correction. More practice is required.";

    return "";
  }, [percentage]);

  return (
    <div className="mx-auto max-w-7xl">

      <h1 className="text-4xl font-extrabold text-slate-900">
        Mark Classwork
      </h1>

      <p className="mt-3 text-slate-600">
        Assess this student's submission and publish the result.
      </p>

      <div className="mt-10 grid gap-10 xl:grid-cols-2">

        {/* LEFT */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Student Submission
          </h2>

          <div className="mt-8 flex h-[520px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">

            <div className="text-center">

              <ImageIcon
                size={60}
                className="mx-auto text-slate-400"
              />

              <p className="mt-4 text-slate-500">
                Uploaded image / PDF will appear here
              </p>

            </div>

          </div>

        </div>





        {/* RIGHT */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Assessment
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-5">

            <div>

              <label className="block font-semibold text-slate-700">
                Student Score
              </label>

              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
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
                value={totalMark}
                onChange={(e) => setTotalMark(e.target.value)}
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
              Upload the corrected script, worked solution, or annotated copy of the student's work.
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

          </div>



          {/* Publish */}

          <button
            className="
              mt-10
              flex
              w-full
              items-center
              justify-center
              gap-3
              rounded-xl
              bg-yellow-500
              py-4
              text-lg
              font-bold
              text-slate-900
              transition
              hover:bg-yellow-400
            "
          >

            <CheckCircle size={22} />

            Publish Result To Student

          </button>

        </div>

      </div>

    </div>
  );
}