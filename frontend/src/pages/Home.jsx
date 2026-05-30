import { Link } from "react-router-dom";

import Header from "../components/Header";

import Footer from "../components/Footer";

function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        <section
          id="top"
          className="px-4 py-16 sm:px-8 lg:py-20"
        >
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-sky-600">
                AI-powered resume intelligence
              </p>
              <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight text-slate-950 lg:text-6xl">
                Build a resume that reads well to humans and ATS systems.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                ATS Checker AI extracts your PDF content, checks missing resume sections, scores ATS readiness, and creates an enhanced version you can download.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/upload"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-sky-700"
                >
                  Analyse resume
                </Link>

                <Link
                  to="/register"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 transition hover:border-slate-400"
                >
                  Create account
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="rounded-2xl bg-slate-100 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-black text-slate-950">
                    Resume report
                  </p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                    Live
                  </span>
                </div>

                <div className="mt-6 grid gap-4">
                  {[
                    ["Name", "Detected"],
                    ["Email", "Detected"],
                    ["Experience", "Needs work"],
                    ["Hard skills", "Detected"],
                    ["Portfolio", "Missing"],
                  ].map(([label, status]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-xl bg-white p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xl font-black ${
                          status === "Missing" || status === "Needs work"
                            ? "text-rose-500"
                            : "text-emerald-600"
                        }`}>
                          {status === "Missing" || status === "Needs work" ? "X" : "OK"}
                        </span>
                        <p className="font-bold text-slate-950">
                          {label}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-500">
                        {status}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-white p-5">
                  <div className="flex items-center gap-5">
                    <div className="grid size-24 place-items-center rounded-full border-[10px] border-amber-500 border-l-amber-100 text-3xl font-light text-amber-700">
                      82
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-950">
                        ATS-ready score
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Clear sections, readable text, stronger keywords, and downloadable enhanced resume.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white px-4 py-14 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
            {[
              ["Read PDF content", "Extracts text from uploaded PDF resumes and stores the original Cloudinary file."],
              ["Find missing sections", "Shows name, title, phone, email, portfolio, summary, experience, education, and skills."],
              ["Enhance and download", "Builds a cleaner resume preview with AI recommendations and a downloadable version."],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 p-6"
              >
                <h2 className="text-xl font-black text-slate-950">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
