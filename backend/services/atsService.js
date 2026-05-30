import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_JOB_DESCRIPTION = `
Position: Software Engineer
Role Summary:
We are looking for a Software Engineer to design, build, and maintain robust, high-performance web applications. You will work on frontend interfaces, backend servers, database optimization, and API designs.

Required Tech Skills:
- React, JavaScript, TypeScript, Node.js, Express, HTML5, CSS3, Tailwind CSS
- Databases: MongoDB, MySQL, PostgreSQL, SQL, DBMS
- Core CS Fundamentals: Data Structures, Algorithms, Object-Oriented Programming (OOP)
- Tools: Git, GitHub, REST APIs, Testing, Debugging

Experience:
- 1-3 years of experience in software development or web application engineering.
- Direct experience through professional roles or active internships.

Education:
- Bachelor's degree (B.E./B.Tech/B.Sc/B.C.A) in Computer Science, Information Technology, or Software Engineering.
- Relevant certifications (AWS, Google Cloud, Oracle) are a plus.
`;

// Helper to check regex matches
const countMatches = (text, patterns) =>
  patterns.filter((pattern) => pattern.test(text)).length;

// Strict rule-based local fallback in case OpenAI fails
const calculateLocalFallbackScore = (text, jdText) => {
  const resume = text.toLowerCase();
  const jd = jdText.toLowerCase();

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // 1. Skills Match (30%)
  const skillsList = [
    { name: "react", regex: /\breact\b/ },
    { name: "javascript", regex: /\bjavascript|js\b/ },
    { name: "typescript", regex: /\btypescript|ts\b/ },
    { name: "node.js", regex: /\bnode(\.js)?\b/ },
    { name: "express", regex: /\bexpress\b/ },
    { name: "mongodb", regex: /\bmongodb\b/ },
    { name: "sql", regex: /\bsql|mysql|postgres\b/ },
    { name: "html", regex: /\bhtml\b/ },
    { name: "css", regex: /\bcss|tailwind\b/ },
    { name: "git", regex: /\bgit|github\b/ },
  ];

  let skillsMatchedCount = 0;
  let jdSkillsCount = 0;
  const missing_skills = [];

  skillsList.forEach((skill) => {
    const isJdRequired = skill.regex.test(jd);
    if (isJdRequired) {
      jdSkillsCount += 1;
      if (skill.regex.test(resume)) {
        skillsMatchedCount += 1;
      } else {
        missing_skills.push(skill.name.toUpperCase());
      }
    }
  });

  const skills_match = jdSkillsCount > 0 
    ? Math.round((skillsMatchedCount / jdSkillsCount) * 100) 
    : 70;

  // 2. Experience Match (25%)
  let experience_match = 40; // baseline
  const hasInternship = /\bintern|placement\b/.test(resume);
  const hasJob = /\bexperience|work|history|job|engineer|developer|analyst\b/.test(resume);
  if (hasJob) experience_match += 30;
  if (hasInternship) experience_match += 20;
  if (/\b(1|2|3|4|5)\+?\s*years?\b/.test(resume)) experience_match += 10;
  experience_match = Math.min(experience_match, 95);

  // 3. Education Match (10%)
  let education_match = 50;
  const degrees = /\bb\.?e\.?|b\.?tech|b\.?s|b\.?c\.?a|m\.?c\.?a|m\.?tech|degree|bachelor|master\b/.test(resume);
  const isComputerScience = /\bcomputer\s*science|information\s*technology|software\s*engineering\b/.test(resume);
  if (degrees) education_match += 30;
  if (isComputerScience) education_match += 20;
  education_match = Math.min(education_match, 95);

  // 4. Projects & Achievements (15%)
  let projects_match = 50;
  const hasProjects = /\bprojects?\b/.test(resume);
  const hasMetrics = /\b\d+%\b|\b\d+\+\b|\b(users|clients|performance|scale|reduced|optimized)\b/.test(resume);
  if (hasProjects) projects_match += 25;
  if (hasMetrics) projects_match += 20;
  projects_match = Math.min(projects_match, 90);

  // 5. Keyword Optimization (10%)
  const keywords = [
    { word: "rest api", regex: /\brest\s*api|apis\b/ },
    { word: "deployment", regex: /\bdeployment|deploy|cloud|aws|docker|kubernetes\b/ },
    { word: "testing", regex: /\btesting|jest|mocha|cypress\b/ },
    { word: "debugging", regex: /\bdebugging|debug\b/ },
    { word: "data structures", regex: /\bdata\s*structures|algorithms|dsa\b/ },
  ];
  let keywordMatchedCount = 0;
  const missing_keywords = [];
  keywords.forEach((keyword) => {
    if (keyword.regex.test(resume)) {
      keywordMatchedCount += 1;
    } else {
      missing_keywords.push(keyword.word);
    }
  });
  const keyword_optimization = Math.round((keywordMatchedCount / keywords.length) * 100);

  // 6. Resume Quality & Formatting (10%)
  let resume_quality = 50;
  const sections = [/summary|profile|objective/, /skills/, /experience|work history/, /education/, /projects/];
  const sectionCount = countMatches(resume, sections);
  resume_quality += sectionCount * 8;
  if (wordCount >= 250 && wordCount <= 900) {
    resume_quality += 10;
  }
  resume_quality = Math.min(resume_quality, 95);

  // Calculate Weighted ATS Score
  const ats_score = Math.round(
    skills_match * 0.30 +
    experience_match * 0.25 +
    education_match * 0.10 +
    projects_match * 0.15 +
    keyword_optimization * 0.10 +
    resume_quality * 0.10
  );

  const strengths = [];
  const weaknesses = [];
  const improvement_suggestions = [];

  if (skills_match >= 75) strengths.push("Strong technical skills matching key job requirements.");
  else weaknesses.push("Missing core technical skills listed in the job description.");

  if (experience_match >= 70) strengths.push("Relevant professional or internship experience detected.");
  else weaknesses.push("Limited professional work experience in relevant roles.");

  if (education_match >= 80) strengths.push("Excellent academic background in Computer Science/IT.");
  else weaknesses.push("Academic background or degrees could be more explicitly detailed.");

  if (hasMetrics) strengths.push("Excellent use of quantifiable metrics to show impact.");
  else {
    weaknesses.push("Lacks measurable achievements or performance metrics.");
    improvement_suggestions.push("Add quantitative metrics (e.g., performance boosts, user size, or percentages) to your projects.");
  }

  missing_skills.forEach((skill) => {
    improvement_suggestions.push(`Consider adding ${skill} skills if you have hands-on experience.`);
  });

  if (missing_keywords.length > 0) {
    improvement_suggestions.push(`Optimize keyword density for: ${missing_keywords.slice(0, 3).join(", ")}.`);
  }

  if (wordCount < 250) {
    improvement_suggestions.push("Expand your resume sections to cover more detail (ideal size is 250 - 900 words).");
  }

  return {
    ats_score: Math.max(0, Math.min(ats_score, 99)), // Guarantee max 99 for fallbacks as 100 requires absolute perfection
    summary: `Your resume shows a solid foundation but has major matching gaps against this specific role. Focus on aligning technical keywords and adding measurable outcomes.`,
    missing_skills,
    missing_keywords,
    strengths: strengths.length ? strengths : ["Clear layout structure."],
    weaknesses: weaknesses.length ? weaknesses : ["Formatting or keywords could be better aligned."],
    improvement_suggestions: improvement_suggestions.length ? improvement_suggestions : ["Refine skills list and add job-specific keywords."],
    section_scores: {
      skills_match,
      experience_match,
      education_match,
      projects_match,
      keyword_optimization,
      resume_quality,
    },
  };
};

