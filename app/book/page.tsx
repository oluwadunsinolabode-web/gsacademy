"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BookingPage() {
  const academicLevels: Record<string, string[]> = {
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
      "WAEC Candidate",
      "NECO Candidate",
      "JAMB Candidate",
      "School Leaver",
    ],

    Other: ["Please Specify"],
  };

  const [country, setCountry] = useState("United Kingdom");

const [parentName, setParentName] = useState("");
const [studentName, setStudentName] = useState("");
const [email, setEmail] = useState("");
const [whatsapp, setWhatsapp] = useState("");
const [academicLevel, setAcademicLevel] = useState("");

const [subjects, setSubjects] = useState({
  mathematics: false,
  science: false,
});

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const [mathDay, setMathDay] = useState("");
const [scienceDay, setScienceDay] = useState("");
const [mathTime, setMathTime] = useState("");
const [scienceTime, setScienceTime] = useState("");
const [additionalNotes, setAdditionalNotes] = useState("");
const [timezone, setTimezone] = useState("");
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const { data, error } = await supabase
  .from("bookings")
  .insert([
    {
      parent_name: parentName,
      student_name: studentName,
      email: email,
      whatsapp: whatsapp,
      country: country,
      student_level: academicLevel,
      maths_day: mathDay,
      maths_time: mathTime,
      science_day: scienceDay,
      science_time: scienceTime,
      additional_notes: additionalNotes,
      timezone: timezone,
    },
  ]);
  if (error) {
    console.error(error);
    alert(error.message);
  } else {
    alert("Booking submitted successfully!");
    console.log(data);
  }
};

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-xl">
        <h1 className="text-4xl font-extrabold text-slate-900">
          Book a Discovery Session
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          Complete the form below and we'll contact you to confirm your
          child's free discovery session.
        </p>

        <form
  onSubmit={handleSubmit}
  className="mt-10 space-y-8"
>       <div>
            <label className="mb-2 block font-semibold text-slate-900">
              Parent / Guardian Name
            </label>

            <input
  type="text"
  value={parentName}
  onChange={(e) => setParentName(e.target.value)}
  placeholder="John Smith"
  className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-yellow-500 focus:outline-none"
/>

          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-900">
              Student Name
            </label>

            <input
  type="text"
  value={studentName}
  onChange={(e) => setStudentName(e.target.value)}
  placeholder="Emily Smith"
  className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-yellow-500 focus:outline-none"
/>
            
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-900">
              Email Address
            </label>

           <input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="john@email.com"
  className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-yellow-500 focus:outline-none"
/>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-900">
              WhatsApp Number
            </label>

            <input
  type="text"
  value={whatsapp}
  onChange={(e) => setWhatsapp(e.target.value)}
  placeholder="+44..."
  className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-yellow-500 focus:outline-none"
/>
            
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-900">
              Country
            </label>

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-slate-900 focus:border-yellow-500 focus:outline-none"
            >
              <option>United Kingdom</option>
              <option>United States</option>
              <option>Canada</option>
              <option>Australia</option>
              <option>Nigeria</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-900">
              Academic Level
            </label>

            <select
  value={academicLevel}
  onChange={(e) => setAcademicLevel(e.target.value)}
  className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-slate-900 focus:border-yellow-500 focus:outline-none"
>
  <option value="">Select Academic Level</option>

  {academicLevels[country].map((level) => (
    <option key={level} value={level}>
      {level}
    </option>
  ))}
</select>
          </div>

         <div>
  <label className="mb-4 block font-semibold text-slate-900">
    Subjects
  </label>

  <div className="flex gap-10 text-slate-900">
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={subjects.mathematics}
        onChange={(e) =>
          setSubjects({
            ...subjects,
            mathematics: e.target.checked,
          })
        }
      />
      Mathematics
    </label>

    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={subjects.science}
        onChange={(e) =>
          setSubjects({
            ...subjects,
            science: e.target.checked,
          })
        }
      />
      Science
    </label>
  </div>
</div>

          {subjects.mathematics && (
  <div className="rounded-2xl border border-slate-200 p-6">
    <h2 className="mb-6 text-2xl font-bold text-slate-900">
      Mathematics Schedule
    </h2>

    <div>
      <label className="mb-2 block font-semibold text-slate-900">
        Preferred Day
      </label>

      <select
  value={mathDay}
  onChange={(e) => setMathDay(e.target.value)}
  className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-slate-900"
>
        <option value="">Select a day</option>

{days
  .filter((day) => day !== scienceDay)
  .map((day) => (
    <option key={day} value={day}>
      {day}
    </option>
))}
      </select>
    </div>

   <div className="mt-5">
  <label className="mb-2 block font-semibold text-slate-900">
    Preferred Time
  </label>

  <select
    value={mathTime}
    onChange={(e) => setMathTime(e.target.value)}
    className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-slate-900"
  >
    <option value="">Select a time</option>
    <option value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM</option>
    <option value="4:30 PM - 6:30 PM">4:30 PM - 6:30 PM</option>
    <option value="5:00 PM - 7:00 PM">5:00 PM - 7:00 PM</option>
  </select>
</div>
</div>
)}
{subjects.science && (
  <div className="rounded-2xl border border-slate-200 p-6">
    <h2 className="mb-6 text-2xl font-bold text-slate-900">
      Science Schedule
    </h2>

    <div>
      <label className="mb-2 block font-semibold text-slate-900">
        Preferred Day
      </label>

      <select
        value={scienceDay}
        onChange={(e) => setScienceDay(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-slate-900"
      >
        <option value="">Select a day</option>

        {days
          .filter((day) => day !== mathDay)
          .map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
      </select>
    </div>

    <div className="mt-5">
      <label className="mb-2 block font-semibold text-slate-900">
        Preferred Time
      </label>

      <select
        value={scienceTime}
        onChange={(e) => setScienceTime(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-slate-900"
      >
        <option value="">Select a time</option>
        <option value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM</option>
        <option value="4:30 PM - 6:30 PM">4:30 PM - 6:30 PM</option>
        <option value="5:00 PM - 7:00 PM">5:00 PM - 7:00 PM</option>
      </select>
    </div>
  </div>
)}
<div>
  <label className="mb-2 block font-semibold text-slate-900">
    Time Zone
  </label>

  <input
    type="text"
    value={timezone}
    onChange={(e) => setTimezone(e.target.value)}
    placeholder="e.g. GMT+1 (Nigeria)"
    className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4"
  />
</div>

<div>
  <label className="mb-2 block font-semibold text-slate-900">
    Additional Notes
  </label>

  <textarea
    rows={4}
    value={additionalNotes}
    onChange={(e) => setAdditionalNotes(e.target.value)}
    className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4"
    placeholder="Anything you'd like us to know..."
  />
</div>

<button
  type="submit"
  className="w-full rounded-xl bg-slate-900 py-5 text-lg font-bold text-white transition hover:bg-slate-800"
>
  Book My Discovery Session
</button>

</form>
      </div>
    </main>
  );
}