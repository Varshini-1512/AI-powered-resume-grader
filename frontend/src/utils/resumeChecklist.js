export const normalizeText = (text = "") =>
  text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

export const getLines = (text = "") =>
  normalizeText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export const findSection = (lines, startWords, stopWords = []) => {
  const startIndex = lines.findIndex((line) =>
    line.length <= 45 &&
    startWords.some((word) =>
      line.toLowerCase().includes(word)
    )
  );

  if (startIndex === -1) {
    return "";
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

  return collected.join(" ");
};

export const buildChecklist = (text = "") => {
  const lines = getLines(text);
  const joined = lines.join(" ");
  const lower = joined.toLowerCase();
  const email =
    joined.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0] || "";
  const phone =
    joined.match(/(\+?\d[\d\s-]{8,}\d)/)?.[0]?.trim() || "";
  const summary = findSection(
    lines,
    ["summary", "profile", "objective"],
    ["skills", "experience", "projects", "education"]
  );
  const hardSkills = findSection(
    lines,
    ["technical skills", "hard skills", "skills"],
    ["soft skills", "projects", "experience", "education", "certifications"]
  );
  const softSkills =
    findSection(
      lines,
      ["soft skills"],
      ["technical skills", "hard skills", "projects", "experience", "education"]
    ) ||
    joined.match(/communication|teamwork|leadership|problem solving|collaboration|adaptability|time management|creativity/gi)
      ?.slice(0, 5)
      .join(", ") ||
    "";
  const education = findSection(
    lines,
    ["education"],
    ["certifications", "projects", "skills", "experience"]
  );
  const experience =
    findSection(
      lines,
      ["experience", "work history", "internship"],
      ["projects", "education", "skills", "certifications"]
    ) ||
    findSection(
      lines,
      ["projects"],
      ["education", "skills", "certifications", "achievements"]
    ) ||
    lines
      .filter((line) =>
        /project|built|developed|implemented|designed|optimized|created|delivered/i.test(line)
      )
      .slice(0, 4)
      .join(" ");
  const jobTitle =
    lines.find((line) =>
      /developer|engineer|designer|analyst|graduate|student|manager/i.test(line)
    ) || "";
  const portfolio =
    joined.match(/linkedin|github|portfolio|leetcode|https?:\/\//i)?.[0] || "";

  return [
    {
      label: "Name",
      value: lines[0] || "",
    },
    {
      label: "Job Title",
      value: jobTitle,
    },
    {
      label: "Phone Number",
      value: phone,
    },
    {
      label: "Email Address",
      value: email,
    },
    {
      label: "Portfolio or Website Link",
      value: portfolio,
    },
    {
      label: "Summary",
      value: summary || lines.find((line) => line.length > 80) || "",
    },
    {
      label: "Experience",
      value: experience,
    },
    {
      label: "Education",
      value: education,
    },
    {
      label: "Hard Skills",
      value: hardSkills || (lower.includes("skills") ? "Skills section detected" : ""),
    },
    {
      label: "Soft Skills",
      value: softSkills,
    },
  ];
};
