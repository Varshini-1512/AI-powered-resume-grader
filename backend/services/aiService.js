import OpenAI from "openai";

const fallbackSuggestions = [
  "Add measurable achievements to your project and experience bullets.",
  "Rewrite the summary with your target role, strongest skills, and career focus.",
  "Add more job-specific technical keywords from the role description.",
  "Show project impact with numbers, users, performance gains, or business value.",
  "Keep formatting simple with clear headings so ATS systems can parse it.",
];

const getLines = (resumeText = "") =>
  resumeText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const findSection = (lines, startWords, stopWords = []) => {
  const startIndex = lines.findIndex((line) =>
    line.length <= 45 &&
    startWords.some((word) =>
      line.toLowerCase().includes(word)
    )
  );

  if (startIndex === -1) {
    return [];
  }

  const collected = [];

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const lower = lines[index].toLowerCase();

    if (
      lines[index].length <= 45 &&
      stopWords.some((word) =>
        lower.includes(word)
      )
    ) {
      break;
    }

    collected.push(lines[index]);
  }

  return collected;
};

const buildSummary = (lines) => {
  const existingSummary = findSection(
    lines,
    ["summary", "profile", "objective"],
    ["skills", "experience", "projects", "education", "certifications"]
  ).join(" ");

  if (existingSummary) {
    return existingSummary
      .replace(/^enthusiastic/i, "Results-driven")
      .replace(/seeking an opportunity to/i, "focused on")
      .replace(/focused on contribute/i, "focused on contributing")
      .replace(/\s+/g, " ")
      .trim();
  }

  const skills = findSection(
    lines,
    ["skills"],
    ["projects", "experience", "education", "certifications"]
  )
    .join(", ")
    .slice(0, 180);

  return skills
    ? `Results-driven candidate with hands-on experience across ${skills}, focused on building reliable, user-focused software solutions.`
    : "Results-driven candidate with strong technical fundamentals, practical project experience, and a focus on building reliable software solutions.";
};

const enhanceLine = (line) => {
  const cleaned = line.replace(/^[-*•]\s*/, "").trim();

  if (!cleaned) {
    return "";
  }

  if (/^(built|developed|created|implemented|designed|optimized|collaborated|managed|led)/i.test(cleaned)) {
    return `- ${cleaned}`;
  }

  if (/using|with|for|by/i.test(cleaned)) {
    return `- Delivered ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
  }

  return `- Strengthened ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
};

const compactSection = (items, fallback) =>
  items.length
    ? items
    : fallback;

export const buildEnhancedResumeText = (
  resumeText,
  suggestions = fallbackSuggestions
) => {
  const lines = getLines(resumeText || "");

  if (
    !lines.length ||
    resumeText.includes("No selectable text was found")
  ) {
    return [
      "Enhanced resume preview",
      "",
      "Upload a text-based PDF so the analyser can rewrite your resume content.",
    ].join("\n");
  }

  const name = lines[0];
  const contact = lines[1] || "";
  const summary = buildSummary(lines);
  const skills = compactSection(
    findSection(lines, ["skills"], ["projects", "experience", "education", "certifications"]),
    ["JavaScript, React, Node.js, MongoDB, Git, REST APIs"]
  );
  const projects = compactSection(
    findSection(lines, ["projects"], ["education", "certifications", "skills"]),
    lines
      .filter((line) => /built|developed|created|implemented|designed|optimized|project/i.test(line))
      .slice(0, 8)
  );
  const education = compactSection(
    findSection(lines, ["education"], ["certifications", "projects", "skills", "experience"]),
    ["Education details available in the uploaded resume."]
  );
  const certifications = findSection(
    lines,
    ["certifications", "certificates", "achievements"],
    ["projects", "education", "skills"]
  );
  return [
    name,
    contact,
    "",
    "PROFESSIONAL SUMMARY",
    summary,
    "",
    "CORE SKILLS",
    ...skills.map((line) => `- ${line.replace(/^[-*•]\s*/, "")}`),
    "",
    "PROJECTS AND ACHIEVEMENTS",
    ...projects.slice(0, 10).map(enhanceLine).filter(Boolean),
    "",
    "EDUCATION",
    ...education.map((line) => `- ${line.replace(/^[-*•]\s*/, "")}`),
    ...(certifications.length
      ? [
          "",
          "CERTIFICATIONS",
          ...certifications.map((line) => `- ${line.replace(/^[-*•]\s*/, "")}`),
        ]
      : []),
  ].join("\n");
};

export const generateSuggestions =
  async (resumeText) => {
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const response =
        await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a professional resume reviewer. Provide specific, actionable suggestions to improve the resume.",
            },
            {
              role: "user",
              content: `Review this resume and provide 5 specific improvement suggestions:\n\n${resumeText}`,
            },
          ],
          max_tokens: 500,
        });

      const suggestionsText = response.choices[0].message.content;

      return suggestionsText
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((line) => line.replace(/^\d+\.\s*/, "").trim());
    } catch (error) {
      console.error("OpenAI API Error:", error);
      return fallbackSuggestions;
    }
  };
