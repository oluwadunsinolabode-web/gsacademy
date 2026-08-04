"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { getTutors } from "@/lib/services/tutor";

export default function TutorsPage() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTutors() {
      const { data, error } = await getTutors();

      if (!error && data) {
        setTutors(data);
      }

      setLoading(false);
    }

    loadTutors();
  }, []);

  return (
    <div className="mx-auto max-w-7xl">

      <div className="flex items-end justify-between">

        <div>
          <h1 className="text-4xl font-extrabold">
            Tutors
          </h1>

          <p className="mt-3 text-slate-700">
            Manage all tutors.
          </p>
        </div>

        <Link
          href="/admin-dashboard/tutors/new"
          className="rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900 hover:bg-yellow-400"
        >
          <UserPlus className="mr-2 inline" size={18} />
          Add Tutor
        </Link>

      </div>

      <div className="mt-10 overflow-x-auto rounded-3xl bg-white p-8 shadow-sm">

        {loading ? (

          <p>Loading tutors...</p>

        ) : tutors.length === 0 ? (

          <p>No tutors found.</p>

        ) : (

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="py-4 text-left">
                  Tutor
                </th>

                <th className="py-4 text-left">
                  Email
                </th>

                <th className="py-4 text-left">
                  Phone
                </th>

                <th className="py-4 text-left">
                  Subjects
                </th>

                <th className="py-4 text-left">
                  Status
                </th>

                <th className="py-4 text-left">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {tutors.map((tutor) => (

                <tr
                  key={tutor.id}
                  className="border-b"
                >

                  <td className="py-5 font-semibold">
                    {tutor.full_name}
                  </td>

                  <td>
                    {tutor.email}
                  </td>

                  <td>
                    {tutor.phone}
                  </td>

                  <td>
                    {Array.isArray(tutor.subjects)
                      ? tutor.subjects.join(", ")
                      : tutor.subjects}
                  </td>

                  <td>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        tutor.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {tutor.status}
                    </span>

                  </td>

                  <td>

                    <Link
                      href={`/admin-dashboard/tutors/${tutor.id}/edit`}
                      className="rounded-lg bg-yellow-500 px-5 py-2 font-bold text-slate-900 hover:bg-yellow-400"
                    >
                      Edit
                    </Link>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}