export const calculateATSScore = async (resumeText = "", jobDescription = "") => {
  const jdToUse = jobDescription.trim() || DEFAULT_JOB_DESCRIPTION;
  const cleanedResumeText = resumeText.trim();

  if (!cleanedResumeText || cleanedResumeText.includes("No selectable text was found")) {
    return {
      ats_score: 0,
      summary: "No selectable text was parsed. Please upload a readable text-based PDF.",
      missing_skills: [],
      missing_keywords: [],
      strengths: [],
      weaknesses: ["Scanned or unreadable document structure"],
      improvement_suggestions: ["Upload a digital PDF instead of a scanned image."],
      section_scores: {
        skills_match: 0,
        experience_match: 0,
        education_match: 0,
        projects_match: 0,
        keyword_optimization: 0,
        resume_quality: 0,
      },
    };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.startsWith("sk-proj-placeholder") || apiKey.length < 20) {
      console.log("No valid OpenAI API key found; falling back to strict local scoring engine.");
      return calculateLocalFallbackScore(cleanedResumeText, jdToUse);
    }

    const openai = new OpenAI({ apiKey });
    console.log("Requesting advanced ATS analysis from GPT-4o-mini...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an advanced Applicant Tracking System (ATS) Resume Analyzer.
Your task is to analyze the provided resume text against the provided job description and generate a strict, realistic ATS score and detailed feedback.

IMPORTANT SCORING RULES:
- Never give 100 unless ALL required details are perfectly matched.
- If important sections are missing, reduce the score accordingly.
- The ATS score must depend entirely on the actual content present in the resume.
- Do NOT assume skills, experience, or projects if they are not explicitly written.
- Missing keywords, certifications, projects, experience, education details, or achievements must reduce the score.
- The score should reflect real ATS behavior used by recruiters.

SCORING CRITERIA (Weighted):
1. Skills Match (30% weight): Compare technical and soft skills with the job description. Missing required skills should significantly reduce the score.
2. Experience Match (25% weight): Check years of experience, relevant roles, internships, and responsibilities. Penalize missing or unrelated experience.
3. Education Match (10% weight): Verify degree, specialization, certifications, and academic relevance.
4. Projects & Achievements (15% weight): Evaluate relevant projects, measurable impact, and achievements. Reduce score if projects are missing or weak.
5. Keyword Optimization (10% weight): Check ATS keywords from the job description. Missing important keywords lowers the score.
6. Resume Quality & Formatting (10% weight): Check structure, readability, sections, grammar, and ATS-friendly formatting.

STRICT SCORE GUIDELINES:
- 90-99 = Excellent match with only minor improvements needed.
- 80-89 = Strong match but missing some important details.
- 70-79 = Good but several gaps exist.
- 50-69 = Moderate match with major missing requirements.
- Below 50 = Poor match.

ABSOLUTE RULE:
- Give 100 ONLY if:
  - All required skills are present,
  - Experience fully matches,
  - Education matches,
  - Relevant projects are included,
  - ATS keywords are optimized,
  - Resume formatting is professional,
  - No important requirement is missing.

If the resume lacks measurable achievements, missing technologies, missing certifications, missing experience, or incomplete sections, reduce the ATS score appropriately instead of giving a high score. Never inflate scores.

You must return the response in strict JSON format with no additional conversational text. Any markdown formatting or text surrounding the JSON will fail parsing.`,
        },
        {
          role: "user",
          content: `Analyze this resume and job description.

JOB DESCRIPTION:
${jdToUse}

RESUME CONTENT:
${cleanedResumeText}

Format your response exactly as:
{
  "ats_score": number,
  "summary": "Short overall evaluation",
  "missing_skills": ["skill1", "skill2"],
  "missing_keywords": ["keyword1", "keyword2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvement_suggestions": ["suggestion1", "suggestion2"],
  "section_scores": {
    "skills_match": number,
    "experience_match": number,
    "education_match": number,
    "projects_match": number,
    "keyword_optimization": number,
    "resume_quality": number
  }
}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const resultText = response.choices[0].message.content;
    const parsedData = JSON.parse(resultText);

    // Validate structure and ranges
    if (typeof parsedData.ats_score === "number" && parsedData.section_scores) {
      return parsedData;
    } else {
      throw new Error("Invalid structure from OpenAI API");
    }
  } catch (error) {
    console.error("OpenAI ATS Error, falling back to local calculation:", error.message);
    return calculateLocalFallbackScore(cleanedResumeText, jdToUse);
  }
};
