import { Link } from "react-router-dom";

const improveLinks = [
  "Score my resume",
  "Targeted resume",
];

const rateLinks = [
  "ATS resume test",
  "ATS resume guide",
  "Rate my resume",
  "Resume optimizer",
  "Resume grammar checker",
];

const resourceLinks = [
  {
    label: "How to write a resume",
    to: "/info/how-to-write-a-resume",
  },
  {
    label: "Resume Templates",
    to: "/info/resume-templates",
  },
  {
    label: "Resume Examples",
    to: "/info/resume-templates",
  },
  {
    label: "Featured Resumes",
    to: "/info/resume-templates",
  },
];

function Footer() {
  const scrollHomeTop = () => {
    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 0);
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="mb-10 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-xs font-black text-slate-950">
            ATS
          </span>
          <div>
            <h2 className="text-lg font-black">
              ATS Checker AI
            </h2>
            <p className="text-sm text-slate-400">
              Analyse, improve, and download stronger resumes.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-white">
              Improve your resume
            </h3>
            <div className="mt-4 grid gap-2">
              {improveLinks.map((label) => (
                <Link
                  key={label}
                  to="/"
                  onClick={scrollHomeTop}
                  className="text-sm text-slate-300 transition hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-white">
              Rate your resume
            </h3>
            <div className="mt-4 grid gap-2">
              {rateLinks.map((label) => (
                <Link
                  key={label}
                  to="/upload"
                  className="text-sm text-slate-300 transition hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-white">
              Resources
            </h3>
            <div className="mt-4 grid gap-2">
              {resourceLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-sm text-slate-300 transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-4 text-center text-sm text-slate-400">
        2026 ATS Checker AI. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
