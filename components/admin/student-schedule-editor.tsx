"use client";

import { useState } from "react";

type Subject = {
  id: string;
  name: string;
};

type Assignment = {
  subject_id: string;
  tutor_id: string;
};

type Tutor = {
  id: string;
  full_name: string;
};

type Props = {
  studentId: string;
  subjects: Subject[];
  selectedSubjects: string[];
  assignments: Assignment[];
  tutors: Tutor[];
};

export default function StudentScheduleEditor({
  studentId,
  subjects,
  selectedSubjects,
  assignments,
  tutors,
}: Props) {
  const [schedules, setSchedules] = useState<
    Record<
      string,
      {
        day: string;
        time: string;
        meetLink: string;
      }
    >
  >({});

  function updateSchedule(
    subjectId: string,
    field: "day" | "time" | "meetLink",
    value: string
  ) {
    setSchedules((previous) => ({
      ...previous,
      [subjectId]: {
        day: previous[subjectId]?.day || "",
        time: previous[subjectId]?.time || "",
        meetLink: previous[subjectId]?.meetLink || "",
        [field]: value,
      },
    }));
  }

  return (
    <div className="md:col-span-2 mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h2 className="text-2xl font-bold text-slate-900">
        Student Schedule
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        Set the lesson day, time and Google Meet link for each subject.
      </p>

      {selectedSubjects.length === 0 ? (
        <p className="mt-6 text-slate-500">
          No subjects selected.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {selectedSubjects.map((subjectName) => {
            const subject = subjects.find(
              (s) => s.name === subjectName
            );

            if (!subject) return null;

            const assignment = assignments.find(
              (a) => a.subject_id === subject.id
            );

            const tutor = tutors.find(
              (t) => t.id === assignment?.tutor_id
            );

            const schedule = schedules[subject.id] || {
              day: "",
              time: "",
              meetLink: "",
            };

            return (
              <div
                key={subject.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-slate-900">
                    {subject.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    Tutor:{" "}
                    <span className="font-semibold">
                      {tutor?.full_name ?? "No tutor assigned"}
                    </span>
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Day */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Lesson Day
                    </label>

                    <select
                      value={schedule.day}
                      onChange={(e) =>
                        updateSchedule(
                          subject.id,
                          "day",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                    >
                      <option value="">
                        Select Day
                      </option>
                      <option value="Monday">
                        Monday
                      </option>
                      <option value="Tuesday">
                        Tuesday
                      </option>
                      <option value="Wednesday">
                        Wednesday
                      </option>
                      <option value="Thursday">
                        Thursday
                      </option>
                      <option value="Friday">
                        Friday
                      </option>
                      <option value="Saturday">
                        Saturday
                      </option>
                      <option value="Sunday">
                        Sunday
                      </option>
                    </select>
                  </div>

                  {/* Time */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Lesson Time
                    </label>

                    <input
                      type="time"
                      value={schedule.time}
                      onChange={(e) =>
                        updateSchedule(
                          subject.id,
                          "time",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                    />
                  </div>

                  {/* Google Meet */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Google Meet Link
                    </label>

                    <input
                      type="url"
                      value={schedule.meetLink}
                      onChange={(e) =>
                        updateSchedule(
                          subject.id,
                          "meetLink",
                          e.target.value
                        )
                      }
                      placeholder="https://meet.google.com/..."
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Paste the Google Meet link students will use for this lesson.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Student ID: {studentId}
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    Schedule:{" "}
                    <span className="font-semibold">
                      {schedule.day || "Day not selected"}
                      {schedule.time
                        ? ` at ${schedule.time}`
                        : ""}
                    </span>
                  </p>

                  {schedule.meetLink && (
                    <p className="mt-1 truncate text-sm text-slate-700">
                      Meet:{" "}
                      <span className="font-medium text-blue-600">
                        {schedule.meetLink}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}