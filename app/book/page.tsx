"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ===========================
   COUNTRY LIST
=========================== */

const countries = [
  "Nigeria",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Other",
];

/* ===========================
   ACADEMIC LEVELS
=========================== */

const academicLevels: Record<string, string[]> = {
  Nigeria: [
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "Primary 4",
    "Primary 5",
    "Primary 6",
    "JSS 1",
    "JSS 2",
    "JSS 3",
    "SS 1",
    "SS 2",
    "SS 3",
  ],

  "United Kingdom": [
    "Year 1",
    "Year 2",
    "Year 3",
    "Year 4",
    "Year 5",
    "Year 6",
    "Year 7",
    "Year 8",
    "Year 9",
    "Year 10",
    "Year 11",
    "Year 12",
    "Year 13",
    "GCSE",
    "IGCSE",
    "A-Level",
  ],

  "United States": [
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "SAT",
    "AP",
  ],

  Canada: [
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
  ],

  Australia: [
    "Year 1",
    "Year 2",
    "Year 3",
    "Year 4",
    "Year 5",
    "Year 6",
    "Year 7",
    "Year 8",
    "Year 9",
    "Year 10",
    "Year 11",
    "Year 12",
  ],

  Other: [],
};

/* ===========================
   SUBJECTS
=========================== */

const subjects: Record<string, string[]> = {
  Nigeria: [
    "Mathematics",
    "English Language",
    "Physics",
    "Chemistry",
    "Biology",
  ],

  "United Kingdom": [
    "Mathematics",
    "Combined Science",
    "Physics",
    "Chemistry",
    "Biology",
  ],

  "United States": [
    "Mathematics",
    "General Science",
    "Physics",
    "Chemistry",
    "Biology",
  ],

  Canada: [
    "Mathematics",
    "Science",
    "Physics",
    "Chemistry",
    "Biology",
  ],

  Australia: [
    "Mathematics",
    "Science",
    "Physics",
    "Chemistry",
    "Biology",
  ],

  Other: [
    "Mathematics",
    "Science",
  ],
};

/* ===========================
   PACKAGE DEFINITIONS
=========================== */

const nigeriaPackages = [
  "Package 1 - Small Group",
  "Package 2 - Private Coaching",
  "Package 3 - Premium Coaching",
];

const internationalPackage =
  "One-on-One Coaching";
  /* ===========================
   PACKAGE RULES
=========================== */

const packageRules = {
  "Package 1 - Small Group": {
    allowSchedule: false,
    mathsLessons: 0,
    otherLessons: 0,
    maxDays: 0,
    maxPerDay: 0,
  },

  "Package 2 - Private Coaching": {
    allowSchedule: true,
    mathsLessons: 2,
    otherLessons: 1,
    maxDays: 3,
    maxPerDay: 3,
  },

  "Package 3 - Premium Coaching": {
    allowSchedule: true,
    mathsLessons: 2,
    otherLessons: 2,
    maxDays: 4,
    maxPerDay: 3,
  },

  "One-on-One Coaching": {
    allowSchedule: true,
    mathsLessons: 1,
    otherLessons: 1,
    maxDays: 5,
    maxPerDay: 1,
  },
};

/* ===========================
   LESSON DAYS
=========================== */

const lessonDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/* ===========================
   TIME SLOTS
=========================== */

const timeSlots = [
  "10:00 AM - 12:00 PM",
  "11:00 AM - 1:00 PM",
  "12:00 PM - 2:00 PM",
  "1:00 PM - 3:00 PM",
  "2:00 PM - 4:00 PM",
  "3:00 PM - 5:00 PM",
  "4:00 PM - 6:00 PM",
  "5:00 PM - 7:00 PM",
];


/* ===========================
   COMPONENT
=========================== */

