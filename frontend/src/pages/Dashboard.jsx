import {
  useEffect,
  useState,
} from "react";

import API from "../api/axios";

import Header from "../components/Header";

import Footer from "../components/Footer";

import ResumeHistory from "../components/ResumeHistory";

function Dashboard() {
  const [resumes, setResumes] =
    useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchResumes = async () => {
      try {
        const res = await API.get(
          "/resume/my-resumes"
        );

        if (isMounted) {
          setResumes(res.data);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchResumes();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                Resume history
              </p>
              <h1 className="mt-2 text-4xl font-black text-slate-950">
                Dashboard
              </h1>
              <p className="mt-2 text-slate-600">
                Open any analysed resume to view the original PDF, enhanced version, and AI feedback.
              </p>
            </div>

            <a
              href="/upload"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Upload resume
            </a>
          </div>

          <ResumeHistory
            resumes={resumes}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
