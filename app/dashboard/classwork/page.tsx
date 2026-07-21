"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, Camera, FileText, X, CheckCircle } from "lucide-react";

export default function ClassworkPage() {
  const [files, setFiles] = useState<File[]>([]);
  const subject = "Mathematics";
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "",
      })),
    [files]
  );


  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [previews]);


  const addFiles = (list: FileList | null) => {
    if (!list) return;

    setFiles((prev) => [
      ...prev,
      ...Array.from(list),
    ]);
  };


  const removeFile = (index: number) => {
    setFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };


  async function upload() {

    if (files.length === 0) {
      setMessage("Please select your classwork first.");
      return;
    }


    setUploading(true);
    setProgress(0);
    setMessage("");


    const {
      data: { user },
    } = await supabase.auth.getUser();



    for (let i = 0; i < files.length; i++) {

      const file = files[i];


      const path =
        `${user?.id ?? "guest"}/${Date.now()}-${file.name}`;



      const { error: storageError } =
        await supabase.storage
          .from("classwork-submissions")
          .upload(path, file);



      if (storageError) {

        setMessage(storageError.message);
        setUploading(false);
        return;

      }



      const { data: publicData } =
        supabase.storage
          .from("classwork-submissions")
          .getPublicUrl(path);



      const { error: dbError } =
        await supabase
          .from("classwork_submissions")
          .insert({
            student_email: user?.email,
            subject,
            image_url: publicData.publicUrl,
          });



      if (dbError) {

        setMessage(dbError.message);
        setUploading(false);
        return;

      }



      setProgress(
        Math.round(((i + 1) / files.length) * 100)
      );

    }



    setFiles([]);
    setProgress(100);
    setMessage("Your Mathematics classwork has been submitted successfully.");
    setUploading(false);

  }



  return (

    <div className="mx-auto max-w-6xl">


      <h1 className="text-4xl font-extrabold text-slate-900">
        Submit Classwork
      </h1>


      <p className="mt-3 text-slate-700">
        Upload your handwritten answers by taking a picture or selecting a file.
      </p>



      {/* Class Information */}

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">


        <p className="font-semibold text-yellow-600">
          Today's Classwork
        </p>


        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Mathematics
        </h2>


        <p className="mt-3 text-slate-700">
          Upload your completed answers for today's lesson.
        </p>


      </div>





      {/* Upload Box */}

      <div
        onDragOver={(e)=>e.preventDefault()}

        onDrop={(e)=>{
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}

        className="mt-8 rounded-3xl border-2 border-dashed border-yellow-500 bg-white p-10 text-center"
      >


        <Upload
          size={45}
          className="mx-auto text-yellow-600"
        />


        <h2 className="mt-5 text-2xl font-bold text-slate-900">
          Upload Your Work
        </h2>


        <p className="mt-2 text-slate-700">
          Take a photo of your work or choose a file.
        </p>



        <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-yellow-500 px-8 py-4 font-bold text-slate-900 hover:bg-yellow-400">


          <Camera size={22}/>

          Take Photo / Choose File


          <input
            hidden
            type="file"
            multiple
            accept="image/*,.pdf"
            capture="environment"
            onChange={(e)=>addFiles(e.target.files)}
          />


        </label>



        <p className="mt-4 text-sm text-slate-700">
          Supported files: JPG, PNG and PDF
        </p>


      </div>





      {/* Preview */}

      {files.length > 0 && (

        <div className="mt-10">


          <h2 className="text-2xl font-bold text-slate-900">
            Selected Files
          </h2>



          <div className="mt-5 grid gap-6 md:grid-cols-3">


          {previews.map((item,index)=>(


            <div
              key={index}
              className="rounded-2xl bg-white p-5 shadow"
            >


              {item.url ? (

                <img
                  src={item.url}
                  className="h-40 w-full rounded-xl object-cover"
                  alt=""
                />

              ) : (

                <div className="flex h-40 items-center justify-center rounded-xl bg-slate-100">

                  <FileText size={45}/>

                </div>

              )}



              <p className="mt-3 truncate font-medium text-slate-800">
                {item.file.name}
              </p>



              <button

                onClick={()=>removeFile(index)}

                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2 font-semibold text-white hover:bg-red-700"
              >

                <X size={18}/>

                Remove

              </button>


            </div>


          ))}


          </div>


        </div>

      )}





      {/* Progress */}

      {uploading && (

        <div className="mt-10">


          <div className="h-4 rounded-full bg-slate-200">

            <div

              className="h-4 rounded-full bg-yellow-500 transition-all"

              style={{
                width:`${progress}%`
              }}

            />

          </div>


          <p className="mt-3 font-semibold text-slate-800">
            Uploading {progress}%
          </p>


        </div>

      )}






      <button

        onClick={upload}

        disabled={uploading}

        className="mt-10 rounded-xl bg-slate-900 px-10 py-4 font-bold text-white hover:bg-slate-800 disabled:opacity-50"

      >

        {uploading ? "Submitting..." : "Submit Classwork"}

      </button>






      {message && (

        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white p-5 shadow">


          <CheckCircle className="text-green-600"/>


          <p className="font-semibold text-slate-900">
            {message}
          </p>


        </div>

      )}


    </div>

  );
}