export default function BookingPage() {

  /* Parent Information */

  const [parentName, setParentName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  /* Country */

  const [country, setCountry] =
    useState("Nigeria");

  /* Academic Level */

  const [studentLevel, setStudentLevel] =
    useState("");

  /* Package */

  const [selectedPackage, setSelectedPackage] =
    useState("");

  /* Subjects */

  const [selectedSubjects, setSelectedSubjects] =
    useState<string[]>([]);
  
const [subjectSchedules, setSubjectSchedules] = useState<
  {
    subject: string;
    lesson: number;
    day: string;
    time: string;
  }[]
>([]);
const [scheduleError, setScheduleError] = useState("");


  /* Additional Notes */

  const [additionalNotes, setAdditionalNotes] =
    useState("");

  
  /* ===========================
     LOGIC VARIABLES
  =========================== */

  const isNigeria =
    country === "Nigeria";

  const availablePackages =
    isNigeria
      ? nigeriaPackages
      : [internationalPackage];

  const availableSubjects =
    subjects[country] ?? [];

  const availableLevels = academicLevels[country] ?? [];
 
const currentRule =
  packageRules[
    selectedPackage as keyof typeof packageRules
  ];
 
 
const getLessonCount = (subject: string) => {
  if (!currentRule) return 0;

  return subject === "Mathematics"
    ? currentRule.mathsLessons
    : currentRule.otherLessons;
};
const updateSchedule = (
  subject: string,
  lesson: number,
  field: "day" | "time",
  value: string
) => {
  setSubjectSchedules((previous) => {
    const existing = previous.find(
      (item) =>
        item.subject === subject &&
        item.lesson === lesson
    );

   const updated = existing
  ? { ...existing, [field]: value }
  : {
      subject,
      lesson,
      day: field === "day" ? value : "",
      time: field === "time" ? value : "",
    };

const conflict = previous.find(
  (item) =>
    !(
      item.subject === subject &&
      item.lesson === lesson
    ) &&
    item.day === updated.day &&
    item.time === updated.time &&
    updated.day &&
    updated.time
);

if (conflict) {
  setScheduleError(
    `${updated.day} ${updated.time} is already used by ${conflict.subject}.`
  );
  return previous;
}

setScheduleError("");
if (
  subject === "Mathematics" &&
  updated.day
) {
  const mathsSameDay = previous.find(
    (item) =>
      item.subject === "Mathematics" &&
      item.lesson !== lesson &&
      item.day === updated.day
  );

  if (mathsSameDay) {
    setScheduleError(
      "Mathematics lessons must be on different days."
    );
    return previous;
  }
}
const schedules =
  existing
    ? previous.map((item) =>
        item.subject === subject &&
        item.lesson === lesson
          ? updated
          : item
      )
    : [...previous, updated];

const uniqueDays = [
  ...new Set(
    schedules
      .filter((x) => x.day)
      .map((x) => x.day)
  ),
];

if (
  currentRule &&
  uniqueDays.length > currentRule.maxDays
) {
  setScheduleError(
    `Only ${currentRule.maxDays} lesson day(s) allowed for this package.`
  );
  return previous;
}
const lessonsOnDay =
  schedules.filter(
    (x) => x.day === updated.day
  ).length;

if (
  currentRule &&
  lessonsOnDay > currentRule.maxPerDay
) {
  setScheduleError(
    `Only ${currentRule.maxPerDay} lesson(s) allowed on ${updated.day}.`
  );
  return previous;
}

return schedules;
  });
};
return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 py-16 px-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 shadow-xl">

          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-slate-900">
              Book a Discovery Session
            </h1>

            <p className="mt-4 text-lg text-slate-800">
              Complete the form below to begin your GS Academy journey.
            </p>
          </div>

          <form className="mt-12 space-y-8">

            {/* Parent Name */}

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Parent / Guardian Name
              </label>

              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="John Smith"
                className="w-full rounded-xl border border-slate-300 px-6 py-4 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            {/* Student Name */}

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Student Name
              </label>

              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Emily Smith"
                className="w-full rounded-xl border border-slate-300 px-6 py-4 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            {/* Email */}

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-xl border border-slate-300 px-6 py-4 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            {/* WhatsApp */}

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                WhatsApp Number
              </label>

              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+234..."
                className="w-full rounded-xl border border-slate-300 px-6 py-4 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            {/* Country */}

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Country
              </label>

              <select
                value={country}
               onChange={(e) => {
  setCountry(e.target.value);
  setStudentLevel("");
  setSelectedPackage("");
  setSelectedSubjects([]);
  setSubjectSchedules([]);
  setScheduleError("");
}}
                className="w-full rounded-xl border border-slate-300 px-6 py-4 focus:border-yellow-500 focus:outline-none"
              >
                {countries.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Level */}

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Academic Level
              </label>

              <select
                value={studentLevel}
                onChange={(e) => setStudentLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-6 py-4 focus:border-yellow-500 focus:outline-none"
              >
                <option value="">
                  Select Academic Level
                </option>

                {availableLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Package */}

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Learning Package
              </label>

              <select
                value={selectedPackage}
          onChange={(e) => {
  setSelectedPackage(e.target.value);
  setSubjectSchedules([]);
  setScheduleError("");
}}
                className="w-full rounded-xl border border-slate-300 px-6 py-4 focus:border-yellow-500 focus:outline-none"
              >
                <option value="">
                  Select Package
                </option>

                {availablePackages.map((pkg) => (
                  <option key={pkg} value={pkg}>
                    {pkg}
                  </option>
                ))}
              </select>
            </div>
            {/* Subjects */}

            <div>
              <label className="mb-3 block font-semibold text-slate-900">
                Select Subject(s)
              </label>

              <p className="mb-4 text-sm text-slate-600">
                Choose all subjects you would like your child to study.
              </p>

              <div className="grid gap-3 md:grid-cols-2">

                {availableSubjects.map((subject) => (

                  <label
                    key={subject}
                    className="flex cursor-pointer items-center rounded-xl border border-slate-300 p-4 transition hover:border-yellow-500"
                  >

                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject)}
                     onChange={(e) => {
  if (e.target.checked) {
    setSelectedSubjects((prev) => [
      ...prev,
      subject,
    ]);
  } else {
    setSelectedSubjects((prev) =>
      prev.filter((s) => s !== subject)
    );

    setSubjectSchedules((prev) =>
      prev.filter(
        (item) => item.subject !== subject
      )
    );
  }
}}
                      className="h-5 w-5 accent-yellow-500"
                    />

                    <span className="ml-3 font-medium text-slate-800">
                      {subject}
                    </span>

                  </label>

                ))}

              </div>

              {selectedSubjects.length > 0 && (

                <div className="mt-4 rounded-xl bg-slate-100 p-4">

                  <p className="font-semibold text-slate-900">
                    Selected Subjects ({selectedSubjects.length})
                  </p>

                  <p className="mt-2 text-slate-700">
                    {selectedSubjects.join(", ")}
                  </p>

                </div>

              )}
{currentRule?.allowSchedule && selectedSubjects.length > 0 && (
  <div className="space-y-6 rounded-2xl border border-slate-300 p-6">

    <h2 className="text-xl font-bold text-slate-900">
      Lesson Schedule
    </h2>

    {selectedSubjects.map((subject) => (

      <div key={subject} className="rounded-xl bg-slate-50 p-5">

        <h3 className="mb-4 font-bold">
          {subject}
        </h3>

        {Array.from({
          length: getLessonCount(subject),
        }).map((_, lesson) => (

          <div
            key={lesson}
            className="mb-4 grid gap-4 md:grid-cols-2"
          >

            <select
  className="rounded-xl border border-slate-300 p-3"
  value={
    subjectSchedules.find(
      (x) =>
        x.subject === subject &&
        x.lesson === lesson
    )?.day || ""
  }
  onChange={(e) =>
    updateSchedule(
      subject,
      lesson,
      "day",
      e.target.value
    )
  }
>
              <option>Select Day</option>

              {lessonDays.map((day) => {
  const usedByMaths =
    subject === "Mathematics" &&
    subjectSchedules.some(
      (item) =>
        item.subject === "Mathematics" &&
        item.lesson !== lesson &&
        item.day === day
    );

  return (
    <option
      key={day}
      value={day}
      disabled={usedByMaths}
    >
      {day}
    </option>
  );
})}

            </select>

            <select
  className="rounded-xl border border-slate-300 p-3"
  value={
    subjectSchedules.find(
      (x) =>
        x.subject === subject &&
        x.lesson === lesson
    )?.time || ""
  }
  onChange={(e) =>
    updateSchedule(
      subject,
      lesson,
      "time",
      e.target.value
    )
  }
>
              <option>Select Time</option>

              {timeSlots.map((time) => (
                <option key={time}>
                  {time}
                </option>
              ))}

            </select>

          </div>

        ))}

      </div>

    ))}

  </div>
)}
</div>

{scheduleError && (
  <div className="rounded-xl border border-red-300 bg-red-100 p-4 text-red-700 font-semibold">
    {scheduleError}
  </div>
)}

{/* Additional Notes */}

<div>
  <label className="mb-2 block font-semibold text-slate-900">
    Additional Notes (Optional)
  </label>

  <textarea
    value={additionalNotes}
    onChange={(e) => setAdditionalNotes(e.target.value)}
    rows={5}
    placeholder="Tell us anything we should know about the student..."
    className="w-full rounded-xl border border-slate-300 px-6 py-4 focus:border-yellow-500 focus:outline-none"
  />
</div>

          </form>

        </div>
      </main>

      <Footer />
    </>
  );
}