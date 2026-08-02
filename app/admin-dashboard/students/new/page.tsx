"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createStudent } from "@/lib/services/student";
import { getTutors } from "@/lib/services/tutor";
export default function AddStudentPage() {
  const router = useRouter();

  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [phone, setPhone] = useState("");

  const [country, setCountry] = useState("Nigeria");
  const [academicLevel, setAcademicLevel] = useState("");
  const [studentPackage, setStudentPackage] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [amountPaid, setAmountPaid] = useState("");
  const [totalFee, setTotalFee] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState("");
  const [googleMeetLink, setGoogleMeetLink] = useState("");
const [lessonSchedule, setLessonSchedule] = useState("");
const [outstandingBalance, setOutstandingBalance] = useState("");
  const [tutors, setTutors] = useState<any[]>([]);
const [selectedTutor, setSelectedTutor] = useState("");
useEffect(() => {
  async function loadTutors() {
    const { data } = await getTutors();

    if (data) {
      setTutors(data);
    }
  }

  loadTutors();
}, []);
  async function handleSave() {
  if (!studentName) {
    alert("Please enter the student's name.");
    return;
  }

  if (!email) {
    alert("Please enter the student's email.");
    return;
  }

  if (!selectedTutor) {
    alert("Please select a tutor.");
    return;
  }

  const total = Number(totalFee) || 0;
const paid = Number(amountPaid) || 0;

const { error } = await createStudent({
  full_name: studentName,
  email,
  phone,
  parent_name: parentName,
  parent_phone: parentPhone,
  country,
  academic_level: academicLevel,
  package: studentPackage,
  tutor_id: selectedTutor,
  subjects: selectedSubjects,
  amount_paid: paid,
  outstanding_balance:
    Number(outstandingBalance) || Math.max(total - paid, 0),
  payment_due_date: paymentDueDate,
  google_meet_link: googleMeetLink,
  lesson_schedule: lessonSchedule,
});
  if (error) {
    alert(error.message);
    return;
  }

  alert("Student added successfully!");

  router.push("/admin-dashboard/students");
  router.refresh();
}

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-4xl font-extrabold text-slate-900">
        Add Student
      </h1>

      <p className="mt-3 text-slate-700">
        Register a new student into GS Academy.
      </p>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Student Full Name"
            className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
          />
<input
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  placeholder="Student Phone Number"
  className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
/>
          <input
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Parent Name"
            className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
          />

          <input
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value)}
            placeholder="Parent Phone Number"
            className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
          />
          <select
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
>
  <option>Nigeria</option>
  <option>United Kingdom</option>
  <option>United States</option>
  <option>Canada</option>
  <option>Australia</option>
  <option>Other</option>
</select>
<input
  value={academicLevel}
  onChange={(e) => setAcademicLevel(e.target.value)}
  placeholder="Academic Level (e.g. JSS 2, Year 8)"
  className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
/>
<select
  value={studentPackage}
  onChange={(e) => setStudentPackage(e.target.value)}
  className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
>
  <option value="">Select Package</option>

  <option value="Package 1 - Small Group">
    Package 1 - Small Group
  </option>

  <option value="Package 2 - Private Coaching">
    Package 2 - Private Coaching
  </option>

  <option value="Package 3 - Premium Coaching">
    Package 3 - Premium Coaching
  </option>

  <option value="One-on-One Coaching">
    One-on-One Coaching
  </option>
</select>
<input
  placeholder="Subjects (comma separated)"
  value={selectedSubjects.join(", ")}
  onChange={(e) =>
    setSelectedSubjects(
      e.target.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    )
  }
  className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
/>
<input
  type="number"
  value={totalFee}
  onChange={(e) => setTotalFee(e.target.value)}
  placeholder="Total Fee"
  className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
/>
<input
  type="number"
  value={amountPaid}
  onChange={(e) => setAmountPaid(e.target.value)}
  placeholder="Amount Paid"
  className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
/>
<input
  type="number"
  value={outstandingBalance}
  onChange={(e) => setOutstandingBalance(e.target.value)}
  placeholder="Outstanding Balance"
  className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
/>
<input
  type="date"
  value={paymentDueDate}
  onChange={(e) => setPaymentDueDate(e.target.value)}
  className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
/>
<input
  value={googleMeetLink}
  onChange={(e) => setGoogleMeetLink(e.target.value)}
  placeholder="Google Meet Link"
  className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
/>
<textarea
  value={lessonSchedule}
  onChange={(e) => setLessonSchedule(e.target.value)}
  placeholder="Lesson Schedule"
  className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500 md:col-span-2"
/>
<select
  value={selectedTutor}
  onChange={(e) => setSelectedTutor(e.target.value)}
  className="rounded-xl border border-slate-300 px-5 py-4 outline-none focus:border-yellow-500"
>
  <option value="">Select Tutor</option>

  {tutors.map((tutor) => (
    <option key={tutor.id} value={tutor.id}>
      {tutor.full_name}
    </option>
  ))}
</select>
        </div>

        <button
          onClick={handleSave}
          className="mt-8 rounded-xl bg-yellow-500 px-10 py-4 font-bold text-slate-900 hover:bg-yellow-400"
        >
          Save Student
        </button>
      </div>
    </div>
  );
}