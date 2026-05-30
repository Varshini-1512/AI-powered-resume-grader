import { Link, useParams } from "react-router-dom";

import Header from "../components/Header";

import Footer from "../components/Footer";

const guideSections = [
  {
    title: "Step 1: Prepare your essential information",
    body: [
      "Before you dive into creating your resume, collect your essential career details. This step makes resume writing smoother and ensures you will not miss information.",
      "Include work experience, achievements, skills, education, certifications and awards, volunteer work, and extracurriculars.",
      "Pro Tip: Using ChatGPT to write your resume can save time, but it is important to put in the work to make it right.",
    ],
  },
  {
    title: "Step 2: Pick the right resume format",
    body: [
      "Formatting your resume the right way is key to highlighting your best qualities.",
      "Chronological format is best for experienced candidates because it places your work history near the top.",
      "Functional format is best for recent graduates and career changers because it highlights skills over work experience.",
      "Combination format is best for mid-level workers because it shows skills and work experience equally.",
    ],
  },
  {
    title: "Step 3: Create your resume header",
    body: [
      "A strong resume header is straightforward. Include your full name, job title, phone number, professional email, city, state, ZIP code, and a networking profile or digital portfolio if applicable.",
    ],
  },
  {
    title: "Step 4: Write your professional summary",
    body: [
      "Recruiters spend only a few seconds scanning a resume, so the top section is prime real estate. A strong resume summary grabs attention fast and gives you a competitive edge.",
      "Write three to four sentences highlighting your best skills and what you have done well.",
      "Example: Results-driven sales manager with over eight years of experience leading high-performing teams and surpassing revenue targets. Increased regional sales by 35% in two years and implemented a customer retention strategy that boosted repeat business by 20%. Eager to bring strategic leadership and growth-focused insights to the Apex Sales team.",
      "If you are a recent graduate or changing careers, use a resume objective instead. Focus on your skills, goals, and what you can bring to the company.",
      "Example: Motivated recent marketing graduate with a strong foundation in digital campaigns and content strategy. Increased social media engagement by 40% during an internship with BrandX. Excited to apply creativity and analytical skills to drive brand growth at Horizon Media.",
      "Why this matters: Many resumes skip this section, so adding one helps you stand out quickly.",
    ],
  },
  {
    title: "Step 5: Add your work experience",
    body: [
      "Your work history should show how your experience matches the target job. Add relevant past roles with your job title, company names, and employment dates.",
      "Write your job duties in bullet points. When possible, include achievements with numbers and percentages to show your impact.",
      "Example: Sales Manager, Vision Corporation, Chicago, IL, March 2016 to April 2025.",
      "Led and developed high-performing sales teams, consistently exceeding revenue goals and performance metrics.",
      "Increased regional sales by 35% over two years through strategic planning and targeted initiatives.",
      "Designed and implemented a customer retention strategy that boosted repeat business by 20%.",
      "Resume action words: Cultivated, Delegated, Directed, Enabled, Executed, Achieved, Managed, Negotiated, Operated, Partnered, Performed, Mediated, Moderated, Promoted, Boosted, Completed, Created, Integrated, Lifted, Merged.",
    ],
  },
  {
    title: "Step 6: Present your educational background",
    body: [
      "Your education section helps employers trust your background. Start by listing your most recent degree and go backward from there.",
      "Include the school name, location, and graduation date.",
      "Example: BA in Information Technology, University of California, Los Angeles, CA, May 2025. Minored in Cybersecurity.",
      "Key accomplishments can include academic projects, relevant coursework, honors, completed credits, extracurricular activities, and memberships.",
    ],
  },
  {
    title: "Step 7: List relevant skills",
    body: [
      "Creating an impressive skills section is a must. Read the job post carefully and identify keywords you can include.",
      "List six to eight soft and hard skills that show you are a well-rounded candidate.",
      "Your resume is not a biography. It is a marketing tool. Prioritize experience and skills that align with the job you are applying for.",
      "Pro Tip: If you are changing careers, include transferable skills to show adaptability.",
    ],
  },
  {
    title: "Step 8: Boost your resume with bonus sections",
    body: [
      "A standard resume covers work experience, education, and skills. Bonus sections can help your resume stand out.",
      "Consider awards, certifications, memberships, language skills, publications, and volunteer work.",
      "Pro Tip: Most experts recommend leaving references off your resume. Hiring managers will request them later if needed.",
    ],
  },
  {
    title: "Step 9: Proofread and send your resume",
    body: [
      "Before sending your resume, review formatting, check completeness, scan for errors, get a second opinion, and personalize your email.",
      "Final checklist: formatting is clear, all essential sections are included, grammar is polished, and the resume is targeted to the job.",
    ],
  },
];

const templates = [
  {
    name: "Modern ATS Template",
    bestFor: "Software, data, and product roles",
    sections: "Summary, Skills, Projects, Experience, Education",
  },
  {
    name: "Graduate Resume Template",
    bestFor: "Freshers and students",
    sections: "Objective, Education, Skills, Projects, Certifications",
  },
  {
    name: "Professional Experience Template",
    bestFor: "Mid-level and senior candidates",
    sections: "Summary, Experience, Achievements, Skills, Education",
  },
  {
    name: "Career Change Template",
    bestFor: "Switching industries",
    sections: "Objective, Transferable Skills, Projects, Experience, Education",
  },
];

function ResumeGuide() {
  return (
    <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <Link
        to="/"
        className="mb-6 inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:border-slate-400"
      >
        Back
      </Link>
      <p className="text-sm font-black uppercase tracking-wide text-sky-600">
        Resume writing guide
      </p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">
        How to Create a Resume: Step-By-Step Guide
      </h1>
      <p className="mt-5 text-lg leading-8 text-slate-600">
        Writing an effective resume is simple, you just need the right tools to do it. We have mapped it out for you in nine easy steps.
      </p>

      <div className="mt-8 space-y-6">
        {guideSections.map((section) => (
          <article
            key={section.title}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >
            <h2 className="text-2xl font-black text-slate-950">
              {section.title}
            </h2>
            <div className="mt-4 space-y-3">
              {section.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm leading-7 text-slate-700"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResumeTemplates() {
  return (
    <section className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <Link
        to="/"
        className="mb-6 inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:border-slate-400"
      >
        Back
      </Link>
      <p className="text-sm font-black uppercase tracking-wide text-sky-600">
        Resume templates
      </p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">
        ATS-Friendly Resume Templates
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
        Use these template structures to organize your resume clearly before uploading it to ATS Checker AI.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {templates.map((template) => (
          <article
            key={template.name}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
          >
            <h2 className="text-2xl font-black text-slate-950">
              {template.name}
            </h2>
            <p className="mt-3 text-sm font-bold text-sky-700">
              Best for: {template.bestFor}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Recommended sections: {template.sections}
            </p>
            <Link
              to="/upload"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white hover:bg-sky-700"
            >
              Use this template
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function InfoPage() {
  const { slug } = useParams();
  const isGuide = slug === "how-to-write-a-resume";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 px-4 py-14 sm:px-8">
        {isGuide ? <ResumeGuide /> : <ResumeTemplates />}
      </main>

      <Footer />
    </div>
  );
}

export default InfoPage;
