"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Upload,
  Camera,
  FileText,
  X,
  CheckCircle,
  Loader2,
  ExternalLink,
  Download,
} from "lucide-react";

type Classwork = {
  id: string;
  tutor_id: string;
  subject: string;
  title: string;
  description: string | null;
  attachment_url: string | null;
  due_date: string | null;
  status: string;
  created_at: string;
};

type Student = {
  id: string;
  auth_id: string;
  full_name: string | null;
  email: string | null;
};
type Submission = {
  id: string;
  classwork_id: string | null;
  student_id: string | null;
  student_email: string | null;
  subject: string | null;
  title: string | null;
  image_url: string | null;
  text_answer: string | null;
  status: string | null;
  tutor_feedback: string | null;
  submitted_at: string | null;
  score: number | null;
  total_marks: number | null;
  percentage: number | null;
  grade: string | null;
  teacher_feedback: string | null;
  correction_file_url: string | null;
};
export default function ClassworkPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [classwork, setClasswork] =
    useState<Classwork | null>(null);
  const [student, setStudent] =
    useState<Student | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submissions, setSubmissions] =
  useState<Submission[]>([]);

const [loadingSubmissions, setLoadingSubmissions] =
  useState(false);

  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /*
   * LOAD CLASSWORK + STUDENT
   */
  useEffect(() => {
    async function loadClasswork() {
      try {
        setLoading(true);
        setError("");

        /*
         * GET LOGGED-IN USER
         */
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error(
            "You must be logged in as a student."
          );
        }

        /*
         * GET STUDENT PROFILE
         */
        const {
          data: studentData,
          error: studentError,
        } = await supabase
          .from("students")
          .select(
            `
              id,
              auth_id,
              full_name,
              email
            `
          )
          .eq("auth_id", user.id)
          .single();

        if (studentError || !studentData) {
          throw new Error(
            studentError?.message ||
              "Student profile could not be found."
          );
        }

        setStudent(studentData);

        /*
         * GET CLASSWORK ID FROM URL
         */
        const params = new URLSearchParams(
          window.location.search
        );

        const classworkId = params.get("id");

        if (!classworkId) {
          throw new Error(
            "No classwork was selected."
          );
        }

        /*
         * GET CLASSWORK
         *
         * attachment_url is included here.
         */
        const {
          data: classworkData,
          error: classworkError,
        } = await supabase
          .from("classworks")
          .select(
            `
              id,
              tutor_id,
              subject,
              title,
              description,
              attachment_url,
              due_date,
              status,
              created_at
            `
          )
          .eq("id", classworkId)
          .single();

        if (
          classworkError ||
          !classworkData
        ) {
          throw new Error(
            classworkError?.message ||
              "Classwork could not be found."
          );
        }

        console.log(
          "CLASSWORK:",
          classworkData
        );

        console.log(
          "TUTOR ATTACHMENT:",
          classworkData.attachment_url
        );

        setClasswork(classworkData);
        await loadSubmissions(
  studentData.id,
  classworkData.id
);
      } catch (err) {
        console.error(
          "Classwork loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load classwork."
        );
      } finally {
        setLoading(false);
      }
    }

    loadClasswork();
  }, []);

  /*
   * FILE PREVIEWS
   */
  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "",
      })),
    [files]
  );

  /*
   * CLEAN PREVIEW URLS
   */
  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview.url) {
          URL.revokeObjectURL(
            preview.url
          );
        }
      });
    };
  }, [previews]);

  /*
   * ADD FILES
   */
  const addFiles = (
    list: FileList | null
  ) => {
    if (!list) return;

    const selectedFiles =
      Array.from(list);

    setFiles((previous) => [
      ...previous,
      ...selectedFiles,
    ]);

    setMessage("");
    setError("");
  };

  /*
   * REMOVE FILE
   */
  const removeFile = (index: number) => {
    setFiles((previous) =>
      previous.filter(
        (_, i) => i !== index
      )
    );
  };
