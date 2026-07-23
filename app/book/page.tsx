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
const [otherLevel, setOtherLevel] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [parentName, setParentName] = useState("");
const [studentName, setStudentName] = useState("");
const [email, setEmail] = useState("");
const [whatsapp, setWhatsapp] = useState("");

const [subjectMath, setSubjectMath] = useState(false);
const [subjectScience, setSubjectScience] = useState(false);

const [day, setDay] = useState("");
const [time, setTime] = useState("");

const [success, setSuccess] = useState("");
const [loading, setLoading] = useState(false);
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setLoading(true);

  const { error } = await supabase
    .from("bookings")
    .insert([
      {
        parent_name: parentName,
        student_name: studentName,
        email,
        whatsapp,
        country,
        academic_level:
          country === "Other"
            ? otherLevel
            : academicLevels[country][0],
        subjects: [
          ...(subjectMath ? ["Mathematics"] : []),
          ...(subjectScience ? ["Science"] : []),
        ],
        preferred_day: day,
        preferred_time: time,
      },
    ]);

  setLoading(false);

  if (error) {
    alert(error.message);
    return;
  }

  setSuccess("✅ Booking submitted successfully!");

  setParentName("");
  setStudentName("");
  setEmail("");
  setWhatsapp("");
  setSubjectMath(false);
  setSubjectScience(false);
  setDay("");
  setTime("");
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
{success && (
  <div className="mt-6 rounded-xl bg-green-600 p-4 text-center font-semibold text-white">
    {success}
  </div>
)}
       <form
  onSubmit={handleSubmit}
  className="mt-10 space-y-8"
>
          <div>
            <label className="mb-2 block font-semibold text-slate-900">
              Parent / Guardian Name
            </label>

            <input
              type="text"
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
    className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-slate-900 focus:border-yellow-500 focus:outline-none"
  >
    {academicLevels[country].map((level) => (
      <option key={level}>{level}</option>
    ))}
  </select>

  {country === "Other" && (
    <input
      type="text"
      placeholder="Enter Academic Level"
      value={otherLevel}
      onChange={(e) => setOtherLevel(e.target.value)}
      className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-yellow-500 focus:outline-none"
    />
  )}
</div>

          <div>
            <label className="mb-4 block font-semibold text-slate-900">
              Subjects
            </label>

            <div className="flex gap-10 text-slate-900">
              <label>
                <input type="checkbox" />
                <span className="ml-2">Mathematics</span>
              </label>

              <label>
                <input type="checkbox" />
                <span className="ml-2">Science</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-900">
              Preferred Day
            </label>

            <select className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-slate-900">
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-900">
              Preferred Time
            </label>

            <select className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-slate-900">
              <option>4:00 PM - 6:00 PM</option>
              <option>4:30 PM - 6:30 PM</option>
              <option>5:00 PM - 7:00 PM</option>
            </select>
          </div>

          <button className="w-full rounded-xl bg-slate-900 py-5 text-lg font-bold text-white transition hover:bg-slate-800">
            Book My Discovery Session
          </button>
        </form>
      </div>
    </main>
  );
}