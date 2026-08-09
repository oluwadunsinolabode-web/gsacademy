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
   * Load classwork and student
   */
  useEffect(() => {
    async function loadClasswork() {
      try {
        setLoading(true);
        setError("");

        /*
         * Get the logged-in student.
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
         * Get the actual student record.
         *
         * IMPORTANT:
         * user.id is the Supabase Auth ID.
         * students.id is the student profile ID.
         *
         * We use auth_id to find the correct student.
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
         * Get classwork ID from URL.
         *
         * Example:
         *
         * /dashboard/classwork?id=CLASSWORK_ID
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
         * Get the classwork.
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
   * File previews
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
   * Clean up preview URLs
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
   * Add files
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
   * Remove file
   */
  const removeFile = (index: number) => {
    setFiles((previous) =>
      previous.filter(
        (_, i) => i !== index
      )
    );
  };

  /*
   * Submit classwork
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
       * Get logged-in auth user.
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
       * Make sure the student record belongs
       * to the logged-in user.
       */
      if (student.auth_id !== user.id) {
        throw new Error(
          "Student account verification failed."
        );
      }

      /*
       * Upload each selected file.
       */
      for (
        let i = 0;
        i < files.length;
        i++
      ) {
        const file = files[i];

        /*
         * Make filename safe.
         */
        const safeFileName =
          file.name
            .replace(
              /[^a-zA-Z0-9._-]/g,
              "_"
            )
            .replace(/\s+/g, "_");

        /*
         * Store files using the student's
         * profile ID and classwork ID.
         */
        const filePath =
          `students/${student.id}/classwork/${classwork.id}/${crypto.randomUUID()}-${safeFileName}`;

        /*
         * Upload file.
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
         * Get public URL.
         */
        const {
          data: publicData,
        } = supabase.storage
          .from(
            "classwork-submissions"
          )
          .getPublicUrl(filePath);

        /*
         * IMPORTANT:
         *
         * student_id = students.id
         *
         * NOT user.id.
         *
         * classwork_id = classworks.id
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

        /*
         * Update progress.
         */
        setProgress(
          Math.round(
            ((i + 1) /
              files.length) *
              100
          )
        );
      }

      /*
       * Finished successfully.
       */
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
   * Loading
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
   * Error loading classwork
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

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}

      <h1 className="text-4xl font-extrabold text-slate-900">
        Submit Classwork
      </h1>

      <p className="mt-3 text-slate-700">
        Upload your handwritten answers by
        taking a picture or selecting a file.
      </p>

      {/* Class Information */}

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

      {/* Error */}

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 p-5 font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Success */}

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

      {/* Upload Box */}

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

      {/* Preview */}

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

      {/* Progress */}

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

      {/* Submit */}

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