import Link from "next/link";

export default function AnnouncementsPage() {
  return (
    <div className="mx-auto max-w-7xl">

      <div className="flex items-end justify-between">

        <div>

          <h1 className="text-4xl font-extrabold">
            Announcements
          </h1>

          <p className="mt-3 text-slate-700">
            Send announcements to students and tutors.
          </p>

        </div>

        <Link
          href="/admin-dashboard/announcements/new"
          className="rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900"
        >
          New Announcement
        </Link>

      </div>

      <div className="mt-10 rounded-3xl bg-white p-10 shadow-sm">

        Announcements will appear here.

      </div>

    </div>
  );
}