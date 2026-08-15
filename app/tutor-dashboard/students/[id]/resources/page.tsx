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
  Download,
  History,
  Search,
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
     UPLOAD FORM
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
     HISTORY FILTERS
  =================================================== */

  const [historyStudentId, setHistoryStudentId] =
    useState("all");

  const [historySubject, setHistorySubject] =
    useState("all");

  /* ===================================================
     LOAD PAGE
  =================================================== */

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage(
    preserveSelection = true
  ) {
    try {
      setLoading(true);
      setError("");

      /* ===============================================
         REMEMBER CURRENT SELECTION
      =============================================== */

      const previousStudentId =
        selectedStudentId;

      const previousSubject =
        selectedSubject;

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

      /* ===============================================
         GET RESOURCES FIRST
         
         This is important because old resources should
         remain visible in history.
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

      const loadedResources =
        (resourceData || []) as LessonResource[];

      setResources(
        loadedResources
      );

      /* ===============================================
         GET STUDENT IDS
         
         Include students from both:
         1. current assignments
         2. previous resources
         
         This prevents old history from disappearing
         simply because an assignment is no longer active.
      =============================================== */

      const studentIds = [
        ...new Set([
          ...assignments.map(
            (item) =>
              item.student_id
          ),
          ...loadedResources.map(
            (item) =>
              item.student_id
          ),
        ]),
      ];

      if (
        studentIds.length === 0
      ) {
        setAssignmentOptions([]);
        return;
      }

      /* ===============================================
         GET STUDENTS
      =============================================== */

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
         BUILD STUDENT MAP
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

      /* ===============================================
         BUILD CURRENT ASSIGNMENT OPTIONS
      =============================================== */

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

      /* ===============================================
         IMPORTANT:
         ADD STUDENTS FROM HISTORY IF THEY ARE NOT
         CURRENTLY IN ACTIVE ASSIGNMENTS
      =============================================== */

      loadedResources.forEach(
        (resource) => {
          const student =
            studentMap.get(
              resource.student_id
            );

          if (!student) {
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
        }
      );

      const options =
        Array.from(
          optionsMap.values()
        ).sort(
          (a, b) =>
            (
              a.student.full_name ||
              ""
            ).localeCompare(
              b.student.full_name ||
                ""
            )
        );

      setAssignmentOptions(
        options
      );

      /* ===============================================
         RESTORE UPLOAD SELECTION
      =============================================== */

      if (
        preserveSelection &&
        previousStudentId &&
        options.some(
          (option) =>
            option.student.id ===
            previousStudentId
        )
      ) {
        setSelectedStudentId(
          previousStudentId
        );

        const selectedOption =
          options.find(
            (option) =>
              option.student.id ===
              previousStudentId
          );

        const subjectStillExists =
          selectedOption?.subjects.some(
            (subject) =>
              subject.name ===
              previousSubject
          );

        if (
          previousSubject &&
          subjectStillExists
        ) {
          setSelectedSubject(
            previousSubject
          );
        } else {
          setSelectedSubject(
            selectedOption
              ?.subjects[0]
              ?.name || ""
          );
        }
      } else if (
        options.length > 0
      ) {
        const firstStudent =
          options[0];

        setSelectedStudentId(
          firstStudent.student.id
        );

        setSelectedSubject(
          firstStudent.subjects[0]
            ?.name || ""
        );
      }

      /* ===============================================
         RESTORE HISTORY STUDENT FILTER
      =============================================== */

      if (
        historyStudentId !== "all" &&
        !options.some(
          (option) =>
            option.student.id ===
            historyStudentId
        )
      ) {
        setHistoryStudentId(
          "all"
        );
      }
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

  /* ===================================================
     SELECTED STUDENT
  =================================================== */

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

  /* ===================================================
     HANDLE STUDENT CHANGE
  =================================================== */

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
      /*
        If this student exists only in history,
        choose their previous resource subject.
      */

      const historicalResource =
        resources.find(
          (resource) =>
            resource.student_id ===
            studentId
        );

      setSelectedSubject(
        historicalResource?.subject ||
          ""
      );
    }

    setMessage("");
    setError("");
  }

  /* ===================================================
     FILE ICON
  =================================================== */

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

  /* ===================================================
     FILE SIZE
  =================================================== */

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

  /* ===================================================
     GET STUDENT NAME
  =================================================== */

  function getStudentName(
    studentId: string
  ) {
    return (
      assignmentOptions.find(
        (option) =>
          option.student.id ===
          studentId
      )?.student.full_name ||
      "Student"
    );
  }

  /* ===================================================
     HISTORY SUBJECTS
  =================================================== */

  const historySubjects =
    useMemo(() => {
      const subjectSet =
        new Set<string>();

      resources.forEach(
        (resource) => {
          if (
            historyStudentId ===
              "all" ||
            resource.student_id ===
              historyStudentId
          ) {
            subjectSet.add(
              resource.subject
            );
          }
        }
      );

      return Array.from(
        subjectSet
      ).sort(
        (a, b) =>
          a.localeCompare(b)
      );
    }, [
      resources,
      historyStudentId,
    ]);

  /* ===================================================
     FILTER HISTORY
  =================================================== */

  const filteredHistory =
    useMemo(() => {
      return resources.filter(
        (resource) => {
          const studentMatches =
            historyStudentId ===
              "all" ||
            resource.student_id ===
              historyStudentId;

          const subjectMatches =
            historySubject ===
              "all" ||
            resource.subject ===
              historySubject;

          return (
            studentMatches &&
            subjectMatches
          );
        }
      );
    }, [
      resources,
      historyStudentId,
      historySubject,
    ]);

  /* ===================================================
     WHEN HISTORY STUDENT CHANGES
  =================================================== */

  function handleHistoryStudentChange(
    studentId: string
  ) {
    setHistoryStudentId(
      studentId
    );

    /*
      Reset subject filter because the
      available subjects may change.
    */
    setHistorySubject(
      "all"
    );
  }

  /* ===================================================
     DOWNLOAD RESOURCE
  =================================================== */

  async function handleDownload(
    resource: LessonResource
  ) {
    try {
      setError("");

      /*
        Prefer Supabase storage download when
        file_path exists.
      */

      if (
        resource.file_path
      ) {
        const {
          data,
          error: downloadError,
        } =
          await supabase.storage
            .from(
              "classwork-submissions"
            )
            .download(
              resource.file_path
            );

        if (
          downloadError ||
          !data
        ) {
          throw new Error(
            downloadError?.message ||
              "Unable to download file."
          );
        }

        const blobUrl =
          URL.createObjectURL(
            data
          );

        const link =
          document.createElement(
            "a"
          );

        link.href =
          blobUrl;

        link.download =
          resource.file_name ||
          resource.title;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(
          blobUrl
        );

        return;
      }

      /*
        Fallback for resources without
        a stored file path.
      */

      const link =
        document.createElement(
          "a"
        );

      link.href =
        resource.file_url;

      link.download =
        resource.file_name ||
        resource.title;

      link.target =
        "_blank";

      link.rel =
        "noopener noreferrer";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();
    } catch (err) {
      console.error(
        "RESOURCE DOWNLOAD ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to download resource."
      );
    }
  }

  /* ===================================================
     UPLOAD RESOURCE
  =================================================== */

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
        20 *
        1024 *
        1024;

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
         SAFE SUBJECT PATH
      =============================================== */

      const safeSubject =
        selectedSubject.replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );

      /* ===============================================
         FILE PATH
      =============================================== */

      const filePath =
        `lesson-resources/${tutorData.id}/${selectedStudentId}/${safeSubject}/${crypto.randomUUID()}-${safeFileName}`;

      /* ===============================================
         UPLOAD FILE
      =============================================== */

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
         INSERT DATABASE RECORD
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

      /* ===============================================
         CLEAN UP IF INSERT FAILS
      =============================================== */

      if (
        insertError
      ) {
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

      const sentToName =
        selectedOption?.student
          .full_name ||
        getStudentName(
          selectedStudentId
        );

      setMessage(
        `Resource published successfully for ${sentToName} — ${selectedSubject}.`
      );

      /*
        Clear only the upload-specific fields.

        DO NOT clear selected student.
        DO NOT clear selected subject.
      */

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

      /*
        IMPORTANT:
        Make history automatically focus on
        the student we just sent the resource to.
      */

      setHistoryStudentId(
        selectedStudentId
      );

      setHistorySubject(
        selectedSubject
      );

      /*
        Reload resources while preserving
        the current upload selection.
      */

      await loadPage(true);
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

  /* ===================================================
     LOADING
  =================================================== */

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
              Loading your students and resources...
            </p>

          </div>

        </div>

      </div>
    );
  }

  /* ===================================================
     PAGE
  =================================================== */

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
        student and subject, and keep track of
        everything you have already sent.
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

        <>
          {/* =================================================
              UPLOAD + CURRENT STUDENT
          ================================================= */}

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
                    value={
                      description
                    }
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
                QUICK HISTORY
            ============================================= */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">

                  <History
                    size={24}
                    className="text-slate-700"
                  />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-slate-900">
                    Sent History
                  </h2>

                  <p className="text-sm text-slate-500">
                    Check what you have already sent.
                  </p>

                </div>

              </div>

              {/* FILTERS */}

              <div className="mt-8 space-y-4">

                <div>

                  <label className="font-semibold text-slate-700">
                    Student
                  </label>

                  <select
                    value={
                      historyStudentId
                    }
                    onChange={(e) =>
                      handleHistoryStudentChange(
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 focus:border-yellow-500 focus:outline-none"
                  >

                    <option value="all">
                      All Students
                    </option>

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

                <div>

                  <label className="font-semibold text-slate-700">
                    Subject
                  </label>

                  <select
                    value={
                      historySubject
                    }
                    onChange={(e) =>
                      setHistorySubject(
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 focus:border-yellow-500 focus:outline-none"
                  >

                    <option value="all">
                      All Subjects
                    </option>

                    {historySubjects.map(
                      (subject) => (
                        <option
                          key={
                            subject
                          }
                          value={
                            subject
                          }
                        >
                          {subject}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              {/* RESULT COUNT */}

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-500">

                <Search
                  size={16}
                />

                {filteredHistory.length}{" "}
                resource
                {filteredHistory.length ===
                1
                  ? ""
                  : "s"} found

              </div>

              {/* HISTORY LIST */}

              <div className="mt-5 space-y-4">

                {filteredHistory.length ===
                0 ? (

                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">

                    <History
                      size={36}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-600">
                      No sent resources found.
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Resources you publish will
                      appear here.
                    </p>

                  </div>

                ) : (

                  filteredHistory
                    .slice(
                      0,
                      5
                    )
                    .map(
                      (resource) => (
                        <div
                          key={
                            resource.id
                          }
                          className="rounded-2xl border border-slate-200 p-4"
                        >

                          <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100">

                              {getFileIcon(
                                resource.file_type
                              )}

                            </div>

                            <div className="min-w-0 flex-1">

                              <h3 className="break-words font-bold text-slate-900">
                                {
                                  resource.title
                                }
                              </h3>

                              <p className="mt-1 text-sm font-bold text-yellow-600">
                                {
                                  resource.subject
                                }
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-600">
                                {
                                  getStudentName(
                                    resource.student_id
                                  )
                                }
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

                              <div className="mt-3 flex flex-wrap gap-2">

                                <a
                                  href={
                                    resource.file_url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                                >
                                  Open
                                </a>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownload(
                                      resource
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-500 px-3 py-2 text-xs font-bold text-slate-900 hover:bg-yellow-400"
                                >

                                  <Download
                                    size={14}
                                  />

                                  Download

                                </button>

                              </div>

                            </div>

                          </div>

                        </div>
                      )
                    )

                )}

              </div>

              {filteredHistory.length >
                5 && (
                <p className="mt-5 text-center text-xs font-semibold text-slate-400">
                  Showing the 5 most recent
                  resources. Use the filters above
                  to find a specific resource.
                </p>
              )}

            </div>

          </div>

          {/* =================================================
              FULL SENT HISTORY
          ================================================= */}

          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">

                  <History
                    size={24}
                    className="text-yellow-600"
                  />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-slate-900">
                    Complete Sent History
                  </h2>

                  <p className="text-sm text-slate-500">
                    Every learning resource you have
                    previously published.
                  </p>

                </div>

              </div>

              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                {filteredHistory.length} result
                {filteredHistory.length ===
                1
                  ? ""
                  : "s"}
              </div>

            </div>

            {/* FULL HISTORY */}

            <div className="mt-8 overflow-x-auto">

              {filteredHistory.length ===
              0 ? (

                <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">

                  <History
                    size={40}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 font-semibold text-slate-600">
                    No resources match your filters.
                  </p>

                </div>

              ) : (

                <div className="min-w-[760px]">

                  {/* TABLE HEADER */}

                  <div className="grid grid-cols-[1.5fr_1fr_1fr_1.2fr_1fr_auto] gap-4 border-b border-slate-200 px-4 pb-3 text-xs font-extrabold uppercase tracking-wide text-slate-400">

                    <span>
                      Resource
                    </span>

                    <span>
                      Student
                    </span>

                    <span>
                      Subject
                    </span>

                    <span>
                      File
                    </span>

                    <span>
                      Sent
                    </span>

                    <span>
                      Actions
                    </span>

                  </div>

                  {/* TABLE ROWS */}

                  <div className="divide-y divide-slate-100">

                    {filteredHistory.map(
                      (resource) => (

                        <div
                          key={
                            resource.id
                          }
                          className="grid grid-cols-[1.5fr_1fr_1fr_1.2fr_1fr_auto] items-center gap-4 px-4 py-5"
                        >

                          {/* RESOURCE */}

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100">

                              {getFileIcon(
                                resource.file_type
                              )}

                            </div>

                            <div className="min-w-0">

                              <p className="break-words font-bold text-slate-900">
                                {
                                  resource.title
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Resource ID:{" "}
                                {resource.id.slice(
                                  0,
                                  8
                                )}
                                ...
                              </p>

                            </div>

                          </div>

                          {/* STUDENT */}

                          <p className="break-words text-sm font-semibold text-slate-700">
                            {
                              getStudentName(
                                resource.student_id
                              )
                            }
                          </p>

                          {/* SUBJECT */}

                          <p className="text-sm font-bold text-yellow-600">
                            {
                              resource.subject
                            }
                          </p>

                          {/* FILE */}

                          <div className="min-w-0">

                            <p className="break-all text-sm font-medium text-slate-600">
                              {
                                resource.file_name ||
                                "Document"
                              }
                            </p>

                            {resource.file_size && (
                              <p className="mt-1 text-xs text-slate-400">
                                {
                                  formatFileSize(
                                    resource.file_size
                                  )
                                }
                              </p>
                            )}

                          </div>

                          {/* DATE */}

                          <p className="text-sm font-medium text-slate-500">

                            {new Date(
                              resource.created_at
                            ).toLocaleDateString()}

                          </p>

                          {/* ACTIONS */}

                          <div className="flex items-center gap-2">

                            <a
                              href={
                                resource.file_url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open document"
                              className="rounded-lg bg-slate-900 p-2 text-white transition hover:bg-slate-800"
                            >

                              <FileText
                                size={16}
                              />

                            </a>

                            <button
                              type="button"
                              onClick={() =>
                                handleDownload(
                                  resource
                                )
                              }
                              title="Download document"
                              className="rounded-lg bg-yellow-500 p-2 text-slate-900 transition hover:bg-yellow-400"
                            >

                              <Download
                                size={16}
                              />

                            </button>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            </div>

          </div>

        </>
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
              Each resource is saved against the
              selected student and subject. Students
              only see resources intended for them,
              while you can use Sent History to confirm
              exactly what you have already sent.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}