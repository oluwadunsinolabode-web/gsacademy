import Link from "next/link";

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-6xl">

      <div className="flex items-end justify-between">

        <div>

          <h1 className="text-4xl font-extrabold">
            Learning Resources
          </h1>

          <p className="mt-3 text-slate-700">
            Upload lesson notes and learning materials.
          </p>

        </div>

        <Link
          href="/admin-dashboard/resources/new"
          className="rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900"
        >
          Upload Resource
        </Link>

      </div>

      <div className="mt-10 rounded-3xl bg-white p-10 shadow-sm">

        Uploaded resources will appear here.

      </div>

    </div>
  );
}