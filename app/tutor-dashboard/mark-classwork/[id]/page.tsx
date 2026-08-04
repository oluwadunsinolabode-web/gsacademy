"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, ImageIcon, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MarkClassworkPage() {
  const params = useParams();

  const [submission, setSubmission] = useState<any>(null);

  const [score, setScore] = useState("");
  const [totalMark, setTotalMark] = useState("");

  const [correctionFile, setCorrectionFile] =
    useState<File | null>(null);

  useEffect(() => {
    async function loadSubmission() {
      const { data } = await supabase
        .from("classwork_submissions")
        .select("*")
        .eq("id", params.id)
        .single();

      setSubmission(data);
    }

    loadSubmission();
  }, [params.id]);

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
  async function publishResult() {
  let correctionUrl = "";

  if (correctionFile) {
    const filePath = `corrections/${Date.now()}-${correctionFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("classwork-submissions")
      .upload(filePath, correctionFile);

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    correctionUrl = supabase.storage
      .from("classwork-submissions")
      .getPublicUrl(filePath).data.publicUrl;
  }

  const { error } = await supabase
    .from("classwork_submissions")
.update({
  score: Number(score),
  total_marks: Number(totalMark),
      percentage,
      status: "Marked",
      auto_feedback: feedback,
      correction_file_url: correctionUrl || null,
      marked_at: new Date().toISOString(),
    })
    .eq("id", params.id);

  if (error) {
    alert(error.message);
  } else {
    alert("Result published successfully.");
  }
}

  return (
    <div className="mx-auto max-w-7xl">

      <h1 className="text-4xl font-extrabold text-slate-900">
        Mark Classwork
      </h1>

      <p className="mt-3 text-slate-600">
        Assess this student's submission and publish the result.
      </p>

      <div className="mt-10 grid gap-10 xl:grid-cols-2">

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Student Submission
          </h2>

          <div className="mt-8 flex h-[520px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">

            {submission?.image_url ? (

              submission.image_url.endsWith(".pdf") ? (

                <iframe
                  src={submission.image_url}
                  className="h-full w-full rounded-2xl"
                />

              ) : (

                <img
                  src={submission.image_url}
                  alt=""
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
                  Loading submission...
                </p>

              </div>

            )}

          </div>

        </div>

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
      className="mt-2 w-full rounded-xl border border-slate-300 px-5 py-4"
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
      className="mt-2 w-full rounded-xl border border-slate-300 px-5 py-4"
    />
  </div>

</div>

<div className="mt-8 rounded-3xl bg-yellow-50 p-6">
  <p className="font-semibold text-slate-600">
    Percentage
  </p>

  <h2 className="mt-3 text-6xl font-extrabold text-yellow-600">
    {percentage}%
  </h2>
</div>

<div className="mt-8 rounded-3xl bg-slate-100 p-6">
  <h3 className="text-xl font-bold text-slate-900">
    Generated Feedback
  </h3>

  <p className="mt-4 leading-8 text-slate-700">
    {feedback}
  </p>
</div>

<div className="mt-8 rounded-3xl border p-6">

  <h3 className="text-xl font-bold">
    Upload Correction (Optional)
  </h3>

  <label className="mt-6 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-yellow-500 p-8">

    <Upload size={40} className="text-yellow-600" />

    <p className="mt-3">
      Click to upload correction
    </p>

    <input
      hidden
      type="file"
      accept="image/*,.pdf"
      onChange={(e) =>
        setCorrectionFile(e.target.files?.[0] || null)
      }
    />

  </label>

  {correctionFile && (
    <p className="mt-4 font-medium">
      {correctionFile.name}
    </p>
  )}

</div>

<button
  onClick={publishResult}
  className="mt-10 flex w-full items-center justify-center gap-3 rounded-xl bg-yellow-500 py-4 font-bold text-slate-900 hover:bg-yellow-400"
>
  <CheckCircle size={22} />
  Publish Result To Student
</button>

                  </div>

      </div>

    </div>
    
  );
}