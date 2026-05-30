import { Link } from "react-router-dom";

import { buildChecklist } from "../utils/resumeChecklist";

const getScoreTone = (score = 0) => {
  if (score >= 85) {
    return {
      bar: "bg-emerald-500",
      text: "text-emerald-700",
      badge: "bg-emerald-50",
    };
  }

  if (score >= 70) {
    return {
      bar: "bg-sky-500",
      text: "text-sky-700",
      badge: "bg-sky-50",
    };
  }

  if (score >= 50) {
    return {
      bar: "bg-amber-500",
      text: "text-amber-700",
      badge: "bg-amber-50",
    };
  }

  return {
    bar: "bg-rose-500",
    text: "text-rose-700",
    badge: "bg-rose-50",
  };
};

function ResumeHistory({ resumes }) {
  if (!resumes?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h2 className="text-xl font-bold text-slate-950">
          No resumes analysed yet
        </h2>
        <p className="mt-2 text-slate-600">
          Upload a PDF resume to see your ATS score, original file, and enhanced version here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {resumes?.map((resume) => {
        const scoreTone = getScoreTone(resume.atsScore || 0);

        return (
          <div
            key={resume._id}
            className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_220px_120px] lg:items-center"
          >
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-slate-950">
                {resume.fileName || resume.targetRole || "Uploaded resume"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {resume.createdAt
                  ? new Date(resume.createdAt).toLocaleString()
                  : "Recently uploaded"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {buildChecklist(resume.extractedText || "").map((item) => (
                  <span
                    key={item.label}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.value
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {item.value ? "OK" : "Missing"} {item.label}
                  </span>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl p-4 ${scoreTone.badge}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                ATS score
              </p>
              <div className="mt-2 h-2 rounded-full bg-white">
                <div
                  className={`h-2 rounded-full ${scoreTone.bar}`}
                  style={{
                    width: `${Math.max(0, Math.min(resume.atsScore || 0, 100))}%`,
                  }}
                />
              </div>
              <p className={`mt-2 text-lg font-black ${scoreTone.text}`}>
                {resume.atsScore || 0}/100
              </p>
            </div>

            <Link
              to={`/resume/${resume._id}`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              View
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default ResumeHistory;