async function loadSubmissions(
  studentId: string,
  classworkId: string
) {
  try {
    setLoadingSubmissions(true);

    const {
      data,
      error: submissionError,
    } = await supabase
      .from("classwork_submissions")
      .select(`
        id,
        classwork_id,
        student_id,
        student_email,
        subject,
        title,
        image_url,
        text_answer,
        status,
        tutor_feedback,
        submitted_at,
        score,
        total_marks,
        percentage,
        grade,
        teacher_feedback,
        correction_file_url
      `)
      .eq("student_id", studentId)
      .eq("classwork_id", classworkId)
      .order("submitted_at", {
        ascending: false,
      });

    if (submissionError) {
      throw submissionError;
    }

    setSubmissions(data || []);
  } catch (err) {
    console.error(
      "Submission loading error:",
      err
    );
  } finally {
    setLoadingSubmissions(false);
  }
}
  /*
   * SUBMIT CLASSWORK
   */
  async function upload() {
  if (files.length === 0 && !textAnswer.trim()) {
    setError(
      "Please upload a file or write your answer before submitting."
    );
    return;
  }

  if (!classwork) {
    setError(
      "Classwork information is still loading. Please wait."
    );
    return;
  }

  if (!student) {
    setError(
      "Student profile could not be found."
    );
    return;
  }

  try {
    setUploading(true);
    setProgress(0);
    setMessage("");
    setError("");

    /*
     * GET AUTH USER
     */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    /*
     * VERIFY STUDENT
     */
    if (student.auth_id !== user.id) {
      throw new Error(
        "Student account verification failed."
      );
    }

    /*
     * FILE URL
     */
    let uploadedFileUrl: string | null = null;

    /*
     * UPLOAD FILE IF PROVIDED
     */
    if (files.length > 0) {
      const file = files[0];

      const safeFileName = file.name
        .replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        )
        .replace(/\s+/g, "_");

      const filePath =
        `students/${student.id}/classwork/${classwork.id}/${crypto.randomUUID()}-${safeFileName}`;

      const {
        error: storageError,
      } = await supabase.storage
        .from("classwork-submissions")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType:
              file.type || undefined,
          }
        );

      if (storageError) {
        throw new Error(
          `File upload failed: ${storageError.message}`
        );
      }

      /*
       * GET PUBLIC URL
       */
      const {
        data: publicData,
      } = supabase.storage
        .from("classwork-submissions")
        .getPublicUrl(filePath);

      uploadedFileUrl =
        publicData.publicUrl;

      setProgress(100);
    }

    /*
     * SAVE SUBMISSION
     *
     * This can now contain:
     * - file only
     * - text only
     * - file + text
     */
    const {
      error: dbError,
    } = await supabase
      .from("classwork_submissions")
      .insert({
        student_id: student.id,
        student_email:
          student.email ||
          user.email ||
          null,
        classwork_id:
          classwork.id,
        title:
          classwork.title,
        status: "Submitted",
        image_url:
          uploadedFileUrl,
        text_answer:
          textAnswer.trim() ||
          null,
      });

    if (dbError) {
      throw new Error(
        `Submission could not be saved: ${dbError.message}`
      );
    }

    /*
     * RESET FORM
     */
    setFiles([]);
    setTextAnswer("");
    setProgress(100);

    /*
     * RELOAD SUBMISSION
     */
    await loadSubmissions(
      student.id,
      classwork.id
    );

    setMessage(
      "Your classwork has been submitted successfully."
    );
  } catch (err) {
    console.error(
      "Classwork submission error:",
      err
    );

    setError(
      err instanceof Error
        ? err.message
        : "Unable to submit classwork."
    );
  } finally {
    setUploading(false);
  }
}
  /*
   * LOADING
   */
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <Loader2
            size={35}
            className="mx-auto animate-spin text-yellow-500"
          />

          <p className="mt-4 text-slate-600">
            Loading classwork...
          </p>
        </div>
      </div>
    );
  }

  /*
   * CLASSWORK NOT FOUND
   */
  if (!classwork) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <FileText
            size={50}
            className="mx-auto text-slate-300"
          />

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Classwork Not Found
          </h1>

          <p className="mt-3 text-red-600">
            {error ||
              "Unable to load this classwork."}
          </p>
        </div>
      </div>
    );
  }

  /*
   * CHECK ATTACHMENT TYPE
   */
  const attachmentUrl = classwork.attachment_url;

