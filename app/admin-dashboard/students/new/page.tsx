"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStudent } from "@/lib/services/students";

export default function AddStudentPage() {
  const router = useRouter();

  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  async function handleSave() {
    const { error } = await createStudent({
      full_name: studentName,
      email,
      parent_name: parentName,
      parent_phone: parentPhone,
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