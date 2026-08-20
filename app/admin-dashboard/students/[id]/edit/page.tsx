"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTutors } from "@/lib/services/tutor";
import StudentScheduleEditor from "@/components/admin/student-schedule-editor";

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();

  const studentId = params.id as string;

  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  const [country, setCountry] = useState("Nigeria");
  const [academicLevel, setAcademicLevel] = useState("");
  const [studentPackage, setStudentPackage] = useState("");
  const [googleMeetLink, setGoogleMeetLink] = useState("");

  // All subjects from database
  const [subjects, setSubjects] = useState<any[]>([]);

  const [studentSchedules, setStudentSchedules] = useState<any[]>([]);

  // Subjects student takes
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // All tutors
  const [tutors, setTutors] = useState<any[]>([]);

  // Stores:
  // {
  //   subject_id: "123",
  //   tutor_id: "456"
  // }
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // ==========================================
        // 1. LOAD TUTORS
        // ==========================================

        const { data: tutorData, error: tutorError } =
          await getTutors();

        console.log("TUTOR DATA:", tutorData);
        console.log("TUTOR ERROR:", tutorError);

        if (tutorError) {
          console.error(
            "FAILED TO LOAD TUTORS:",
            tutorError
          );
        }

        if (tutorData) {
          setTutors(tutorData);
        }

        // ==========================================
        // 2. LOAD SUBJECTS
        // ==========================================

        const subjectResponse = await fetch(
          "/api/admin/subjects"
        );

        const subjectData =
          await subjectResponse.json();

        const subjectList = Array.isArray(subjectData)
          ? subjectData
          : subjectData.subjects || [];

        setSubjects(subjectList);

        // ==========================================
        // 3. LOAD STUDENT
        // ==========================================

        const studentResponse = await fetch(
          `/api/admin/students/${studentId}`
        );

        const student = await studentResponse.json();

        if (!student) return;

        setStudentName(student.full_name || "");
        setEmail(student.email || "");
        setPhone(student.phone || "");
        setParentName(student.parent_name || "");
        setParentPhone(student.parent_phone || "");

        setCountry(student.country || "Nigeria");

        setAcademicLevel(
          student.academic_level || ""
        );

        setStudentPackage(
          student.package || ""
        );

        setGoogleMeetLink(
          student.google_meet_link || ""
        );

        // ==========================================
        // EXISTING TUTOR ASSIGNMENTS
        // ==========================================

        const existingAssignments =
          Array.isArray(student.tutor_assignments)
            ? student.tutor_assignments
            : [];

        setAssignments(existingAssignments);

        // ==========================================
        // CONVERT SUBJECT IDs TO SUBJECT NAMES
        // ==========================================

        const subjectNames =
          existingAssignments
            .map((assignment: any) => {
              const subject =
                subjectList.find(
                  (item: any) =>
                    item.id ===
                    assignment.subject_id
                );

              return subject?.name || null;
            })
            .filter(Boolean);

        setSelectedSubjects(subjectNames);
      } catch (error) {
        console.error(
          "EDIT STUDENT LOAD ERROR:",
          error
        );
      }
    }

    loadData();
  }, [studentId]);

  // ==========================================
  // TOGGLE SUBJECT
  // ==========================================

  function toggleSubject(subjectName: string) {
    setSelectedSubjects((previous) => {
      if (previous.includes(subjectName)) {
        return previous.filter(
          (item) => item !== subjectName
        );
      }

      return [
        ...previous,
        subjectName,
      ];
    });
  }

  // ==========================================
  // UPDATE TUTOR ASSIGNMENT
  // ==========================================

  function updateTutorAssignment(
    subjectId: string,
    tutorId: string
  ) {
    setAssignments((previous) => {
      const existing = previous.find(
        (item) =>
          item.subject_id === subjectId
      );

      // Existing assignment
      if (existing) {
        return previous.map((item) =>
          item.subject_id === subjectId
            ? {
                ...item,
                tutor_id: tutorId,
              }
            : item
        );
      }

      // New assignment
      return [
        ...previous,
        {
          subject_id: subjectId,
          tutor_id: tutorId,
        },
      ];
    });
  }

  // ==========================================
  // SAVE STUDENT
  // ==========================================

  async function handleSave() {
    try {
      if (!studentName) {
        alert(
          "Please enter the student's name."
        );
        return;
      }

      if (!email) {
        alert(
          "Please enter the student's email."
        );
        return;
      }

      console.log("Saving student...");
      console.log(
        "Assignments:",
        assignments
      );

      // ==========================================
      // STEP 1 — UPDATE STUDENT
      // ==========================================

      const response = await fetch(
        `/api/admin/students/${studentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: studentName,
            email,
            phone,
            parent_name: parentName,
            parent_phone: parentPhone,
            country,
            academic_level:
              academicLevel,
            package: studentPackage,
            subjects: selectedSubjects,
            google_meet_link:
              googleMeetLink,
          }),
        }
      );

      const result =
        await response.json();

      console.log("STEP 1:", result);

      if (!response.ok) {
        alert(
          result.error ||
            "Student update failed"
        );
        return;
      }

      // ==========================================
      // STEP 2 — SAVE TUTOR ASSIGNMENTS
      // ==========================================

      const assignmentResponse =
        await fetch(
          `/api/admin/students/${studentId}/assignments`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              assignments,
            }),
          }
        );

      const assignmentResult =
        await assignmentResponse.json();

      console.log(
        "STEP 2:",
        assignmentResult
      );

      if (!assignmentResponse.ok) {
        alert(
          assignmentResult.error ||
            "Assignment update failed"
        );
        return;
      }

      // ==========================================
      // STEP 3 — SAVE SCHEDULES
      // ==========================================

      const scheduleResponse =
        await fetch(
          `/api/admin/students/${studentId}/schedules`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              schedules:
                studentSchedules,
            }),
          }
        );

      const scheduleResult =
        await scheduleResponse.json();

      console.log(
        "STEP 3 SCHEDULE:",
        scheduleResult
      );

      if (!scheduleResponse.ok) {
        alert(
          scheduleResult.error ||
            "Schedule update failed"
        );
        return;
      }

      alert(
        "Student updated successfully."
      );

      router.push(
        "/admin-dashboard/students"
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Unexpected error occurred."
      );
    }
  }

  return (
    <div className="mx-auto max-w-4xl">

      <h1 className="text-4xl font-extrabold text-slate-900">
        Edit Student
      </h1>

      <p className="mt-3 text-slate-700">
        Update student information, subjects and tutor assignments.
      </p>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <div className="grid gap-6 md:grid-cols-2">

          {/* STUDENT NAME */}

          <input
            value={studentName}
            onChange={(e) =>
              setStudentName(e.target.value)
            }
            placeholder="Student Full Name"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

          {/* EMAIL */}

          <input
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Email Address"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

          {/* PHONE */}

          <input
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            placeholder="Student Phone"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

          {/* PARENT NAME */}

          <input
            value={parentName}
            onChange={(e) =>
              setParentName(e.target.value)
            }
            placeholder="Parent Name"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

          {/* PARENT PHONE */}

          <input
            value={parentPhone}
            onChange={(e) =>
              setParentPhone(e.target.value)
            }
            placeholder="Parent Phone"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

          {/* COUNTRY */}

          <select
            value={country}
            onChange={(e) =>
              setCountry(e.target.value)
            }
            className="rounded-xl border border-slate-300 px-5 py-4"
          >
            <option>Nigeria</option>
            <option>United Kingdom</option>
            <option>United States</option>
            <option>Canada</option>
            <option>Australia</option>
            <option>Other</option>
          </select>

          {/* ACADEMIC LEVEL */}

          <input
            value={academicLevel}
            onChange={(e) =>
              setAcademicLevel(
                e.target.value
              )
            }
            placeholder="Academic Level"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

          {/* PACKAGE */}

          <select
            value={studentPackage}
            onChange={(e) =>
              setStudentPackage(
                e.target.value
              )
            }
            className="rounded-xl border border-slate-300 px-5 py-4"
          >
            <option value="">
              Select Package
            </option>

            <option>
              Package 1 - Small Group
            </option>

            <option>
              Package 2 - Private Coaching
            </option>

            <option>
              Package 3 - Premium Coaching
            </option>

            <option>
              One-on-One Coaching
            </option>
          </select>

          {/* GOOGLE MEET */}

          <input
            value={googleMeetLink}
            onChange={(e) =>
              setGoogleMeetLink(
                e.target.value
              )
            }
            placeholder="Google Meet Link"
            className="rounded-xl border border-slate-300 px-5 py-4"
          />

          {/* SUBJECTS */}

          <div className="md:col-span-2 mt-6">

            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Select Subjects
            </h2>

            <div className="grid gap-3 md:grid-cols-3">

              {subjects.map(
                (subject) => (
                  <label
                    key={subject.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 p-4 hover:bg-slate-50"
                  >

                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(
                        subject.name
                      )}
                      onChange={() =>
                        toggleSubject(
                          subject.name
                        )
                      }
                    />

                    <span className="font-semibold text-slate-800">
                      {subject.name}
                    </span>

                  </label>
                )
              )}

            </div>

          </div>

        </div>

        {/* TUTOR ASSIGNMENT */}

        <div className="mt-10 space-y-4">

          <h2 className="text-xl font-bold text-slate-900">
            Assign Tutors to Subjects
          </h2>

          {selectedSubjects.length ===
            0 && (
            <p className="text-slate-600">
              No subjects assigned to this
              student.
            </p>
          )}

          {selectedSubjects.map(
            (subjectName) => {

              const subject =
                subjects.find(
                  (item: any) =>
                    item.name ===
                    subjectName
                );

              if (!subject) return null;

              const currentAssignment =
                assignments.find(
                  (item: any) =>
                    item.subject_id ===
                    subject.id
                );

              return (
                <div
                  key={subject.id}
                  className="grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-2"
                >

                  <div className="rounded-xl bg-slate-100 px-5 py-4 font-semibold">
                    {subject.name}
                  </div>

                  {/* TUTOR DROPDOWN */}

                  <select
                    value={
                      currentAssignment?.tutor_id ||
                      ""
                    }
                    onChange={(e) =>
                      updateTutorAssignment(
                        subject.id,
                        e.target.value
                      )
                    }
                    className="rounded-xl border border-slate-300 px-5 py-4"
                  >

                    <option value="">
                      Select Tutor
                    </option>

                    {tutors.map(
                      (tutor) => (
                        <option
                          key={tutor.id}
                          value={tutor.id}
                        >
                          {tutor.full_name}
                        </option>
                      )
                    )}

                  </select>

                </div>
              );
            }
          )}

          {/* SCHEDULE EDITOR */}

          <StudentScheduleEditor
            studentId={studentId}
            subjects={subjects}
            selectedSubjects={
              selectedSubjects
            }
            assignments={assignments}
            tutors={tutors}
            onSchedulesChange={
              setStudentSchedules
            }
          />

          {/* SAVE */}

          <button
            onClick={handleSave}
            className="mt-10 rounded-xl bg-yellow-500 px-10 py-4 font-bold text-slate-900 hover:bg-yellow-400"
          >
            Update Student
          </button>

        </div>

      </div>

    </div>
  );
}