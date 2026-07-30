"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  ImageIcon,
  BookOpen,
  CheckCircle,
} from "lucide-react";

export default function TutorResourcesPage() {
  const [fileName, setFileName] = useState("");

  return (
    <div className="mx-auto max-w-7xl">

      <h1 className="text-4xl font-extrabold text-slate-900">
        Learning Resources
      </h1>

      <p className="mt-3 text-slate-600">
        Upload learning materials for your assigned students.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        {/* Upload Card */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Upload Resource
          </h2>

          <div className="mt-8 space-y-6">

            <div>
              <label className="font-semibold text-slate-700">
                Resource Title
              </label>

              <input
                type="text"
                placeholder="Example: Algebra Formula Sheet"
                className="mt-2 w-full rounded-xl border border-slate-300 px-5 py-4 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">
                Subject
              </label>

              <select className="mt-2 w-full rounded-xl border border-slate-300 px-5 py-4 focus:border-yellow-500 focus:outline-none">

                <option>Mathematics</option>
                <option>English</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Biology</option>

              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700">
                Description (Optional)
              </label>

              <textarea
                rows={4}
                placeholder="Brief description..."
                className="mt-2 w-full rounded-xl border border-slate-300 px-5 py-4 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>

              <label className="font-semibold text-slate-700">
                Upload File
              </label>

              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-yellow-500 bg-slate-50 p-10 text-center">

                <Upload
                  size={40}
                  className="text-yellow-600"
                />

                <p className="mt-4 font-semibold">
                  Click to choose file
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  PDF, Images, DOCX, PPTX
                </p>

                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    setFileName(
                      e.target.files?.[0]?.name || ""
                    )
                  }
                />

              </label>

              {fileName && (

                <div className="mt-4 rounded-xl bg-green-50 p-4">

                  <p className="font-semibold text-green-700">
                    {fileName}
                  </p>

                </div>

              )}

            </div>

            <button className="w-full rounded-xl bg-yellow-500 py-4 font-bold text-slate-900 transition hover:bg-yellow-400">

              Publish Resource

            </button>

          </div>

        </div>





        {/* Published Resources */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Published Resources
          </h2>

          <div className="mt-8 space-y-5">

            <div className="rounded-2xl border p-5">

              <div className="flex items-center gap-4">

                <BookOpen
                  className="text-yellow-500"
                  size={30}
                />

                <div>

                  <h3 className="font-bold text-slate-900">
                    Algebra Formula Sheet
                  </h3>

                  <p className="text-sm text-slate-500">
                    Mathematics
                  </p>

                </div>

              </div>

            </div>

            <div className="rounded-2xl border p-5">

              <div className="flex items-center gap-4">

                <FileText
                  className="text-yellow-500"
                  size={30}
                />

                <div>

                  <h3 className="font-bold text-slate-900">
                    Weekly Practice Questions
                  </h3>

                  <p className="text-sm text-slate-500">
                    Mathematics
                  </p>

                </div>

              </div>

            </div>

            <div className="rounded-2xl border p-5">

              <div className="flex items-center gap-4">

                <ImageIcon
                  className="text-yellow-500"
                  size={30}
                />

                <div>

                  <h3 className="font-bold text-slate-900">
                    Worked Example
                  </h3>

                  <p className="text-sm text-slate-500">
                    Mathematics
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <CheckCircle
            className="text-green-600"
            size={28}
          />

          <div>

            <h3 className="font-bold text-slate-900">
              Future Automation
            </h3>

            <p className="text-slate-600">
              Every published resource will automatically appear inside the Learning Resources page of all students assigned to you.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}