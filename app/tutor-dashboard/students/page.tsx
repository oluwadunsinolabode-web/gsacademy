"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  ChevronRight,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  subjects: string[] | null;
  package: string | null;
  status: string | null;
  tutor_id: string | null;
};

type Tutor = {
  id: string;
};

export default function TutorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);

      try {
        // Get currently logged-in tutor
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("Tutor authentication error:", authError);
          setStudents([]);
          return;
        }

        // Find tutor record using auth_id
        const { data: tutor, error: tutorError } = await supabase
          .from("tutors")
          .select("id")
          .eq("auth_id", user.id)
          .single();

        if (tutorError || !tutor) {
          console.error("Tutor record not found:", tutorError);
          setStudents([]);
          return;
        }

        // Get only students assigned to this tutor
        const { data, error: studentsError } = await supabase
          .from("students")
          .select(
            "id, full_name, email, phone, subjects, package, status, tutor_id"
          )
          .eq("tutor_id", tutor.id)
          .order("created_at", { ascending: false });

        if (studentsError) {
          console.error("Students loading error:", studentsError);
          setStudents([]);
          return;
        }

        setStudents(data || []);
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return students;

    return students.filter((student) => {
      const name = student.full_name?.toLowerCase() || "";
      const email = student.email?.toLowerCase() || "";
      const subjects = student.subjects?.join(" ").toLowerCase() || "";
      const packageName = student.package?.toLowerCase() || "";

      return (
        name.includes(term) ||
        email.includes(term) ||
        subjects.includes(term) ||
        packageName.includes(term)
      );
    });
  }, [students, search]);

  return (
    <>
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900">
          My Students
        </h1>

        <p className="mt-3 text-slate-600">
          Manage every student currently assigned to you.
        </p>
      </div>

      {/* Search */}
      <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">
        <div className="relative">
          <Search
            size={22}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student..."
            className="w-full rounded-2xl border border-slate-200 py-4 pl-14 pr-5 outline-none transition focus:border-yellow-500"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <Users
            size={34}
            className="text-yellow-500"
          />

          <p className="mt-5 text-slate-600">
            My Students
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            {loading ? "..." : students.length}
          </h2>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <Users
            size={34}
            className="text-green-500"
          />

          <p className="mt-5 text-slate-600">
            Active Students
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-green-600">
            {loading
              ? "..."
              : students.filter(
                  (student) =>
                    student.status?.toLowerCase() === "active"
                ).length}
          </h2>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <Users
            size={34}
            className="text-yellow-500"
          />

          <p className="mt-5 text-slate-600">
            Search Results
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            {loading ? "..." : filteredStudents.length}
          </h2>
        </div>
      </div>

      {/* Students */}
      <div className="mt-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            Assigned Students
          </h2>

          <span className="text-sm text-slate-500">
            {filteredStudents.length} student
            {filteredStudents.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading your students...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <Users
              size={50}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              No students found
            </h3>

            <p className="mt-2 text-slate-500">
              No students are currently assigned to you.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="rounded-3xl bg-white p-8 shadow-sm"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                      <User
                        size={32}
                        className="text-yellow-600"
                      />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {student.full_name || "Unnamed Student"}
                      </h2>

                      <p className="mt-2 text-slate-600">
                        {student.subjects?.length
                          ? student.subjects.join(" • ")
                          : "No subjects assigned"}
                      </p>

                      {student.package && (
                        <p className="mt-2 font-semibold text-yellow-600">
                          {student.package}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      student.status?.toLowerCase() === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {student.status || "Unknown"}
                  </span>
                </div>

                <div className="mt-8 rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Email
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {student.email || "No email"}
                  </p>
                </div>

                <Link
                  href={`/tutor-dashboard/students/${student.id}`}
                  className="mt-8 flex items-center justify-center gap-3 rounded-xl bg-slate-900 py-4 font-bold text-white transition hover:bg-slate-800"
                >
                  Open Workspace

                  <ChevronRight size={20} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}