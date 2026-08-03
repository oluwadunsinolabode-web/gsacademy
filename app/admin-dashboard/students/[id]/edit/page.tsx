"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createStudent } from "@/lib/services/student";
import { getTutors } from "@/lib/services/tutor";
import { getTimetable } from "@/lib/services/timetable";
export default function AddStudentPage() {
  const router = useRouter();
const params = useParams();
const studentId = params.id as string;
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [phone, setPhone] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);

  const [country, setCountry] = useState("Nigeria");
  const [academicLevel, setAcademicLevel] = useState("");
  const [studentPackage, setStudentPackage] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [amountPaid, setAmountPaid] = useState("");
  const [totalFee, setTotalFee] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState("");
  const [googleMeetLink, setGoogleMeetLink] = useState("");
const [selectedDay, setSelectedDay] = useState("");
const [selectedTime, setSelectedTime] = useState("");
const [duration, setDuration] = useState("2");
const [timetable, setTimetable] = useState<any[]>([]);
const [selectedTimetable, setSelectedTimetable] = useState("");
const [outstandingBalance, setOutstandingBalance] = useState("");
  const [tutors, setTutors] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const times = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "10:00 AM - 11:30 AM",
  "12:00 PM - 01:30 PM",
  "12:00 PM - 02:00 PM",
  "1:00 PM - 3:00 PM",
  "2:00 PM - 4:00 PM",
  "04:00 PM - 5:30 PM",
  "4:00 PM - 6:00 PM",
  "05:00 PM - 07:00 PM",
];
useEffect(() => {
  
  async function loadData() {
    // Tutors
    const { data: tutorData } = await getTutors();

    if (tutorData) {
      setTutors(tutorData);
    }

    // Subjects
    const { data: subjectData } = await fetch("/api/admin/subjects")
      .then((r) => r.json());

    if (subjectData) {
      setSubjects(subjectData);
    }

    // Timetable
    const { data: timetableData } = await getTimetable();

    if (timetableData) {
      setTimetable(timetableData);
    }
    // Load Student
const studentResponse = await fetch(
  `/api/admin/students/${studentId}`
);

const student = await studentResponse.json();

if (student) {
  setStudentName(student.full_name || "");
  setEmail(student.email || "");
  setPhone(student.phone || "");
  setParentName(student.parent_name || "");
  setParentPhone(student.parent_phone || "");
  setCountry(student.country || "Nigeria");
  setAcademicLevel(student.academic_level || "");
  setStudentPackage(student.package || "");
  setSelectedSubjects(student.subjects || []);
  setAmountPaid(String(student.amount_paid || ""));
  setOutstandingBalance(
    String(student.outstanding_balance || "")
  );
  setPaymentDueDate(student.payment_due_date || "");
  setGoogleMeetLink(student.google_meet_link || "");

  if (student.lesson_schedule) {
    const parts = student.lesson_schedule.split(" | ");

    setSelectedDay(parts[0] || "");
    setSelectedTime(parts[1] || "");
  }
}
  }

  loadData();
  
}, []); 


function updateTutorAssignment(
  subjectId: string,
  tutorId: string
) {
  setAssignments((prev) => {

    const existing = prev.find(
      (item) => item.subject_id === subjectId
    );

    if (existing) {
      return prev.map((item) =>
        item.subject_id === subjectId
          ? {
              ...item,
              tutor_id: tutorId,
            }
          : item
      );
    }

    return [
      ...prev,
      {
        subject_id: subjectId,
        tutor_id: tutorId,
      },
    ];
  });
}async function handleSave() {
  if (!studentName) {
    alert("Please enter the student's name.");
    return;
  }

  if (!email) {
    alert("Please enter the student's email.");
    return;
  }

 
  const total = Number(totalFee) || 0;
const paid = Number(amountPaid) || 0;

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
    academic_level: academicLevel,
    package: studentPackage,
        subjects: selectedSubjects,
        assignments,
    amount_paid: paid,
    outstanding_balance:
      Number(outstandingBalance) || Math.max(total - paid, 0),
    payment_due_date: paymentDueDate,
    google_meet_link: googleMeetLink,
    
   lesson_schedule: `${selectedDay} | ${selectedTime}`,
  }),
});

const result = await response.json();

if (!response.ok) {
  alert(result.error);
  return;
}

alert("Student updated successfully.");

router.push("/admin-dashboard/students");
router.refresh();
}

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-4xl font-extrabold text-slate-900">
  Edit Student
</h1>

      <p className="mt-3 text-slate-700">
       Update student information, timetable and subjects.
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
<div className="space-y-4">

<label className="font-bold">
Lesson Schedule
</label>


<select
value={selectedDay}
onChange={(e)=>setSelectedDay(e.target.value)}
className="w-full rounded-xl border border-slate-300 px-5 py-4"
>

<option value="">
Select Day
</option>

{days.map((day)=>(
<option key={day} value={day}>
{day}
</option>
))}

</select>



<select
value={selectedTime}
onChange={(e)=>setSelectedTime(e.target.value)}
className="w-full rounded-xl border border-slate-300 px-5 py-4"
>

<option value="">
Select Time
</option>


{times.map((time)=>(
<option key={time} value={time}>
{time}
</option>
))}


</select>


</div><select
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
<select
  multiple
  value={selectedSubjects}
  onChange={(e) =>
    setSelectedSubjects(
      Array.from(e.target.selectedOptions, (option) => option.value)
    )
  }
  className="rounded-xl border border-slate-300 px-5 py-4 h-40 outline-none focus:border-yellow-500"
>
  {subjects.map((subject) => (
    <option key={subject.id} value={subject.name}>
      {subject.name}
    </option>
  ))}
</select>
<div className="md:col-span-2 space-y-4">
  <h3 className="font-bold text-lg">
    Assign Tutors to Subjects
  </h3>

  {selectedSubjects.map((subjectName) => {

    const subject = subjects.find(
      (s) => s.name === subjectName
    );

    if (!subject) return null;

    return (
      <div
        key={subject.id}
        className="grid gap-4 md:grid-cols-2"
      >

        <div className="rounded-xl bg-slate-100 px-5 py-4">
          {subject.name}
        </div>

        <select
          value={
            assignments.find(
              (a) => a.subject_id === subject.id
            )?.tutor_id || ""
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

          {tutors.map((tutor) => (
            <option
              key={tutor.id}
              value={tutor.id}
            >
              {tutor.full_name}
            </option>
          ))}

        </select>

      </div>
    );
  })}

</div>
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


        </div>

        <button
        
          onClick={handleSave}
          className="mt-8 rounded-xl bg-yellow-500 px-10 py-4 font-bold text-slate-900 hover:bg-yellow-400"
        >
        Update Student
        </button>
      </div>
    </div>
  );
}