const isImage =
  !!attachmentUrl &&
  /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(
    attachmentUrl
  );

const isPdf =
  !!attachmentUrl &&
  /\.pdf(\?.*)?$/i.test(
    attachmentUrl
  );

  return (
    <div className="mx-auto max-w-6xl pb-10">

      {/* HEADER */}

      <h1 className="text-4xl font-extrabold text-slate-900">
        Submit Classwork
      </h1>

      <p className="mt-3 text-slate-700">
        Upload your handwritten answers by
        taking a picture or selecting a file.
      </p>

      {/* CLASS INFORMATION */}

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex flex-wrap items-center gap-3">

          <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-700">
            {classwork.subject}
          </span>

          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
            {classwork.status}
          </span>

        </div>

        <p className="mt-5 font-semibold text-yellow-600">
          Today's Classwork
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          {classwork.title}
        </h2>

        {classwork.description && (
          <p className="mt-3 whitespace-pre-wrap text-slate-700">
            {classwork.description}
          </p>
        )}

        {classwork.due_date && (
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Due:{" "}
            {new Date(
              classwork.due_date
            ).toLocaleString()}
          </p>
        )}
      </div>

     {/* =====================================
    TUTOR ATTACHMENT
====================================== */}

{attachmentUrl ? (
  <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">

    {/* HEADER */}

    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div className="flex items-center gap-3">

        <FileText
          size={30}
          className="text-yellow-600"
        />

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Classwork File
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            File uploaded by your tutor.
          </p>
        </div>

      </div>

      {/* ACTION BUTTONS */}

      <div className="flex flex-wrap gap-3">

        {/* VIEW */}

        <a
          href={attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
        >
          <ExternalLink size={18} />
          View File
        </a>

        {/* DOWNLOAD */}

        <a
          href={attachmentUrl}
          download
          className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-bold text-slate-900 transition hover:bg-yellow-400"
        >
          <Download size={18} />
          Download
        </a>

      </div>

    </div>

    {/* =====================================
        IMAGE VIEWER
    ====================================== */}

    {isImage && (
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">

        <img
          src={attachmentUrl}
          alt="Classwork uploaded by tutor"
          className="mx-auto max-h-[750px] w-auto max-w-full rounded-xl object-contain"
        />

      </div>
    )}

    {/* =====================================
        PDF VIEWER
    ====================================== */}

    {isPdf && (
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

        <iframe
          src={attachmentUrl}
          title="Tutor's classwork PDF"
          className="h-[750px] w-full"
        />

      </div>
    )}

    {/* =====================================
        UNKNOWN FILE TYPE
    ====================================== */}

    {!isImage && !isPdf && (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">

        <FileText
          size={60}
          className="mx-auto text-slate-400"
        />

        <p className="mt-4 font-semibold text-slate-800">
          Your tutor has uploaded a
          classwork file.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Use "View File" to open it or
          "Download" to save it.
        </p>

      </div>
    )}

  </div>
) : (
  <div className="mt-8 rounded-3xl bg-slate-50 p-6 text-center">

    <FileText
      size={40}
      className="mx-auto text-slate-300"
    />

    <p className="mt-3 font-semibold text-slate-600">
      No file was attached to this
      classwork.
    </p>

  </div>
)}
{/* =====================================
    WRITE YOUR ANSWER
====================================== */}

<div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">

  <div className="flex items-center gap-3">

    <FileText
      size={32}
      className="text-yellow-600"
    />

    <div>
      <h2 className="text-2xl font-bold text-slate-900">
        Write Your Answer
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Type your answer below if this classwork
        requires a written response.
      </p>
    </div>

  </div>

  <textarea
    value={textAnswer}
    onChange={(event) =>
      setTextAnswer(event.target.value)
    }
    placeholder="Type your answer here..."
    rows={10}
    disabled={uploading}
    className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 disabled:opacity-60"
  />

  <p className="mt-2 text-sm text-slate-400">
    You may submit this answer without uploading a file.
  </p>

</div>
      {/* =====================================
          UPLOAD YOUR WORK
      ====================================== */}

      <div
        onDragOver={(event) =>
          event.preventDefault()
        }
        onDrop={(event) => {
          event.preventDefault();

          addFiles(
            event.dataTransfer.files
          );
        }}
        className="mt-8 rounded-3xl border-2 border-dashed border-yellow-500 bg-white p-10 text-center"
      >

        <Upload
          size={45}
          className="mx-auto text-yellow-600"
        />

        <h2 className="mt-5 text-2xl font-bold text-slate-900">
          Upload Your Work
        </h2>

        <p className="mt-2 text-slate-700">
          Take a photo of your work or
          choose a file.
        </p>

        <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900 hover:bg-yellow-400">

          <Camera size={22} />

          Take Photo / Choose File

          <input
            hidden
            type="file"
            multiple
            accept="image/*,.pdf"
            capture="environment"
            onChange={(event) =>
              addFiles(
                event.target.files
              )
            }
          />

        </label>

        <p className="mt-4 text-sm text-slate-700">
          Supported files: JPG, PNG and PDF
        </p>

      </div>

      {/* =====================================
          SELECTED FILES
      ====================================== */}

      {files.length > 0 && (
        <div className="mt-10">

          <h2 className="text-2xl font-bold text-slate-900">
            Selected Files
          </h2>

          <div className="mt-5 grid gap-6 md:grid-cols-3">

            {previews.map(
              (item, index) => (

                <div
                  key={index}
                  className="rounded-2xl bg-white p-5 shadow"
                >

                  {item.url ? (
                    <img
                      src={item.url}
                      className="h-40 w-full rounded-xl object-cover"
                      alt="Selected classwork"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-xl bg-slate-100">
                      <FileText
                        size={45}
                        className="text-slate-400"
                      />
                    </div>
                  )}

                  <p className="mt-3 truncate font-medium text-slate-800">
                    {item.file.name}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      removeFile(index)
                    }
                    disabled={uploading}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <X size={18} />
                    Remove
                  </button>

                </div>

              )
            )}

          </div>

        </div>
      )}

      {/* =====================================
          PROGRESS
      ====================================== */}

      {uploading && (
        <div className="mt-10">

          <div className="h-4 overflow-hidden rounded-full bg-slate-200">

            <div
              className="h-4 rounded-full bg-yellow-500 transition-all"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          <p className="mt-3 font-semibold text-slate-800">
            Uploading {progress}%
          </p>

        </div>
      )}

      {/* =====================================
          SUBMIT
      ====================================== */}

      <button
        type="button"
        onClick={upload}
       disabled={
  uploading ||
  (files.length === 0 &&
    !textAnswer.trim())
}
        className="mt-10 inline-flex items-center gap-3 rounded-xl bg-slate-900 px-10 py-4 font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >

        {uploading && (
          <Loader2
            size={20}
            className="animate-spin"
          />
        )}

        {uploading
          ? "Submitting..."
          : "Submit Classwork"}

      </button>
     {/* =====================================
    MY SUBMITTED WORK
====================================== */}

<div className="mt-12 rounded-3xl bg-white p-6 shadow-sm">

  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

    <div>
      <h2 className="text-2xl font-bold text-slate-900">
        My Submitted Work
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        View your submitted answer, uploaded file,
        tutor feedback and marked result here.
      </p>
    </div>

    {submissions.length > 0 && (
      <span className="w-fit rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
        Submitted
      </span>
    )}

  </div>

  {/* LOADING */}

  {loadingSubmissions && (
    <div className="mt-6 flex items-center gap-3 text-slate-600">

      <Loader2
        size={20}
        className="animate-spin"
      />

      <span>
        Loading your submitted work...
      </span>

    </div>
  )}

  {/* NO SUBMISSION */}

  {!loadingSubmissions &&
    submissions.length === 0 && (
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

        <FileText
          size={50}
          className="mx-auto text-slate-300"
        />

        <p className="mt-4 font-semibold text-slate-700">
          You have not submitted this classwork yet.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Your answer will appear here after you submit it.
        </p>

      </div>
    )}

  {/* SUBMISSIONS */}

  {!loadingSubmissions &&
    submissions.length > 0 && (

      <div className="mt-6 space-y-8">

        {submissions.map((submission) => {

          const submissionUrl =
            submission.image_url;

          const correctionUrl =
            submission.correction_file_url;

          const isImage =
            !!submissionUrl &&
            /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(
              submissionUrl
            );

          const isPdf =
            !!submissionUrl &&
            /\.pdf(\?.*)?$/i.test(
              submissionUrl
            );

          const isCorrectionPdf =
            !!correctionUrl &&
            /\.pdf(\?.*)?$/i.test(
              correctionUrl
            );

          const isCorrectionImage =
            !!correctionUrl &&
            /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(
              correctionUrl
            );

          return (
            <div
              key={submission.id}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
            >

              {/* ===============================
                  SUBMISSION HEADER
              ================================ */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div>

                  <div className="flex flex-wrap items-center gap-2">

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      {submission.status || "Submitted"}
                    </span>

                    {submission.score !== null && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        Marked
                      </span>
                    )}

                  </div>

                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    {submission.title ||
                      classwork.title}
                  </h3>

                  {submission.submitted_at && (
                    <p className="mt-2 text-sm text-slate-500">
                      Submitted{" "}
                      {new Date(
                        submission.submitted_at
                      ).toLocaleString()}
                    </p>
                  )}

                </div>

              </div>

              {/* ===============================
                  WRITTEN ANSWER
              ================================ */}

              {submission.text_answer && (
                <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">

                  <div className="flex items-center gap-3">

                    <FileText
                      size={24}
                      className="text-yellow-600"
                    />

                    <h4 className="text-lg font-bold text-slate-900">
                      My Written Answer
                    </h4>

                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-5">

                    <p className="whitespace-pre-wrap leading-8 text-slate-700">
                      {submission.text_answer}
                    </p>

                  </div>

                </div>
              )}

              {/* ===============================
                  UPLOADED FILE
              ================================ */}

              {submissionUrl && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                      <FileText
                        size={25}
                        className="text-yellow-600"
                      />

                      <div>
                        <h4 className="text-lg font-bold text-slate-900">
                          Uploaded Work
                        </h4>

                        <p className="text-sm text-slate-500">
                          Your uploaded classwork file.
                        </p>
                      </div>

                    </div>

                    <div className="flex flex-wrap gap-2">

                      <a
                        href={submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800"
                      >
                        <ExternalLink size={17} />
                        View File
                      </a>

                      <a
                        href={submissionUrl}
                        download
                        className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 font-bold text-slate-900 hover:bg-yellow-400"
                      >
                        <Download size={17} />
                        Download
                      </a>

                    </div>

                  </div>

                  {/* IMAGE */}

                  {isImage && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">

                      <img
                        src={submissionUrl}
                        alt="Your submitted classwork"
                        className="mx-auto max-h-[700px] w-auto max-w-full rounded-xl object-contain"
                      />

                    </div>
                  )}

                  {/* PDF */}

                  {isPdf && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

                      <iframe
                        src={submissionUrl}
                        title="Your submitted classwork PDF"
                        className="h-[700px] w-full"
                      />

                    </div>
                  )}

                  {/* OTHER FILE */}

                  {!isImage && !isPdf && (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-6 text-center">

                      <FileText
                        size={50}
                        className="mx-auto text-slate-400"
                      />

                      <p className="mt-3 font-semibold text-slate-700">
                        Your uploaded file is available.
                      </p>

                    </div>
                  )}

                </div>
              )}

              {/* ===============================
                  NO ANSWER
              ================================ */}

              {!submission.text_answer &&
                !submissionUrl && (
                  <div className="mt-6 rounded-2xl bg-white p-6 text-center">

                    <p className="text-slate-500">
                      No written answer or uploaded file
                      was attached to this submission.
                    </p>

                  </div>
                )}

              {/* ===============================
                  MARKED RESULT
              ================================ */}

              {(submission.score !== null ||
                submission.percentage !== null ||
                submission.grade) && (

                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">

                  <h4 className="text-xl font-bold text-slate-900">
                    Your Result
                  </h4>

                  <div className="mt-5 flex flex-wrap gap-3">

                    {submission.score !== null && (
                      <span className="rounded-xl bg-white px-4 py-3 font-bold text-blue-700 shadow-sm">
                        Score:{" "}
                        {submission.score}
                        {submission.total_marks !== null
                          ? ` / ${submission.total_marks}`
                          : ""}
                      </span>
                    )}

                    {submission.percentage !== null && (
                      <span className="rounded-xl bg-white px-4 py-3 font-bold text-purple-700 shadow-sm">
                        {submission.percentage}%
                      </span>
                    )}

                    {submission.grade && (
                      <span className="rounded-xl bg-yellow-100 px-4 py-3 font-bold text-yellow-700">
                        Grade:{" "}
                        {submission.grade}
                      </span>
                    )}

                  </div>

                </div>
              )}

              {/* ===============================
                  TUTOR FEEDBACK
              ================================ */}

              {(submission.teacher_feedback ||
                submission.tutor_feedback) && (

                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">

                  <div className="flex items-center gap-3">

                    <CheckCircle
                      size={25}
                      className="text-green-600"
                    />

                    <h4 className="text-xl font-bold text-slate-900">
                      Tutor Feedback
                    </h4>

                  </div>

                  <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-700">
                    {submission.teacher_feedback ||
                      submission.tutor_feedback}
                  </p>

                </div>
              )}

              {/* ===============================
                  CORRECTION FILE
              ================================ */}

              {correctionUrl && (
                <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-6">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                      <CheckCircle
                        size={25}
                        className="text-yellow-600"
                      />

                      <div>
                        <h4 className="text-xl font-bold text-slate-900">
                          Tutor Correction
                        </h4>

                        <p className="text-sm text-slate-600">
                          Your tutor has uploaded a corrected
                          version of your work.
                        </p>
                      </div>

                    </div>

                    <div className="flex flex-wrap gap-2">

                      <a
                        href={correctionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800"
                      >
                        <ExternalLink size={17} />
                        View Correction
                      </a>

                      <a
                        href={correctionUrl}
                        download
                        className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 font-bold text-slate-900 hover:bg-yellow-400"
                      >
                        <Download size={17} />
                        Download
                      </a>

                    </div>

                  </div>

                  {/* CORRECTION IMAGE */}

                  {isCorrectionImage && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-yellow-200 bg-white p-3">

                      <img
                        src={correctionUrl}
                        alt="Tutor correction"
                        className="mx-auto max-h-[700px] w-auto max-w-full rounded-xl object-contain"
                      />

                    </div>
                  )}

                  {/* CORRECTION PDF */}

                  {isCorrectionPdf && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-yellow-200 bg-white">

                      <iframe
                        src={correctionUrl}
                        title="Tutor correction PDF"
                        className="h-[700px] w-full"
                      />

                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })}

      </div>
    )}

</div>
    </div>
  );
}
