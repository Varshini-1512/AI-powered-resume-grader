
import Header from "../components/Header";

import Footer from "../components/Footer";

import ResumeUpload from "../components/ResumeUpload";

function UploadResume() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            AI resume analyser
          </p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">
            Upload resume
          </h1>
          <p className="mb-8 mt-3 max-w-2xl text-slate-600">
            Upload your PDF and get an ATS score, original preview, enhanced resume, and downloadable improved file.
          </p>

          <ResumeUpload />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default UploadResume;
