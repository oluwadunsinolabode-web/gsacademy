"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditTutorPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subjects, setSubjects] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    async function loadTutor() {
      const res = await fetch(`/api/admin/tutors/${id}`);
      const tutor = await res.json();

      setFullName(tutor.full_name);
      setEmail(tutor.email);
      setPhone(tutor.phone);
      setSubjects(
        Array.isArray(tutor.subjects)
          ? tutor.subjects.join(", ")
          : ""
      );
      setStatus(tutor.status);

      setLoading(false);
    }

    loadTutor();
  }, [id]);

  async function updateTutor() {
    const res = await fetch(`/api/admin/tutors/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: fullName,
        email,
        phone,
        subjects: subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        status,
      }),
    });

    if (res.ok) {
      alert("Tutor updated successfully.");
      router.push("/admin-dashboard/tutors");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="mx-auto max-w-5xl">

      <h1 className="text-4xl font-extrabold">
        Edit Tutor
      </h1>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <div className="grid gap-6 md:grid-cols-2">

          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-xl border px-5 py-4"
            placeholder="Tutor Name"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border px-5 py-4"
            placeholder="Email"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl border px-5 py-4"
            placeholder="Phone"
          />

          <input
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
            className="rounded-xl border px-5 py-4"
            placeholder="Subjects"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border px-5 py-4"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

        </div>

        <button
          onClick={updateTutor}
          className="mt-8 rounded-xl bg-yellow-500 px-10 py-4 font-bold text-slate-900"
        >
          Update Tutor
        </button>

      </div>

    </div>
  );
}