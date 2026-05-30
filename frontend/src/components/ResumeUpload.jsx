import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      return toast.error(
        "Please select a file"
      );
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const res = await API.post(
        "/resume/upload",
        formData
      );

      toast.success(
        "Resume uploaded successfully"
      );

      console.log(res.data);

      navigate(`/resume/${res.data.resume._id}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="resume-upload"
          className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-blue-500 hover:bg-blue-50"
        >
          <span className="grid size-16 place-items-center rounded-2xl bg-slate-950 text-2xl font-black text-white">
            PDF
          </span>
          <span className="mt-5 text-2xl font-black text-slate-950">
            {file ? file.name : "Drop your resume here"}
          </span>
          <span className="mt-2 max-w-md text-sm leading-6 text-slate-600">
            Upload a text-based PDF so the analyser can read the resume content, calculate the ATS score, and build an enhanced version.
          </span>
          <span className="mt-5 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
            Choose PDF file
          </span>
        </label>

        <input
          id="resume-upload"
          type="file"
          accept=".pdf"
          className="sr-only"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
        />

        <div className="mt-5">
          <label htmlFor="job-desc" className="block text-sm font-bold text-slate-900 mb-2">
            Target Job Description (Optional)
          </label>
          <textarea
            id="job-desc"
            rows="5"
            className="w-full rounded-xl border border-slate-300 p-4 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 outline-none transition"
            placeholder="Paste the job description here. Our strict AI ATS Analyzer will check if your resume matches all required skills, experience, projects, and keywords."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <button
          onClick={handleUpload}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={loading}
        >
          {loading
            ? "Reading resume and analysing..."
            : "Analyse resume"}
        </button>
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
          What happens next
        </p>
        <div className="mt-5 space-y-4">
          {[
            "Your original PDF is uploaded and stored in Cloudinary.",
            "The backend extracts readable text from the PDF.",
            "ATS score is calculated from content, sections, keywords, and impact.",
            "An enhanced resume preview is generated with download support.",
          ].map((item, index) => (
            <div
              key={item}
              className="flex gap-3"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-slate-600">
                {item}
              </p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default ResumeUpload;
