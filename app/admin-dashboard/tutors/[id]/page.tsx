"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function TutorDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tutor, setTutor] = useState<any>(null);

  useEffect(() => {
    async function loadTutor() {
      const res = await fetch(`/api/admin/tutors/${params.id}`);

      if (!res.ok) {
        alert("Tutor not found.");
        router.push("/admin-dashboard/tutors");
        return;
      }

      const data = await res.json();
      setTutor(data);
      setLoading(false);
    }

    loadTutor();
  }, [params.id, router]);

  if (loading) {
    return <p className="p-10">Loading tutor...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-extrabold">
            {tutor.full_name}
          </h1>

          <p className="mt-3 text-slate-600">
            Tutor Details
          </p>

        </div>

        <Link
          href={`/admin-dashboard/tutors/${tutor.id}/edit`}
          className="rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900"
        >
          Edit Tutor
        </Link>

      </div>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

        <div className="grid gap-8 md:grid-cols-2">

          <div>
            <p className="text-slate-500">Full Name</p>
            <h2 className="text-xl font-bold">
              {tutor.full_name}
            </h2>
          </div>

          <div>
            <p className="text-slate-500">Email</p>
            <h2 className="text-xl font-bold">
              {tutor.email}
            </h2>
          </div>

          <div>
            <p className="text-slate-500">Phone</p>
            <h2 className="text-xl font-bold">
              {tutor.phone}
            </h2>
          </div>

          <div>
            <p className="text-slate-500">Status</p>
            <h2 className="text-xl font-bold capitalize">
              {tutor.status}
            </h2>
          </div>

          <div className="md:col-span-2">

            <p className="text-slate-500">
              Subjects
            </p>

            <div className="mt-3 flex flex-wrap gap-3">

              {tutor.subjects?.map((subject: string) => (
                <span
                  key={subject}
                  className="rounded-full bg-yellow-100 px-4 py-2 font-semibold text-yellow-700"
                >
                  {subject}
                </span>
              ))}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}