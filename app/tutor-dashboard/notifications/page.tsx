import {
  Bell,
  FileCheck,
  Upload,
  Users,
  CalendarDays,
} from "lucide-react";

export default function TutorNotificationsPage() {
  return (
    <div className="mx-auto max-w-7xl">

      <h1 className="text-4xl font-extrabold text-slate-900">
        Notifications
      </h1>

      <p className="mt-3 text-slate-600">
        Stay updated with student activities and academy announcements.
      </p>

      <div className="mt-10 space-y-6">

        {/* Notification */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex items-start gap-5">

            <div className="rounded-2xl bg-yellow-100 p-3">

              <Upload
                className="text-yellow-600"
                size={28}
              />

            </div>

            <div className="flex-1">

              <h2 className="font-bold text-slate-900">
                New Classwork Submitted
              </h2>

              <p className="mt-2 text-slate-600">
                Samuel Johnson has submitted today's Mathematics classwork.
              </p>

              <p className="mt-3 text-sm text-slate-400">
                5 minutes ago
              </p>

            </div>

          </div>

        </div>



        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex items-start gap-5">

            <div className="rounded-2xl bg-yellow-100 p-3">

              <FileCheck
                className="text-yellow-600"
                size={28}
              />

            </div>

            <div className="flex-1">

              <h2 className="font-bold text-slate-900">
                Homework Due Today
              </h2>

              <p className="mt-2 text-slate-600">
                Three students have not submitted their homework.
              </p>

              <p className="mt-3 text-sm text-slate-400">
                Today
              </p>

            </div>

          </div>

        </div>



        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex items-start gap-5">

            <div className="rounded-2xl bg-yellow-100 p-3">

              <Users
                className="text-yellow-600"
                size={28}
              />

            </div>

            <div className="flex-1">

              <h2 className="font-bold text-slate-900">
                New Student Assigned
              </h2>

              <p className="mt-2 text-slate-600">
                A new student has been assigned to your Mathematics class.
              </p>

              <p className="mt-3 text-sm text-slate-400">
                Yesterday
              </p>

            </div>

          </div>

        </div>



        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex items-start gap-5">

            <div className="rounded-2xl bg-yellow-100 p-3">

              <CalendarDays
                className="text-yellow-600"
                size={28}
              />

            </div>

            <div className="flex-1">

              <h2 className="font-bold text-slate-900">
                Tomorrow's Classes
              </h2>

              <p className="mt-2 text-slate-600">
                You have two scheduled lessons tomorrow.
              </p>

              <p className="mt-3 text-sm text-slate-400">
                Tomorrow
              </p>

            </div>

          </div>

        </div>



        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex items-start gap-5">

            <div className="rounded-2xl bg-yellow-100 p-3">

              <Bell
                className="text-yellow-600"
                size={28}
              />

            </div>

            <div className="flex-1">

              <h2 className="font-bold text-slate-900">
                Academy Announcement
              </h2>

              <p className="mt-2 text-slate-600">
                Important announcements from GS Academy will appear here.
              </p>

              <p className="mt-3 text-sm text-slate-400">
                Admin
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}