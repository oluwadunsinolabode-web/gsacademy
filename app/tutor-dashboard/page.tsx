"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ClipboardCheck,
  BookOpen,
  Users,
  Bell,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Tutor = {
  id: string;
  full_name: string | null;
};

type Assignment = {
  id: string;
  student_id: string;
  subject_id: string;
  day: string | null;
  time_slot: string | null;
  google_meet_link: string | null;
  status: string | null;
  active: boolean | null;
};

type Student = {
  id: string;
  full_name: string | null;
};

type DashboardData = {
  tutor: Tutor | null;
  studentCount: number;
  todaysClasses: number;
  pendingClasswork: number;
  homeworkWaiting: number;
  assignments: Assignment[];
  students: Record<string, Student>;
};

export default function TutorDashboardPage() {
  const [data, setData] = useState<DashboardData>({
    tutor: null,
    studentCount: 0,
    todaysClasses: 0,
    pendingClasswork: 0,
    homeworkWaiting: 0,
    assignments: [],
    students: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      /*
       * ==========================================
       * 1. GET LOGGED-IN USER
       * ==========================================
       */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("You must be logged in as a tutor.");
      }

      /*
       * ==========================================
       * 2. GET REAL TUTOR
       * ==========================================
       */

      const {
        data: tutor,
        error: tutorError,
      } = await supabase
        .from("tutors")
        .select("id, full_name")
        .eq("auth_id", user.id)
        .single();

      if (tutorError || !tutor) {
        console.error("Tutor query error:", tutorError);

        throw new Error(
          tutorError?.message || "Tutor profile not found."
        );
      }

      /*
       * ==========================================
       * 3. GET THIS TUTOR'S ASSIGNMENTS
       *
       * tutor_assignments is the SOURCE OF TRUTH.
       * ==========================================
       */

      const {
        data: assignments,
        error: assignmentsError,
      } = await supabase
        .from("tutor_assignments")
        .select(
          `
          id,
          tutor_id,
          student_id,
          subject_id,
          day,
          time_slot,
          google_meet_link,
          status,
          active
          `
        )
        .eq("tutor_id", tutor.id)
        .eq("active", true);

      if (assignmentsError) {
        console.error(
          "Tutor assignments error:",
          assignmentsError
        );

        throw new Error(assignmentsError.message);
      }

      const tutorAssignments: Assignment[] =
        assignments || [];

      /*
       * ==========================================
       * 4. GET UNIQUE STUDENTS
       * ==========================================
       */

      const uniqueStudentIds = Array.from(
        new Set(
          tutorAssignments.map(
            (assignment) => assignment.student_id
          )
        )
      );

      let studentsMap: Record<string, Student> = {};

      if (uniqueStudentIds.length > 0) {
        const {
          data: students,
          error: studentsError,
        } = await supabase
          .from("students")
          .select("id, full_name")
          .in("id", uniqueStudentIds);

        if (studentsError) {
          console.error(
            "Students query error:",
            studentsError
          );

          throw new Error(studentsError.message);
        }

        studentsMap = Object.fromEntries(
          (students || []).map((student) => [
            student.id,
            student,
          ])
        );
      }

      /*
       * ==========================================
       * 5. GET TODAY'S DAY
       * ==========================================
       */

      const today = new Date();

      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      const todayName = dayNames[today.getDay()];

      /*
       * ==========================================
       * 6. TODAY'S CLASSES
       * ==========================================
       */

      const todaysAssignments =
        tutorAssignments.filter(
          (assignment) =>
            assignment.day?.toLowerCase().trim() ===
              todayName.toLowerCase().trim() &&
            assignment.status?.toLowerCase() ===
              "scheduled"
        );

      /*
       * ==========================================
       * 7. PENDING CLASSWORK
       *
       * Get classwork created by this tutor,
       * then check assignments.
       * ==========================================
       */

      let pendingClasswork = 0;

      const {
        data: tutorClassworks,
        error: classworkError,
      } = await supabase
        .from("classworks")
        .select("id")
        .eq("tutor_id", tutor.id);

      if (classworkError) {
        console.error(
          "Classwork query error:",
          classworkError
        );
      } else if (
        tutorClassworks &&
        tutorClassworks.length > 0
      ) {
        const classworkIds = tutorClassworks.map(
          (item) => item.id
        );

        const {
          data: submissions,
          error: submissionsError,
        } = await supabase
          .from("classwork_submissions")
          .select("id, status")
          .in("classwork_id", classworkIds);

        if (submissionsError) {
          console.error(
            "Submission query error:",
            submissionsError
          );
        } else {
          pendingClasswork =
            submissions?.filter((submission) => {
              const status =
                submission.status?.toLowerCase();

              return (
                status === "submitted" ||
                status === "pending" ||
                status === "awaiting_review"
              );
            }).length || 0;
        }
      }

      /*
       * ==========================================
       * 8. HOMEWORK WAITING
       *
       * This counts homework belonging to this tutor
       * where the status indicates it is pending.
       * ==========================================
       */

      let homeworkWaiting = 0;

      const {
        data: tutorHomework,
        error: homeworkError,
      } = await supabase
        .from("homework")
        .select("id, status")
        .eq("tutor_id", tutor.id);

      if (homeworkError) {
        console.error(
          "Homework query error:",
          homeworkError
        );
      } else {
        homeworkWaiting =
          tutorHomework?.filter((homework) => {
            const status =
              homework.status?.toLowerCase();

            return (
              status === "pending" ||
              status === "submitted" ||
              status === "waiting"
            );
          }).length || 0;
      }

      /*
       * ==========================================
       * SAVE DASHBOARD DATA
       * ==========================================
       */

      setData({
        tutor,
        studentCount: uniqueStudentIds.length,
        todaysClasses: todaysAssignments.length,
        pendingClasswork,
        homeworkWaiting,
        assignments: tutorAssignments,
        students: studentsMap,
      });
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ==========================================
   * TODAY'S SCHEDULE DISPLAY
   * ==========================================
   */

  const todaysSchedule = useMemo(() => {
    const today = new Date();

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const todayName = dayNames[today.getDay()];

    return data.assignments
      .filter(
        (assignment) =>
          assignment.day?.toLowerCase().trim() ===
            todayName.toLowerCase().trim() &&
          assignment.status?.toLowerCase() ===
            "scheduled"
      )
      .sort((a, b) =>
        (a.time_slot || "").localeCompare(
          b.time_slot || ""
        )
      );
  }, [data.assignments]);

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
          <Loader2
            size={35}
            className="mx-auto animate-spin text-yellow-500"
          />

          <p className="mt-4 text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ==========================================
   * ERROR
   * ==========================================
   */

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-red-50 p-8">
          <h1 className="text-2xl font-bold text-red-700">
            Unable to load dashboard
          </h1>

          <p className="mt-3 text-red-600">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-6 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div>
        <h1 className="text-4xl font-extrabold text-slate-900">
          Welcome Back,{" "}
          {data.tutor?.full_name || "Tutor"} 👋
        </h1>

        <p className="mt-3 text-slate-700">
          Here's everything happening in your classroom today.
        </p>
      </div>

      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        {/* Today's Classes */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <CalendarDays
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 font-semibold text-slate-600">
            Today's Classes
          </p>

          <h2 className="mt-2 text-4xl font-extrabold text-slate-900">
            {data.todaysClasses}
          </h2>
        </div>

        {/* Pending Classwork */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <ClipboardCheck
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 font-semibold text-slate-600">
            Pending Classwork
          </p>

          <h2 className="mt-2 text-4xl font-extrabold text-red-600">
            {data.pendingClasswork}
          </h2>
        </div>

        {/* Homework */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <BookOpen
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 font-semibold text-slate-600">
            Homework Waiting
          </p>

          <h2 className="mt-2 text-4xl font-extrabold text-slate-900">
            {data.homeworkWaiting}
          </h2>
        </div>

        {/* REAL STUDENT COUNT */}

        <Link
          href="/tutor-dashboard/students"
          className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <Users
            className="text-yellow-500"
            size={34}
          />

          <p className="mt-5 font-semibold text-slate-600">
            My Students
          </p>

          <h2 className="mt-2 text-4xl font-extrabold text-green-600">
            {data.studentCount}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Students assigned to you
          </p>
        </Link>

      </div>

      {/* ==========================================
          MAIN SECTION
      ========================================== */}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        {/* ========================================
            TODAY'S SCHEDULE
        ======================================== */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold text-slate-900">
              Today's Schedule
            </h2>

            <CalendarDays
              className="text-yellow-500"
              size={28}
            />

          </div>

          {todaysSchedule.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-center">
              <CalendarDays
                size={40}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 font-semibold text-slate-600">
                No classes scheduled today.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-5">

              {todaysSchedule.map((assignment) => {

                const student =
                  data.students[
                    assignment.student_id
                  ];

                return (
                  <div
                    key={assignment.id}
                    className="rounded-2xl border p-5"
                  >

                    <p className="font-semibold text-yellow-600">
                      {assignment.time_slot ||
                        "Time not set"}
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      Class
                    </h3>

                    <p className="mt-2 text-slate-600">
                      {student?.full_name ||
                        "Student"}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Scheduled lesson
                    </p>

                    {assignment.google_meet_link ? (
                      <a
                        href={
                          assignment.google_meet_link
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-900 hover:bg-yellow-400"
                      >
                        Start Class
                      </a>
                    ) : (
                      <Link
                        href={`/tutor-dashboard/students/${assignment.student_id}`}
                        className="mt-5 inline-flex rounded-xl bg-slate-900 px-6 py-3 font-bold text-white hover:bg-slate-800"
                      >
                        Open Student
                      </Link>
                    )}

                  </div>
                );
              })}

            </div>
          )}

        </div>

        {/* ========================================
            QUICK ACTIONS
        ======================================== */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Quick Actions
          </h2>

          <div className="mt-8 grid gap-5">

            <Link
              href="/tutor-dashboard/homework"
              className="flex items-center justify-between rounded-2xl border p-5 transition hover:bg-yellow-50"
            >
              <span className="font-semibold">
                Assign Homework
              </span>

              <ArrowRight size={20} />
            </Link>

            <Link
              href="/tutor-dashboard/resources"
              className="flex items-center justify-between rounded-2xl border p-5 transition hover:bg-yellow-50"
            >
              <span className="font-semibold">
                Upload Learning Resource
              </span>

              <ArrowRight size={20} />
            </Link>

            <Link
              href="/tutor-dashboard/students"
              className="flex items-center justify-between rounded-2xl border p-5 transition hover:bg-yellow-50"
            >
              <span className="font-semibold">
                Open Students Workspace
              </span>

              <ArrowRight size={20} />
            </Link>

            <Link
              href="/tutor-dashboard/classwork"
              className="flex items-center justify-between rounded-2xl border p-5 transition hover:bg-yellow-50"
            >
              <span className="font-semibold">
                Create Classwork
              </span>

              <ArrowRight size={20} />
            </Link>

          </div>

        </div>

      </div>

      {/* ==========================================
          RECENT ACTIVITY + WEEKLY OVERVIEW
      ========================================== */}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        {/* Recent Activity */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center gap-3">

            <Bell
              size={28}
              className="text-yellow-500"
            />

            <h2 className="text-2xl font-bold">
              Recent Activity
            </h2>

          </div>

          <div className="mt-8 space-y-5">

            <p className="text-slate-600">
              👥 You currently have{" "}
              <strong className="text-slate-900">
                {data.studentCount}
              </strong>{" "}
              assigned student
              {data.studentCount === 1 ? "" : "s"}.
            </p>

            <p className="text-slate-600">
              📅 You have{" "}
              <strong className="text-slate-900">
                {data.todaysClasses}
              </strong>{" "}
              scheduled class
              {data.todaysClasses === 1 ? "" : "es"} today.
            </p>

            <p className="text-slate-600">
              📝{" "}
              <strong className="text-slate-900">
                {data.pendingClasswork}
              </strong>{" "}
              classwork submission
              {data.pendingClasswork === 1
                ? ""
                : "s"} waiting for review.
            </p>

            <p className="text-slate-600">
              📚{" "}
              <strong className="text-slate-900">
                {data.homeworkWaiting}
              </strong>{" "}
              homework item
              {data.homeworkWaiting === 1
                ? ""
                : "s"} waiting.
            </p>

          </div>

        </div>

        {/* Weekly Overview */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center gap-3">

            <TrendingUp
              size={28}
              className="text-yellow-500"
            />

            <h2 className="text-2xl font-bold">
              Teaching Overview
            </h2>

          </div>

          <div className="mt-8 space-y-5">

            <div className="flex justify-between">
              <span className="text-slate-600">
                Assigned Students
              </span>

              <strong>
                {data.studentCount}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">
                Classes Today
              </span>

              <strong>
                {data.todaysClasses}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">
                Pending Classwork
              </span>

              <strong>
                {data.pendingClasswork}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">
                Homework Waiting
              </span>

              <strong>
                {data.homeworkWaiting}
              </strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}