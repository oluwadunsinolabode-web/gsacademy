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
          className="rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900"
        >
          <UserPlus className="mr-2 inline" />
          Add Tutor
        </Link>
      </div>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm overflow-x-auto">

        {loading ? (
          <p>Loading tutors...</p>
        ) : tutors.length === 0 ? (
          <p>No tutors found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-4 text-left">Tutor</th>
                <th className="py-4 text-left">Email</th>
                <th className="py-4 text-left">Phone</th>
                <th className="py-4 text-left">Subjects</th>
              </tr>
            </thead>

            <tbody>
              {tutors.map((tutor) => (
                <tr key={tutor.id} className="border-b">
                  <td className="py-4 font-semibold">
                    {tutor.full_name}
                  </td>

                  <td>{tutor.email}</td>

                  <td>{tutor.phone}</td>

                  <td>{tutor.subjects}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}