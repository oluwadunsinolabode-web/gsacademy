"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Upload,
  FileText,
  ImageIcon,
  BookOpen,
  CheckCircle,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

/* =====================================================
   TYPES
===================================================== */

type Subject = {
  id: string;
  name: string;
};

type TutorAssignment = {
  id: string;
  student_id: string;
  subject_id: string;
  subjects:
    | Subject
    | Subject[]
    | null;
};

type Student = {
  id: string;
  full_name: string | null;
};

type AssignmentOption = {
  student: Student;
  subjects: Subject[];
};

type LessonResource = {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: string;
  title: string;
  file_name: string | null;
  file_url: string;
  file_path: string | null;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
};

/* =====================================================
   HELPERS
===================================================== */

function getSubject(
  subjects:
    | Subject
    | Subject[]
    | null
): Subject | null {
  if (!subjects) {
    return null;
  }

  if (Array.isArray(subjects)) {
    return subjects[0] || null;
  }

  return subjects;
}

/* =====================================================
   PAGE
===================================================== */

export default function TutorResourcesPage() {
  /* ===================================================
     DATA
  =================================================== */

  const [assignmentOptions, setAssignmentOptions] =
    useState<AssignmentOption[]>([]);

  const [resources, setResources] =
    useState<LessonResource[]>([]);

  /* ===================================================
     UI
  =================================================== */

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  /* ===================================================
     FORM
  =================================================== */

  const [selectedStudentId, setSelectedStudentId] =
    useState("");

  const [selectedSubject, setSelectedSubject] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  /* ===================================================
     LOAD
  =================================================== */

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    try {
      setLoading(true);
      setError("");

      /* ===============================================
         AUTH
      =============================================== */

      const {
        data: { user },
        error: authError,
      } =
        await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "You must be logged in as a tutor."
        );
      }

      /* ===============================================
         GET TUTOR
      =============================================== */

      const {
        data: tutorData,
        error: tutorError,
      } =
        await supabase
          .from("tutors")
          .select(
            "id, full_name"
          )
          .eq(
            "auth_id",
            user.id
          )
          .single();

      if (
        tutorError ||
        !tutorData
      ) {
        throw new Error(
          tutorError?.message ||
            "Tutor profile could not be found."
        );
      }

      /* ===============================================
         GET TUTOR ASSIGNMENTS
      =============================================== */

      const {
        data: assignmentData,
        error: assignmentError,
      } =
        await supabase
          .from("tutor_assignments")
          .select(
            `
              id,
              student_id,
              subject_id,

              subjects (
                id,
                name
              )
            `
          )
          .eq(
            "tutor_id",
            tutorData.id
          )
          .eq(
            "active",
            true
          )
          .eq(
            "status",
            "Scheduled"
          );

      if (assignmentError) {
        throw new Error(
          assignmentError.message
        );
      }

      const assignments =
        (assignmentData || []) as TutorAssignment[];

      if (
        assignments.length === 0
      ) {
        setAssignmentOptions([]);
        setResources([]);
        return;
      }

      /* ===============================================
         GET STUDENTS
      =============================================== */

      const studentIds = [
        ...new Set(
          assignments.map(
            (item) =>
              item.student_id
          )
        ),
      ];

      const {
        data: studentData,
        error: studentError,
      } =
        await supabase
          .from("students")
          .select(
            `
              id,
              full_name
            `
          )
          .in(
            "id",
            studentIds
          );

      if (studentError) {
        throw new Error(
          studentError.message
        );
      }

      const students =
        (studentData || []) as Student[];

      /* ===============================================
         BUILD STUDENT + SUBJECT OPTIONS
      =============================================== */

      const studentMap =
        new Map<string, Student>();

      students.forEach(
        (student) => {
          studentMap.set(
            student.id,
            student
          );
        }
      );

      const optionsMap =
        new Map<
          string,
          AssignmentOption
        >();

      assignments.forEach(
        (assignment) => {
          const student =
            studentMap.get(
              assignment.student_id
            );

          const subject =
            getSubject(
              assignment.subjects
            );

          if (
            !student ||
            !subject
          ) {
            return;
          }

          if (
            !optionsMap.has(
              student.id
            )
          ) {
            optionsMap.set(
              student.id,
              {
                student,
                subjects: [],
              }
            );
          }

          const option =
            optionsMap.get(
              student.id
            )!;

          const alreadyExists =
            option.subjects.some(
              (item) =>
                item.id ===
                subject.id
            );

          if (
            !alreadyExists
          ) {
            option.subjects.push(
              subject
            );
          }
        }
      );

      const options =
        Array.from(
          optionsMap.values()
        ).sort(
          (a, b) =>
            (a.student.full_name || "")
              .localeCompare(
                b.student.full_name || ""
              )
        );

      setAssignmentOptions(
        options
      );

      /* ===============================================
         DEFAULT STUDENT
      =============================================== */

      if (
        options.length > 0
      ) {
        const firstStudent =
          options[0];

        setSelectedStudentId(
          firstStudent.student.id
        );

        if (
          firstStudent.subjects
            .length > 0
        ) {
          setSelectedSubject(
            firstStudent.subjects[0]
              .name
          );
        }
      }

      /* ===============================================
         LOAD EXISTING RESOURCES
      =============================================== */

      const {
        data: resourceData,
        error: resourceError,
      } =
        await supabase
          .from("lesson_resources")
          .select(
            `
              id,
              student_id,
              tutor_id,
              subject,
              title,
              file_name,
              file_url,
              file_path,
              file_type,
              file_size,
              created_at
            `
          )
          .eq(
            "tutor_id",
            tutorData.id
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      if (resourceError) {
        throw new Error(
          resourceError.message
        );
      }

      setResources(
        (resourceData || []) as LessonResource[]
      );
    } catch (err) {
      console.error(
        "TUTOR RESOURCES ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load resources."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     SELECTED STUDENT
  ===================================================== */

  const selectedOption =
    useMemo(() => {
      return assignmentOptions.find(
        (option) =>
          option.student.id ===
          selectedStudentId
      );
    }, [
      assignmentOptions,
      selectedStudentId,
    ]);

  /* =====================================================
     STUDENT CHANGE
  ===================================================== */

  function handleStudentChange(
    studentId: string
  ) {
    setSelectedStudentId(
      studentId
    );

    const option =
      assignmentOptions.find(
        (item) =>
          item.student.id ===
          studentId
      );

    if (
      option &&
      option.subjects.length > 0
    ) {
      setSelectedSubject(
        option.subjects[0].name
      );
    } else {
      setSelectedSubject("");
    }

    setMessage("");
    setError("");
  }

  /* =====================================================
     FILE ICON
  ===================================================== */

  function getFileIcon(
    fileType: string | null
  ) {
    if (
      fileType?.startsWith(
        "image/"
      )
    ) {
      return (
        <ImageIcon
          size={24}
          className="text-yellow-600"
        />
      );
    }

    return (
      <FileText
        size={24}
        className="text-yellow-600"
      />
    );
  }

  /* =====================================================
     FILE SIZE
  ===================================================== */

  function formatFileSize(
    bytes: number | null
  ) {
    if (!bytes) {
      return "";
    }

    if (
      bytes <
      1024
    ) {
      return `${bytes} B`;
    }

    if (
      bytes <
      1024 * 1024
    ) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  /* =====================================================
     UPLOAD RESOURCE
  ===================================================== */

  async function handleUpload() {
    try {
      setUploading(true);
      setError("");
      setMessage("");

      /* ===============================================
         VALIDATION
      =============================================== */

      if (
        !selectedStudentId
      ) {
        throw new Error(
          "Please select a student."
        );
      }

      if (
        !selectedSubject
      ) {
        throw new Error(
          "Please select a subject."
        );
      }

      if (
        !title.trim()
      ) {
        throw new Error(
          "Please enter a resource title."
        );
      }

      if (!file) {
        throw new Error(
          "Please choose a file."
        );
      }

      /* ===============================================
         AUTH
      =============================================== */

      const {
        data: { user },
        error: authError,
      } =
        await supabase.auth.getUser();

      if (
        authError ||
        !user
      ) {
        throw new Error(
          "You must be logged in as a tutor."
        );
      }

      /* ===============================================
         GET TUTOR
      =============================================== */

      const {
        data: tutorData,
        error: tutorError,
      } =
        await supabase
          .from("tutors")
          .select("id")
          .eq(
            "auth_id",
            user.id
          )
          .single();

      if (
        tutorError ||
        !tutorData
      ) {
        throw new Error(
          tutorError?.message ||
            "Tutor profile could not be found."
        );
      }

      /* ===============================================
         VERIFY ASSIGNMENT
      =============================================== */

      const {
        data: assignmentData,
        error: assignmentError,
      } =
        await supabase
          .from("tutor_assignments")
          .select(
            `
              id,
              subjects (
                id,
                name
              )
            `
          )
          .eq(
            "tutor_id",
            tutorData.id
          )
          .eq(
            "student_id",
            selectedStudentId
          )
          .eq(
            "active",
            true
          )
          .eq(
            "status",
            "Scheduled"
          );

      if (
        assignmentError
      ) {
        throw new Error(
          assignmentError.message
        );
      }

      const canTeachSubject =
        (
          assignmentData ||
          []
        ).some(
          (assignment: any) => {
            const subject =
              getSubject(
                assignment.subjects
              );

            return (
              subject?.name
                ?.trim()
                .toLowerCase() ===
              selectedSubject
                .trim()
                .toLowerCase()
            );
          }
        );

      if (
        !canTeachSubject
      ) {
        throw new Error(
          "You are not assigned to teach this subject for this student."
        );
      }

      /* ===============================================
         FILE VALIDATION
      =============================================== */

      const maxSize =
        20 * 1024 * 1024;

      if (
        file.size >
        maxSize
      ) {
        throw new Error(
          "Resource file cannot be larger than 20MB."
        );
      }

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        file.type &&
        !allowedTypes.includes(
          file.type
        )
      ) {
        throw new Error(
          "Please upload PDF, DOC, DOCX, PPT, PPTX, JPG, PNG or WEBP."
        );
      }

      /* ===============================================
         SAFE FILE NAME
      =============================================== */

      const safeFileName =
        file.name
          .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
          )
          .replace(
            /\s+/g,
            "_"
          );

      /* ===============================================
         UPLOAD
      =============================================== */

      const filePath =
        `lesson-resources/${tutorData.id}/${selectedStudentId}/${selectedSubject.replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        )}/${crypto.randomUUID()}-${safeFileName}`;

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from(
            "classwork-submissions"
          )
          .upload(
            filePath,
            file,
            {
              cacheControl:
                "3600",
              upsert: false,
              contentType:
                file.type ||
                undefined,
            }
          );

      if (
        uploadError
      ) {
        throw new Error(
          `File upload failed: ${uploadError.message}`
        );
      }

      /* ===============================================
         PUBLIC URL
      =============================================== */

      const {
        data: publicUrlData,
      } =
        supabase.storage
          .from(
            "classwork-submissions"
          )
          .getPublicUrl(
            filePath
          );

      const fileUrl =
        publicUrlData.publicUrl;

      /* ===============================================
         INSERT RESOURCE
      =============================================== */

      const {
        error: insertError,
      } =
        await supabase
          .from(
            "lesson_resources"
          )
          .insert({
            student_id:
              selectedStudentId,

            tutor_id:
              tutorData.id,

            subject:
              selectedSubject,

            title:
              title.trim(),

            file_name:
              file.name,

            file_url:
              fileUrl,

            file_path:
              filePath,

            file_type:
              file.type ||
              null,

            file_size:
              file.size,
          });

      if (
        insertError
      ) {
        /* =============================================
           CLEAN UP FILE IF DATABASE INSERT FAILS
        ============================================= */

        await supabase.storage
          .from(
            "classwork-submissions"
          )
          .remove([
            filePath,
          ]);

        throw new Error(
          insertError.message
        );
      }

      /* ===============================================
         SUCCESS
      =============================================== */

      setMessage(
        `Resource published successfully for ${selectedOption?.student.full_name || "the student"} — ${selectedSubject}.`
      );

      setTitle("");
      setDescription("");
      setFile(null);

      const fileInput =
        document.getElementById(
          "resource-file"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      await loadPage();
    } catch (err) {
      console.error(
        "RESOURCE UPLOAD ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to publish resource."
      );
    } finally {
      setUploading(false);
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2
              size={22}
              className="animate-spin"
            />

            <p className="font-semibold">
              Loading your students and subjects...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="mx-auto max-w-7xl">

      {/* =================================================
          HEADER
      ================================================= */}

      <h1 className="text-4xl font-extrabold text-slate-900">
        Learning Resources
      </h1>

      <p className="mt-3 text-slate-600">
        Upload learning materials for a specific
        student and subject.
      </p>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">

          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p className="font-semibold">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="rounded-lg p-1 hover:bg-red-100"
          >
            <X size={18} />
          </button>

        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {message && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-700">

          <CheckCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <p className="font-semibold">
            {message}
          </p>

        </div>
      )}

      {assignmentOptions.length === 0 ? (

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">

          <BookOpen
            size={44}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No assigned students
          </h2>

          <p className="mt-2 text-slate-500">
            You currently have no active scheduled
            student assignments.
          </p>

        </div>

      ) : (

        <div className="mt-10 grid gap-8 lg:grid-cols-2">

          {/* =============================================
              UPLOAD
          ============================================= */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold text-slate-900">
              Upload Resource
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Choose the student and subject that
              should receive this resource.
            </p>

            <div className="mt-8 space-y-6">

              {/* STUDENT */}

              <div>

                <label className="font-semibold text-slate-700">
                  Student
                </label>

                <select
                  value={
                    selectedStudentId
                  }
                  onChange={(e) =>
                    handleStudentChange(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-5 py-4 font-semibold text-slate-900 focus:border-yellow-500 focus:outline-none"
                >

                  {assignmentOptions.map(
                    (option) => (
                      <option
                        key={
                          option.student.id
                        }
                        value={
                          option.student.id
                        }
                      >
                        {option.student.full_name ||
                          "Unnamed Student"}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* SUBJECT */}

              <div>

                <label className="font-semibold text-slate-700">
                  Subject
                </label>

                <select
                  value={
                    selectedSubject
                  }
                  onChange={(e) =>
                    setSelectedSubject(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-5 py-4 font-semibold text-slate-900 focus:border-yellow-500 focus:outline-none"
                >

                  {(
                    selectedOption?.subjects ||
                    []
                  ).map(
                    (subject) => (
                      <option
                        key={
                          subject.id
                        }
                        value={
                          subject.name
                        }
                      >
                        {subject.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* TITLE */}

              <div>

                <label className="font-semibold text-slate-700">
                  Resource Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="Example: Algebra Formula Sheet"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-5 py-4 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-100"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="font-semibold text-slate-700">
                  Description
                  <span className="ml-2 font-normal text-slate-400">
                    Optional
                  </span>
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Brief description..."
                  className="mt-2 w-full rounded-xl border border-slate-300 px-5 py-4 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-100"
                />

              </div>

              {/* FILE */}

              <div>

                <label className="font-semibold text-slate-700">
                  Upload File
                </label>

                <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-yellow-500 bg-slate-50 p-10 text-center transition hover:bg-yellow-50">

                  <Upload
                    size={40}
                    className="text-yellow-600"
                  />

                  <p className="mt-4 font-semibold text-slate-900">
                    Click to choose file
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    PDF, Images, DOCX, PPTX
                    · Maximum 20MB
                  </p>

                  <input
                    id="resource-file"
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                    onChange={(e) =>
                      setFile(
                        e.target.files?.[0] ||
                          null
                      )
                    }
                  />

                </label>

                {file && (
                  <div className="mt-4 rounded-xl bg-green-50 p-4">

                    <p className="font-semibold text-green-700">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-green-600">
                      {formatFileSize(
                        file.size
                      )}
                    </p>

                  </div>
                )}

              </div>

              {/* PUBLISH */}

              <button
                type="button"
                onClick={
                  handleUpload
                }
                disabled={
                  uploading ||
                  !selectedStudentId ||
                  !selectedSubject
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 py-4 font-bold text-slate-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {uploading && (
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                )}

                {uploading
                  ? "Publishing..."
                  : "Publish Resource"}

              </button>

            </div>
          </div>

          {/* =============================================
              PUBLISHED RESOURCES
          ============================================= */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold text-slate-900">
              Published Resources
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Resources you have uploaded.
            </p>

            <div className="mt-8 space-y-4">

              {resources.length === 0 ? (

                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">

                  <BookOpen
                    size={38}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 font-semibold text-slate-600">
                    No resources uploaded yet.
                  </p>

                </div>

              ) : (

                resources.map(
                  (resource) => {

                    const studentName =
                      assignmentOptions.find(
                        (option) =>
                          option.student.id ===
                          resource.student_id
                      )?.student.full_name ||
                      "Student";

                    return (
                      <div
                        key={
                          resource.id
                        }
                        className="rounded-2xl border border-slate-200 p-5"
                      >

                        <div className="flex items-start gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-100">
                            {getFileIcon(
                              resource.file_type
                            )}
                          </div>

                          <div className="min-w-0">

                            <h3 className="break-words font-bold text-slate-900">
                              {resource.title}
                            </h3>

                            <p className="mt-1 text-sm font-semibold text-yellow-600">
                              {resource.subject}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {studentName}
                            </p>

                            <p className="mt-2 break-all text-xs text-slate-400">
                              {resource.file_name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {new Date(
                                resource.created_at
                              ).toLocaleDateString()}
                              {resource.file_size
                                ? ` · ${formatFileSize(
                                    resource.file_size
                                  )}`
                                : ""}
                            </p>

                            <a
                              href={
                                resource.file_url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-block text-sm font-bold text-slate-900 hover:text-yellow-600"
                            >
                              Open Document →
                            </a>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )

              )}

            </div>
          </div>

        </div>
      )}

      {/* =================================================
          INFO
      ================================================= */}

      <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <CheckCircle
            className="text-green-600"
            size={28}
          />

          <div>

            <h3 className="font-bold text-slate-900">
              Subject-specific resources
            </h3>

            <p className="text-slate-600">
              Each resource is saved against the selected
              student and subject, so students only see
              resources intended for them.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}