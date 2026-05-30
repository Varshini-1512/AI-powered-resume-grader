function ATSScoreCard({ score = 0 }) {
  const normalizedScore = Math.max(
    0,
    Math.min(Number(score) || 0, 100)
  );

  const status =
    normalizedScore >= 85
      ? "Excellent ATS match"
      : normalizedScore >= 70
        ? "Strong resume"
        : normalizedScore >= 55
          ? "Needs refinement"
          : "Needs attention";

  const tone =
    normalizedScore >= 85
      ? "from-emerald-500 to-teal-500"
      : normalizedScore >= 70
        ? "from-blue-500 to-cyan-500"
        : normalizedScore >= 55
          ? "from-amber-500 to-orange-500"
          : "from-rose-500 to-red-500";

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div
          className="relative size-36 rounded-full grid place-items-center shrink-0"
          style={{
            background: `conic-gradient(#0f172a ${normalizedScore * 3.6}deg, #e2e8f0 0deg)`,
          }}
        >
          <div className="size-28 rounded-full bg-white grid place-items-center shadow-inner">
            <div className="text-center">
              <p className="text-4xl font-black text-slate-950 leading-none">
                {normalizedScore}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                ATS
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h2 className="text-2xl font-bold text-slate-950">
              Resume score
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${tone}`}>
              {status}
            </span>
          </div>

          <p className="text-slate-600 max-w-2xl">
            This score estimates keyword coverage, structure, and parser-friendly content for applicant tracking systems.
          </p>

          <div className="mt-5 grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                Keywords
              </p>
              <p className="text-lg font-bold text-slate-950">
                {normalizedScore >= 70 ? "Good" : "Improve"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                Formatting
              </p>
              <p className="text-lg font-bold text-slate-950">
                ATS ready
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                Target
              </p>
              <p className="text-lg font-bold text-slate-950">
                {100 - normalizedScore} pts left
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ATSScoreCard;
