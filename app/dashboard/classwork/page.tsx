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

export default function ClassworkPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [classwork, setClasswork] =
    useState<Classwork | null>(null);
  const [student, setStudent] =
    useState<Student | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  /*
   * SUBMIT CLASSWORK
   */
  async function upload() {
    if (files.length === 0) {
      setError(
        "Please select your classwork first."
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
       * UPLOAD EACH FILE
       */
      for (
        let i = 0;
        i < files.length;
        i++
      ) {
        const file = files[i];

        const safeFileName =
          file.name
            .replace(
              /[^a-zA-Z0-9._-]/g,
              "_"
            )
            .replace(/\s+/g, "_");

        const filePath =
          `students/${student.id}/classwork/${classwork.id}/${crypto.randomUUID()}-${safeFileName}`;

        /*
         * UPLOAD TO STORAGE
         */
        const {
          error: storageError,
        } = await supabase.storage
          .from(
            "classwork-submissions"
          )
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
          .from(
            "classwork-submissions"
          )
          .getPublicUrl(filePath);

        /*
         * SAVE SUBMISSION
         */
        const {
          error: dbError,
        } = await supabase
          .from(
            "classwork_submissions"
          )
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
              publicData.publicUrl,
          });

        if (dbError) {
          throw new Error(
            `Submission could not be saved: ${dbError.message}`
          );
        }

        setProgress(
          Math.round(
            ((i + 1) /
              files.length) *
              100
          )
        );
      }

      setFiles([]);
      setProgress(100);

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
  const attachmentUrl =
    classwork.attachment_url;

  const isImage =
    attachmentUrl &&
    /\.(jpg|jpeg|png|gif|webp)$/i.test(
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

            <div className="flex flex-wrap gap-3">

              <a
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
              >
                <ExternalLink size={18} />
                Open File
              </a>

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

          {/* IMAGE PREVIEW */}

          {isImage ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">

              <img
                src={attachmentUrl}
                alt="Classwork uploaded by tutor"
                className="max-h-[700px] w-full rounded-xl object-contain"
              />

            </div>
          ) : (
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
                Click "Open File" to view the
                document.
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

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 p-5 font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {message && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-green-50 p-5 shadow-sm">

          <CheckCircle
            className="shrink-0 text-green-600"
            size={25}
          />

          <p className="font-semibold text-green-700">
            {message}
          </p>

        </div>
      )}

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
          files.length === 0
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

    </div>
  );
}
