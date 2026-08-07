"use client";

type Subject = {
  id: string;
  name: string;
};

type Assignment = {
  subject_id: string;
  tutor_id: string;
};

type Tutor = {
  id: string;
  full_name: string;
};

type Props = {
  studentId: string;
  subjects: Subject[];
  selectedSubjects: string[];
  assignments: Assignment[];
  tutors: Tutor[];
};

export default function StudentScheduleEditor({
  studentId,
  subjects,
  selectedSubjects,
  assignments,
  tutors,
}: Props) {
  return (
    <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h2 className="mb-4 text-xl font-bold">
        Student Schedule
      </h2>

      {selectedSubjects.length === 0 ? (
        <p className="text-slate-500">
          No subjects selected.
        </p>
      ) : (
        <div className="space-y-4">
          {selectedSubjects.map((subjectName) => {
            const subject = subjects.find(
              (s) => s.name === subjectName
            );

            if (!subject) return null;

            const assignment = assignments.find(
              (a) => a.subject_id === subject.id
            );

            const tutor = tutors.find(
              (t) => t.id === assignment?.tutor_id
            );

            return (
              <div
                key={subject.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <h3 className="font-semibold">
                  {subject.name}
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  Tutor: {tutor?.full_name ?? "No tutor assigned"}
                </p>

                <p className="text-sm text-slate-500">
                  Schedule: Not created yet
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Student ID: {studentId}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}