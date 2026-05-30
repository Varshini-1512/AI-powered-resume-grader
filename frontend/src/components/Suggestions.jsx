function Suggestions({ suggestions }) {
  const items = suggestions?.length
    ? suggestions
    : [
        "Upload a text-based resume to receive AI suggestions.",
      ];

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            AI recommendations
          </p>
          <h2 className="text-2xl font-bold text-slate-950">
            Suggested improvements
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
          {items.length} items
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-slate-700">
                {item}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Suggestions;
