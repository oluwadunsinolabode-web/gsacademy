"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  BookOpen,
  Bell,
  UserRound,
  FileText,
  ArrowRight,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  auth_id: string;
  full_name: string;
  email?: string | null;
  package?: string | null;
};

type Schedule = {
  id: string;
  day: string;
  time: string;
  meet_link: string | null;

  subjects:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;

  tutors:
    | {
        id: string;
        full_name: string;
      }
    | {
        id: string;
        full_name: string;
      }[]
    | null;
};

type StudentSubject = {
  id: string;
  name: string;
};

type Classwork = {
  id: string;
  tutor_id: string;
  subject: string;
  title: string;
  description: string | null;
  attachment_url: string | null;
  due_date: string | null;
  status: string;
  created_at: string;
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getNextLesson(
  scheduleList: Schedule[]
): Schedule | null {
  if (scheduleList.length === 0) {
    return null;
  }

  const now = new Date();

  const today = now.getDay();

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const lessons = scheduleList
    .map((lesson) => {
      const dayIndex = DAYS.indexOf(lesson.day);

      if (dayIndex === -1) {
        return null;
      }

      const start = lesson.time
        .split("-")[0]
        .trim();

      const parts = start.split(" ");

      if (parts.length !== 2) {
        return null;
      }

      const clock = parts[0];

      const period = parts[1].toUpperCase();

      let [hour, minute] = clock
        .split(":")
        .map(Number);

      if (
        Number.isNaN(hour) ||
        Number.isNaN(minute)
      ) {
        return null;
      }

      if (
        period === "PM" &&
        hour !== 12
      ) {
        hour += 12;
      }

      if (
        period === "AM" &&
        hour === 12
      ) {
        hour = 0;
      }

      const lessonMinutes =
        hour * 60 + minute;

      let daysUntil =
        (dayIndex - today + 7) % 7;

      if (
        daysUntil === 0 &&
        lessonMinutes < currentMinutes
      ) {
        daysUntil = 7;
      }

      return {
        lesson,
        daysUntil,
        lessonMinutes,
      };
    })
    .filter(
      (
        item
      ): item is {
        lesson: Schedule;
        daysUntil: number;
        lessonMinutes: number;
      } => item !== null
    )
    .sort((a, b) => {
      if (
        a.daysUntil !==
        b.daysUntil
      ) {
        return (
          a.daysUntil -
          b.daysUntil
        );
      }

      return (
        a.lessonMinutes -
        b.lessonMinutes
      );
    });

  return lessons.length > 0
    ? lessons[0].lesson
    : null;
}

function getSubjectName(
  schedule: Schedule
): string {
  if (!schedule.subjects) {
    return "Subject";
  }

  if (
    Array.isArray(schedule.subjects)
  ) {
    return (
      schedule.subjects[0]?.name ||
      "Subject"
    );
  }

  return (
    schedule.subjects.name ||
    "Subject"
  );
}

function getTutorName(
  schedule: Schedule
): string {
  if (!schedule.tutors) {
    return "Tutor not assigned";
  }

  if (
    Array.isArray(schedule.tutors)
  ) {
    return (
      schedule.tutors[0]?.full_name ||
      "Tutor not assigned"
    );
  }

  return (
    schedule.tutors.full_name ||
    "Tutor not assigned"
  );
}

/*
 * Normalize subject names only for matching.
 *
 * We do NOT change anything in the database.
 * This simply prevents "Maths" and "Mathematics"
 * from being treated as two completely different
 * subjects on the dashboard.
 */
function normalizeSubject(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/*
 * Match classwork subject to the student's
 * canonical subject name.
 */
function subjectsMatch(
  classworkSubject: string,
  studentSubject: string
): boolean {
  const a =
    normalizeSubject(
      classworkSubject
    );

  const b =
    normalizeSubject(
      studentSubject
    );

  if (a === b) {
    return true;
  }

  /*
   * Existing database may contain "Maths"
   * while the subjects table contains
   * "Mathematics".
   */
  if (
    (a === "maths" &&
      b === "mathematics") ||
    (a === "mathematics" &&
      b === "maths")
  ) {
    return true;
  }

  return false;
}

export default function DashboardPage() {
  const [student, setStudent] =
    useState<Student | null>(null);

  const [schedules, setSchedules] =
    useState<Schedule[]>([]);

  const [studentSubjects, setStudentSubjects] =
    useState<StudentSubject[]>([]);

  const [classworks, setClassworks] =
    useState<Classwork[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        // =====================================
        // GET LOGGED-IN USER
        // =====================================

        const {
          data: { user },
          error: authError,
        } =
          await supabase.auth.getUser();

        console.log(
          "CURRENT AUTH ID:",
          user?.id
        );

        console.log(
          "CURRENT AUTH EMAIL:",
          user?.email
        );

        if (
          authError ||
          !user
        ) {
          throw new Error(
            "No logged-in student found."
          );
        }

        // =====================================
        // GET STUDENT PROFILE
        // =====================================

        const {
          data: studentData,
          error: studentError,
        } =
          await supabase
            .from("students")
            .select(
              `
                id,
                auth_id,
                full_name,
                email,
                package
              `
            )
            .eq(
              "auth_id",
              user.id
            )
            .single();

        console.log(
          "STUDENT:",
          studentData
        );

        if (
          studentError ||
          !studentData
        ) {
          throw new Error(
            studentError?.message ||
              "Student profile not found."
          );
        }

        setStudent(
          studentData
        );

        // =====================================
        // GET STUDENT SCHEDULES
        // =====================================

        const {
          data: scheduleData,
          error: scheduleError,
        } =
          await supabase
            .from("student_schedules")
            .select(
              `
                id,
                day,
                time,
                meet_link,

                subjects (
                  id,
                  name
                ),

                tutors (
                  id,
                  full_name
                )
              `
            )
            .eq(
              "student_id",
              studentData.id
            );

        if (scheduleError) {
          throw new Error(
            scheduleError.message
          );
        }

        const schedulesList =
          (scheduleData ||
            []) as Schedule[];

        setSchedules(
          schedulesList
        );

        // =====================================
        // GET REAL STUDENT SUBJECTS
        // =====================================
        //
        // Source 1:
        // student_schedules → subjects
        //
        // Source 2:
        // tutor_assignments → subjects
        //
        // We combine both so the dashboard
        // reflects the actual subjects assigned
        // to the student.
        // =====================================

        const subjectsMap =
          new Map<
            string,
            StudentSubject
          >();

        // -------------------------------------
        // SUBJECTS FROM STUDENT SCHEDULES
        // -------------------------------------

        schedulesList.forEach(
          (schedule) => {
            if (!schedule.subjects) {
              return;
            }

            const subjectList =
              Array.isArray(
                schedule.subjects
              )
                ? schedule.subjects
                : [
                    schedule.subjects,
                  ];

            subjectList.forEach(
              (subject) => {
                if (
                  subject?.id &&
                  subject?.name
                ) {
                  subjectsMap.set(
                    subject.id,
                    {
                      id: subject.id,
                      name: subject.name,
                    }
                  );
                }
              }
            );
          }
        );

        // -------------------------------------
        // SUBJECTS FROM TUTOR ASSIGNMENTS
        // -------------------------------------

        const {
          data: tutorAssignments,
          error:
            tutorAssignmentError,
        } =
          await supabase
            .from(
              "tutor_assignments"
            )
            .select(
              `
                subject_id,
                subjects (
                  id,
                  name
                )
              `
            )
            .eq(
              "student_id",
              studentData.id
            );

        if (
          tutorAssignmentError
        ) {
          throw new Error(
            tutorAssignmentError.message
          );
        }

        (
          tutorAssignments || []
        ).forEach(
          (
            assignment: any
          ) => {
            const subject =
              assignment.subjects;

            if (
              subject?.id &&
              subject?.name
            ) {
              subjectsMap.set(
                subject.id,
                {
                  id: subject.id,
                  name: subject.name,
                }
              );
            }
          }
        );

        const subjectsList =
          Array.from(
            subjectsMap.values()
          ).sort(
            (a, b) =>
              a.name.localeCompare(
                b.name
              )
          );

        console.log(
          "REAL STUDENT SUBJECTS:",
          subjectsList
        );

        setStudentSubjects(
          subjectsList
        );

        // =====================================
        // GET CLASSWORK ASSIGNMENTS
        // =====================================

        const {
          data: assignments,
          error: assignmentError,
        } =
          await supabase
            .from(
              "classwork_assignments"
            )
            .select(
              "id, classwork_id, student_id"
            )
            .eq(
              "student_id",
              studentData.id
            );

        console.log(
          "CLASSWORK ASSIGNMENTS:",
          assignments
        );

        if (assignmentError) {
          throw new Error(
            assignmentError.message
          );
        }

        if (
          !assignments ||
          assignments.length === 0
        ) {
          setClassworks([]);
          return;
        }

        // =====================================
        // GET CLASSWORK IDS
        // =====================================

        const classworkIds =
          assignments
            .map(
              (assignment) =>
                assignment.classwork_id
            )
            .filter(Boolean);

        if (
          classworkIds.length === 0
        ) {
          setClassworks([]);
          return;
        }

        // =====================================
        // GET ACTUAL CLASSWORK
        // =====================================

        const {
          data: classworkData,
          error: classworkError,
        } =
          await supabase
            .from("classworks")
            .select(
              `
                id,
                tutor_id,
                subject,
                title,
                description,
                attachment_url,
                due_date,
                status,
                created_at
              `
            )
            .in(
              "id",
              classworkIds
            )
            .order(
              "created_at",
              {
                ascending: false,
              }
            );

        if (classworkError) {
          throw new Error(
            classworkError.message
          );
        }

        setClassworks(
          (classworkData ||
            []) as Classwork[]
        );
      } catch (dashboardError) {
        console.error(
          "DASHBOARD ERROR:",
          dashboardError
        );

        setError(
          dashboardError instanceof
            Error
            ? dashboardError.message
            : "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // =====================================
  // REFRESH NEXT LESSON EVERY MINUTE
  // =====================================

  useEffect(() => {
    const interval =
      setInterval(() => {
        setSchedules(
          (current) => [
            ...current,
          ]
        );
      }, 60000);

    return () =>
      clearInterval(interval);
  }, []);

  const nextLesson =
    getNextLesson(
      schedules
    );

  // =====================================
  // GROUP CLASSWORK BY REAL SUBJECT
  // =====================================

  const classworkBySubject =
    useMemo(() => {
      return studentSubjects
        .map((subject) => {
          const works =
            classworks.filter(
              (work) =>
                subjectsMatch(
                  work.subject,
                  subject.name
                )
            );

          return {
            subject,
            works,
          };
        })
        .filter(
          (group) =>
            group.works.length > 0
        );
    }, [
      studentSubjects,
      classworks,
    ]);

  // =====================================
  // CLASSWORK NOT MATCHED TO A SUBJECT
  // =====================================
  //
  // This protects us from hiding a classwork
  // if a tutor entered a subject name that does
  // not currently match the student's canonical
  // subject.
  // =====================================

  const unmatchedClassworks =
    useMemo(() => {
      return classworks.filter(
        (work) =>
          !studentSubjects.some(
            (subject) =>
              subjectsMatch(
                work.subject,
                subject.name
              )
          )
      );
    }, [
      classworks,
      studentSubjects,
    ]);

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-lg font-semibold text-slate-600">
          Loading dashboard...
        </p>
      </div>
    );
  }

  // =====================================
  // ERROR
  // =====================================

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Unable to load dashboard
        </h1>

        <p className="mt-2 text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="pb-10">

      {/* =====================================
          HEADER
      ====================================== */}

      <div>
        <h1 className="text-4xl font-extrabold text-slate-900">
          Welcome{" "}
          {student?.full_name || ""}
        </h1>

        <p className="mt-3 text-slate-700">
          Here is an overview of your
          learning activities.
        </p>
      </div>

      {/* =====================================
          SUMMARY CARDS
      ====================================== */}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        {/* NEXT LESSON */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <CalendarDays
            className="text-yellow-600"
            size={32}
          />

          <p className="mt-5 font-bold text-slate-700">
            Next Lesson
          </p>

          {nextLesson ? (
            <>
              <h3 className="mt-3 text-xl font-extrabold text-slate-900">
                {nextLesson.day}
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                {nextLesson.time}
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {getSubjectName(
                  nextLesson
                )}
              </p>
            </>
          ) : (
            <h3 className="mt-3 text-xl font-extrabold text-slate-900">
              No lesson scheduled
            </h3>
          )}
        </div>

        {/* PACKAGE */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <BookOpen
            className="text-yellow-600"
            size={32}
          />

          <p className="mt-5 font-bold text-slate-700">
            Package
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            {student?.package ||
              "Not assigned"}
          </h3>
        </div>

        {/* LESSONS */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <UserRound
            className="text-yellow-600"
            size={32}
          />

          <p className="mt-5 font-bold text-slate-700">
            Lessons
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            {schedules.length}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Scheduled lessons
          </p>
        </div>

        {/* CLASSWORK */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <FileText
            className="text-yellow-600"
            size={32}
          />

          <p className="mt-5 font-bold text-slate-700">
            Classwork
          </p>

          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            {classworks.length}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Assigned to you
          </p>
        </div>
      </div>

      {/* =====================================
          UPCOMING LESSON + UPDATES
      ====================================== */}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        {/* UPCOMING LESSON */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <CalendarDays
              size={30}
              className="text-yellow-600"
            />

            <h2 className="text-2xl font-bold text-slate-900">
              Upcoming Lesson
            </h2>
          </div>

          {nextLesson ? (
            <div className="mt-6">

              <h3 className="text-xl font-bold text-slate-900">
                {getSubjectName(
                  nextLesson
                )}
              </h3>

              <p className="mt-2 text-lg font-semibold text-slate-700">
                {nextLesson.day}
                {" — "}
                {nextLesson.time}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Tutor:{" "}
                <span className="font-semibold text-slate-900">
                  {getTutorName(
                    nextLesson
                  )}
                </span>
              </p>

              {nextLesson.meet_link ? (
                <a
                  href={
                    nextLesson.meet_link
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-block rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900 transition hover:bg-yellow-400"
                >
                  Join Class
                </a>
              ) : (
                <button
                  disabled
                  className="mt-8 rounded-xl bg-slate-300 px-8 py-4 font-bold text-slate-600"
                >
                  Class Link Not Available
                </button>
              )}
            </div>
          ) : (
            <p className="mt-6 text-slate-600">
              Your timetable will appear
              here once your lessons have
              been scheduled.
            </p>
          )}
        </div>

        {/* LATEST UPDATES */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <Bell
              size={30}
              className="text-yellow-600"
            />

            <h2 className="text-2xl font-bold text-slate-900">
              Latest Updates
            </h2>
          </div>

          <p className="mt-5 text-lg font-semibold leading-8 text-slate-900">
            Welcome to GS Academy.
            Your lessons, classwork and
            learning updates will appear
            here.
          </p>
        </div>
      </div>

      {/* =====================================
          MY CLASSWORK
      ====================================== */}

      <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <FileText
              size={30}
              className="text-yellow-600"
            />

            <div>

              <h2 className="text-2xl font-bold text-slate-900">
                My Classwork
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Classwork assigned by your tutors.
              </p>

            </div>

          </div>

          <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-700">
            {classworks.length}{" "}
            {classworks.length === 1
              ? "Assignment"
              : "Assignments"}
          </span>

        </div>

        {/* =====================================
            NO CLASSWORK
        ====================================== */}

        {classworks.length === 0 ? (

          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

            <FileText
              size={45}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 text-xl font-bold text-slate-900">
              No classwork yet
            </h3>

            <p className="mt-2 text-slate-600">
              Your tutor has not assigned
              any classwork yet.
            </p>

          </div>

        ) : (

          <div className="mt-8 space-y-6">

            {/* =================================
                REAL SUBJECT GROUPS
            ================================= */}

            {classworkBySubject.map(
              (group) => {

                const latest =
                  group.works[0];

                return (
                  <div
                    key={group.subject.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
                  >

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <div className="flex items-center gap-3">

                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100">

                            <BookOpen
                              size={24}
                              className="text-yellow-600"
                            />

                          </div>

                          <div>

                            <h3 className="text-xl font-extrabold text-slate-900">
                              {group.subject.name}
                            </h3>

                            <p className="mt-1 text-sm font-medium text-slate-500">
                              {group.works.length}{" "}
                              {group.works.length ===
                              1
                                ? "classwork"
                                : "classworks"}
                            </p>

                          </div>

                        </div>

                        {latest && (
                          <p className="mt-5 text-sm text-slate-600">
                            Latest:{" "}
                            <span className="font-bold text-slate-900">
                              {latest.title}
                            </span>
                          </p>
                        )}

                      </div>

                      <Link
                        href={`/dashboard/classwork?subject=${encodeURIComponent(
                          group.subject.name
                        )}`}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-800"
                      >
                        View Classwork

                        <ArrowRight
                          size={18}
                        />
                      </Link>

                    </div>

                    {/* RECENT ASSIGNMENTS */}

                    <div className="mt-6 border-t border-slate-200 pt-5">

                      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                        Recent assignments
                      </p>

                      <div className="mt-4 space-y-3">

                        {group.works
                          .slice(0, 3)
                          .map(
                            (work) => (
                              <div
                                key={
                                  work.id
                                }
                                className="flex flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                              >

                                <div className="min-w-0">

                                  <p className="font-bold text-slate-900">
                                    {work.title}
                                  </p>

                                  {work.due_date && (
                                    <p className="mt-1 text-xs font-semibold text-slate-500">
                                      Due:{" "}
                                      {new Date(
                                        work.due_date
                                      ).toLocaleString()}
                                    </p>
                                  )}

                                </div>

                                <Link
                                  href={`/dashboard/classwork?id=${work.id}`}
                                  className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-yellow-700 hover:text-yellow-800"
                                >
                                  Open
                                  <ArrowRight
                                    size={
                                      16
                                    }
                                  />
                                </Link>

                              </div>
                            )
                          )}

                      </div>

                    </div>

                  </div>
                );
              }
            )}

            {/* =================================
                UNMATCHED CLASSWORK SAFETY NET
            ================================= */}

            {unmatchedClassworks.length >
              0 && (

              <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6">

                <div className="flex items-center gap-3">

                  <FileText
                    size={24}
                    className="text-orange-600"
                  />

                  <div>

                    <h3 className="font-bold text-orange-900">
                      Other Classwork
                    </h3>

                    <p className="mt-1 text-sm text-orange-700">
                      These assignments could not
                      currently be matched to one
                      of your subjects.
                    </p>

                  </div>

                </div>

                <div className="mt-4 space-y-3">

                  {unmatchedClassworks
                    .slice(0, 3)
                    .map(
                      (work) => (
                        <Link
                          key={
                            work.id
                          }
                          href={`/dashboard/classwork?id=${work.id}`}
                          className="flex items-center justify-between rounded-2xl bg-white p-4"
                        >

                          <div>

                            <p className="font-bold text-slate-900">
                              {work.title}
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {work.subject}
                            </p>

                          </div>

                          <ArrowRight
                            size={18}
                            className="text-slate-500"
                          />

                        </Link>
                      )
                    )}

                </div>

              </div>

            )}

          </div>

        )}

      </div>

      {/* =====================================
          FULL TIMETABLE
      ====================================== */}

      <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <CalendarDays
            size={30}
            className="text-yellow-600"
          />

          <h2 className="text-2xl font-bold text-slate-900">
            My Timetable
          </h2>

        </div>

        {schedules.length === 0 ? (

          <p className="mt-6 text-slate-600">
            No lessons have been scheduled
            yet.
          </p>

        ) : (

          <div className="mt-6 space-y-4">

            {schedules.map(
              (schedule) => (

                <div
                  key={schedule.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                      <h3 className="text-lg font-bold text-slate-900">
                        {getSubjectName(
                          schedule
                        )}
                      </h3>

                      <p className="mt-1 font-semibold text-slate-700">
                        {schedule.day}
                        {" — "}
                        {schedule.time}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Tutor:{" "}
                        <span className="font-semibold text-slate-800">
                          {getTutorName(
                            schedule
                          )}
                        </span>
                      </p>

                    </div>

                    {schedule.meet_link && (
                      <a
                        href={
                          schedule.meet_link
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-xl bg-yellow-500 px-5 py-3 text-center font-bold text-slate-900 transition hover:bg-yellow-400"
                      >
                        Join Class
                      </a>
                    )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}