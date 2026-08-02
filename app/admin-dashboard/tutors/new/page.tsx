"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTutorPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subjects, setSubjects] = useState("");
  async function saveTutor() {
  const res = await fetch("/api/admin/tutors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      full_name: fullName,
      email,
      phone,
      subjects,
    }),
  });

  if (res.ok) {
    alert("Tutor added successfully.");
    router.push("/admin-dashboard/tutors");
    router.refresh();
  } else {
    const data = await res.json();
    alert(data.error);
  }
}
  return (
    <div className="mx-auto max-w-5xl">

      <h1 className="text-4xl font-extrabold">
        Add Tutor
      </h1>

      <p className="mt-3 text-slate-700">
        Register a tutor into GS Academy.
      </p>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <div className="grid gap-6 md:grid-cols-2">

         <input
  placeholder="Tutor Name"
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
  className="rounded-xl border border-slate-300 px-5 py-4"
/>

        <input
  placeholder="Tutor Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="rounded-xl border border-slate-300 px-5 py-4"
/>

          <input
  placeholder="Phone Number"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  className="rounded-xl border border-slate-300 px-5 py-4"
/>

          <input
  placeholder="Subjects (e.g. Mathematics, Physics)"
  value={subjects}
  onChange={(e) => setSubjects(e.target.value)}
  className="rounded-xl border border-slate-300 px-5 py-4"
/>

        </div>

       <button
  onClick={saveTutor}
  className="mt-8 rounded-xl bg-yellow-500 px-10 py-4 font-bold text-slate-900"
>
  Save Tutor
</button>

      </div>

    </div>
  );
}