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

type Lesson = {
  day: string;
  time: string;
};

type Schedule = {
  lesson1: Lesson;
  lesson2: Lesson;
  meetLink: string;
};

type Props = {
  studentId: string;
  subjects: Subject[];
  selectedSubjects: string[];
  assignments: Assignment[];
  tutors: Tutor[];
};

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timeSlots = [
  "10:00 AM - 11:30 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 1:30 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 3:30 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 5:30 PM",
  "4:00 PM - 6:00 PM",
  "5:00 PM - 6:30 PM",
  "5:00 PM - 7:00 PM",
];

const emptyLesson: Lesson = {
  day: "",
  time: "",
};

export default function StudentScheduleEditor({
  studentId,
  subjects,
  selectedSubjects,
  assignments,
  tutors,
}: Props) {
  const [schedules, setSchedules] = useState<Record<string, Schedule>>({});

  function getSchedule(subjectId: string): Schedule {
    return (
      schedules[subjectId] || {
        lesson1: { ...emptyLesson },
        lesson2: { ...emptyLesson },
        meetLink: "",
      }
    );
  }

  function updateLesson(
    subjectId: string,
    lesson: "lesson1" | "lesson2",
    field: "day" | "time",
    value: string
  ) {
    setSchedules((previous) => {
      const current = getSchedule(subjectId);

      return {
        ...previous,
        [subjectId]: {
          ...current,
          [lesson]: {
            ...current[lesson],
            [field]: value,
          },
        },
      };
    });
  }

  function updateMeetLink(
    subjectId: string,
    value: string
  ) {
    setSchedules((previous) => {
      const current = getSchedule(subjectId);

      return {
        ...previous,
        [subjectId]: {
          ...current,
          meetLink: value,
        },
      };
    });
  }

  return (
    <div className="md:col-span-2 mt-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Student Schedule
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Assign one or two lesson days, lesson times and a Google Meet link for each subject.
        </p>
      </div>

      {selectedSubjects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-slate-500">
            Select subjects above to create the student schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {selectedSubjects.map((subjectName) => {
            const subject = subjects.find(
              (item) => item.name === subjectName
            );

            if (!subject) return null;

            const assignment = assignments.find(
              (item) => item.subject_id === subject.id
            );

            const tutor = tutors.find(
              (item) => item.id === assignment?.tutor_id
            );

            const schedule = getSchedule(subject.id);

            return (
              <div
                key={subject.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    {subject.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    Tutor:{" "}
                    <span className="font-semibold text-slate-800">
                      {tutor?.full_name ?? "No tutor assigned"}
                    </span>
                  </p>
                </div>

                {/* LESSON 1 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <h4 className="mb-4 font-bold text-slate-800">
                    Lesson 1
                  </h4>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Lesson Day
                      </label>

                      <select
                        value={schedule.lesson1.day}
                        onChange={(e) =>
                          updateLesson(
                            subject.id,
                            "lesson1",
                            "day",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-yellow-500"
                      >
                        <option value="">
                          Select Day
                        </option>

                        {days.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Lesson Time
                      </label>

                      <select
                        value={schedule.lesson1.time}
                        onChange={(e) =>
                          updateLesson(
                            subject.id,
                            "lesson1",
                            "time",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-yellow-500"
                      >
                        <option value="">
                          Select Time
                        </option>

                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* LESSON 2 */}
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-5">
                  <h4 className="mb-1 font-bold text-slate-800">
                    Lesson 2
                  </h4>

                  <p className="mb-4 text-xs text-slate-500">
                    Optional — use this if the subject is taught twice per week.
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Second Lesson Day
                      </label>

                      <select
                        value={schedule.lesson2.day}
                        onChange={(e) =>
                          updateLesson(
                            subject.id,
                            "lesson2",
                            "day",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-yellow-500"
                      >
                        <option value="">
                          Optional — Select Day
                        </option>

                        {days.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Second Lesson Time
                      </label>

                      <select
                        value={schedule.lesson2.time}
                        onChange={(e) =>
                          updateLesson(
                            subject.id,
                            "lesson2",
                            "time",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-yellow-500"
                      >
                        <option value="">
                          Optional — Select Time
                        </option>

                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* GOOGLE MEET */}
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Google Meet Link
                  </label>

                  <input
                    type="url"
                    value={schedule.meetLink}
                    onChange={(e) =>
                      updateMeetLink(
                        subject.id,
                        e.target.value
                      )
                    }
                    placeholder="https://meet.google.com/..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Paste the Google Meet link students will use for this subject.
                  </p>
                </div>

                {/* SUMMARY */}
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Student ID: {studentId}
                  </p>

                  <p className="mt-2 text-sm text-slate-700">
                    Lesson 1:{" "}
                    <span className="font-semibold">
                      {schedule.lesson1.day || "Day not selected"}
                      {schedule.lesson1.time
                        ? ` — ${schedule.lesson1.time}`
                        : ""}
                    </span>
                  </p>

                  {schedule.lesson2.day && (
                    <p className="mt-1 text-sm text-slate-700">
                      Lesson 2:{" "}
                      <span className="font-semibold">
                        {schedule.lesson2.day}
                        {schedule.lesson2.time
                          ? ` — ${schedule.lesson2.time}`
                          : ""}
                      </span>
                    </p>
                  )}

                  {schedule.meetLink && (
                    <p className="mt-1 truncate text-sm text-blue-600">
                      Meet: {schedule.meetLink}
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
```
