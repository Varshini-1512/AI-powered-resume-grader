import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import html2canvas from "html2canvas";

import { jsPDF } from "jspdf";

import API from "../api/axios";

import Header from "../components/Header";

import Footer from "../components/Footer";

import {
  buildChecklist,
  findSection,
  getLines,
} from "../utils/resumeChecklist";

const normalizePdfText = (value = "") =>
  String(value)
    .replace(/[•●▪]/g, "-")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");

const isResumeArtifactLine = (line = "") =>
  /^-?\s*-?\s*\d+\s+of\s+\d+\s*-?\s*-?$/i.test(
    normalizePdfText(line).trim()
  );

const getEmail = (text = "") =>
  text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0] || "";

const getPhone = (text = "") =>
  text.match(/(\+?\d[\d\s-]{8,}\d)/)?.[0]?.trim() || "";

const getDomainUrl = (text = "", domains = []) => {
  const urls = text.match(/https?:\/\/[^\s|,]+/gi) || [];

  return (
    urls.find((url) =>
      domains.some((domain) => url.toLowerCase().includes(domain))
    ) || ""
  );
};

const makeContactItems = (lines = [], name = "") => {
  const joined = lines.join(" ");
  const email = getEmail(joined);
  const phone = getPhone(joined);
  const emailUser = email.split("@")[0] || name.toLowerCase().replace(/\s+/g, "");
  const items = [];

  if (email) {
    items.push({
      label: email,
      href: `mailto:${email}`,
    });
  }

  if (/linkedin/i.test(joined)) {
    items.push({
      label: "LinkedIn",
      href:
        getDomainUrl(joined, ["linkedin.com"]) ||
        `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name || emailUser)}`,
    });
  }

  if (/leetcode/i.test(joined)) {
    items.push({
      label: "LeetCode",
      href:
        getDomainUrl(joined, ["leetcode.com"]) ||
        `https://leetcode.com/search/${encodeURIComponent(emailUser)}`,
    });
  }

  if (/github/i.test(joined)) {
    items.push({
      label: "GitHub",
      href:
        getDomainUrl(joined, ["github.com"]) ||
        `https://github.com/search?q=${encodeURIComponent(emailUser)}&type=users`,
    });
  }

  if (phone) {
    items.push({
      label: phone,
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
    });
  }

  return items;
};

const inferFileType = (resume = {}) => {
  const fileName = (
    resume.fileName ||
    resume.originalFileName ||
    ""
  ).toLowerCase();
  const mimeType = (
    resume.fileMimeType ||
    ""
  ).toLowerCase();

  if (
    resume.fileType === "pdf" ||
    mimeType.includes("pdf") ||
    fileName.endsWith(".pdf")
  ) {
    return "pdf";
  }

  if (
    resume.fileType === "image" ||
    mimeType.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif)$/i.test(fileName)
  ) {
    return "image";
  }

  if (
    resume.fileType === "document" ||
    /\.(doc|docx)$/i.test(fileName)
  ) {
    return "document";
  }

  return "unsupported";
};

const withPdfViewerOptions = (url = "") => {
  if (!url) {
    return "";
  }

  const [baseUrl, hash = ""] = url.split("#");
  const params = new URLSearchParams(hash);

  params.set("toolbar", "0");
  params.set("navpanes", "0");
  params.set("scrollbar", "0");
  params.set("view", "FitH");

  return `${baseUrl}#${params.toString()}`;
};

const getScoreTone = (score = 0) => {
  if (score >= 85) {
    return {
      ring: "border-emerald-500 border-l-emerald-100 text-emerald-700",
      stroke: "#10b981",
      trail: "#e2e8f0",
      textClass: "text-emerald-700",
      bgClass: "bg-emerald-50",
    };
  }

  if (score >= 70) {
    return {
      ring: "border-sky-500 border-l-sky-100 text-sky-700",
      stroke: "#0ea5e9",
      trail: "#e2e8f0",
      textClass: "text-sky-700",
      bgClass: "bg-sky-50",
    };
  }

  if (score >= 50) {
    return {
      ring: "border-amber-500 border-l-amber-100 text-amber-700",
      stroke: "#f59e0b",
      trail: "#e2e8f0",
      textClass: "text-amber-700",
      bgClass: "bg-amber-50",
    };
  }

  return {
    ring: "border-rose-500 border-l-rose-100 text-rose-700",
    stroke: "#f43f5e",
    trail: "#e2e8f0",
    textClass: "text-rose-700",
    bgClass: "bg-rose-50",
  };
};

const buildCategoryStats = (checklist, suggestions = []) => {
  const missingItems = checklist.filter((item) => !item.value);
  const contentSuggestions = [
    ...missingItems
      .filter((item) =>
        ["Name", "Phone Number", "Email Address", "Portfolio or Website Link"].includes(item.label)
      )
      .map((item) => `Add or clarify your ${item.label.toLowerCase()}.`),
    ...suggestions.slice(0, 2),
  ];
  const skillSuggestions = [
    ...missingItems
      .filter((item) =>
        ["Hard Skills", "Soft Skills"].includes(item.label)
      )
      .map((item) => `Add a dedicated ${item.label.toLowerCase()} section.`),
    ...(missingItems.some((item) =>
      ["Hard Skills", "Soft Skills"].includes(item.label)
    )
      ? ["Match your skills to the role keywords and keep them easy for ATS systems to parse."]
      : []),
  ];
  const sectionSuggestions = [
    ...missingItems
      .filter((item) =>
        ["Summary", "Experience", "Education"].includes(item.label)
      )
      .map((item) => `Add a stronger ${item.label.toLowerCase()} section.`),
    ...(missingItems.some((item) =>
      ["Summary", "Experience", "Education"].includes(item.label)
    )
      ? ["Make each major section visible with a direct heading."]
      : []),
  ];
  const styleSuggestions = suggestions
    .filter((item) =>
      /style|summary|bullet|impact|achievement|action|measurable|keyword/i.test(item)
    )
    .slice(0, 2);
  const skillMissing = checklist
    .filter((item) =>
      ["Hard Skills", "Soft Skills"].includes(item.label)
    )
    .filter((item) => !item.value).length;
  const sectionMissing = checklist
    .filter((item) =>
      ["Summary", "Experience", "Education"].includes(item.label)
    )
    .filter((item) => !item.value).length;

  return [
    {
      name: "Content",
      detail: `${contentSuggestions.length} suggestions`,
      color: "bg-blue-600",
      width: `${Math.max(28, 100 - contentSuggestions.length * 12)}%`,
      suggestions: contentSuggestions,
    },
    {
      name: "Skills",
      detail: `${skillSuggestions.length} suggestions`,
      color: "bg-slate-300",
      width: `${skillMissing ? 45 : 92}%`,
      suggestions: skillSuggestions,
    },
    {
      name: "Format",
      detail: "Complete",
      color: "bg-orange-500",
      width: "100%",
      suggestions: [],
    },
    {
      name: "Sections",
      detail: `${sectionSuggestions.length} suggestions`,
      color: "bg-rose-500",
      width: `${Math.max(35, 100 - sectionMissing * 20)}%`,
      suggestions: sectionSuggestions,
    },
    {
      name: "Style",
      detail: `${styleSuggestions.length} suggestions`,
      color: "bg-indigo-500",
      width: "82%",
      suggestions: styleSuggestions,
    },
  ];
};

const buildEnhancedResume = (
  text = "",
  originalText = ""
) => {
  const sourceText = originalText || text;
  const lines = getLines(sourceText);
  const name = lines[0] || "Enhanced resume";
  const contactLines = lines
    .slice(1, 5)
    .filter((line) =>
      /@|\+?\d[\d\s-]{8,}\d|linkedin|github|leetcode|portfolio|https?:\/\//i.test(line)
    );
  const contact = contactLines.join(" | ") || lines[1] || "Contact details";
  const contactItems = makeContactItems(lines.slice(0, 8), name);
  const summary = findSection(
    lines,
    ["technical summary", "professional summary", "summary", "profile", "objective"],
    ["core skills", "skills", "projects", "education", "certifications"]
  );

  return {
    name,
    initials: name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    contact,
    contactItems,
    summary:
      summary ||
      "Results-oriented candidate with practical project experience, strong technical fundamentals, and a focus on building reliable software solutions.",
    education: getSectionLines(lines, ["education"], ["certifications", "projects", "skills", "experience"]),
    skills: getSectionLines(lines, ["technical skills", "core skills", "skills"], ["projects", "experience", "education", "certifications"]),
    projects: getSectionLines(lines, ["projects", "project experience"], ["education", "certifications", "skills", "experience"]),
    certifications: getSectionLines(lines, ["certifications", "certificates", "certification"], ["skills", "projects", "education", "experience"]),
  };
};

const getAchievementLines = (enhancedResume) => {
  const achievements = enhancedResume.projects
    .filter((line) =>
      /^-/.test(line) ||
      /built|developed|created|implemented|designed|optimized|delivered|improved|collaborated/i.test(line)
    )
    .map((line) => line.replace(/^-\s*/, ""))
    .slice(0, 4);

  return achievements.length
    ? achievements
    : ["Resume content was reorganized into clearer ATS-friendly sections."];
};

const SECTION_HEADINGS = [
  "technical summary",
  "professional summary",
  "summary",
  "profile",
  "objective",
  "skills",
  "technical skills",
  "core skills",
  "projects",
  "project experience",
  "education",
  "certifications",
  "certificates",
  "experience",
  "work history",
  "internship",
  "achievements",
];

const isSectionHeading = (line = "", words = SECTION_HEADINGS) => {
  const normalized = line
    .toLowerCase()
    .replace(/[:-]/g, "")
    .trim();

  return (
    line.length <= 48 &&
    words.some((word) => normalized === word || normalized.includes(word))
  );
};

const getSectionLines = (lines, startWords, stopWords = []) => {
  const startIndex = lines.findIndex((line) =>
    isSectionHeading(line, startWords)
  );

  if (startIndex === -1) {
    return [];
  }

  const collected = [];

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (isSectionHeading(line, stopWords)) {
      break;
    }

    collected.push(line);
  }

  return collected.filter((line) => line && !isResumeArtifactLine(line));
};

const renderResumeLines = (lines, fallback) => {
  const displayLines = (lines?.length ? lines : [fallback]).filter(
    (line) => !isResumeArtifactLine(line)
  );

  return displayLines.map((line, index) => {
    const cleanLine = line.replace(/^[•*-]\s*/, "");
    const looksLikeTitle =
      index === 0 ||
      (/^[\d]+[.)]\s/.test(line) && cleanLine.length < 90) ||
      (!/^[•*-]/.test(line) &&
        cleanLine.length < 85 &&
        /project|certificate|internship|degree|bachelor|intermediate|school|training|application|assistant|calculator/i.test(cleanLine));

    if (/^[•*-]/.test(line) || /^\d+[.)]\s/.test(line)) {
      return (
        <li key={`${line}-${index}`} className={looksLikeTitle ? "font-bold text-slate-950" : ""}>
          {cleanLine.replace(/^\d+[.)]\s*/, "")}
        </li>
      );
    }

    return (
      <p
        key={`${line}-${index}`}
        className={looksLikeTitle ? "font-bold text-slate-950" : ""}
      >
        {line}
      </p>
    );
  });
};

const buildDownloadPdf = async (
  resume,
  enhancedResume,
  checklist,
  achievementLines
) => {
  if (resume?.nodeType === 1) {
    const element = resume;
    const fileName = enhancedResume;
    const canvas = await Promise.race([
      html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        windowWidth: element.scrollWidth || element.offsetWidth,
        windowHeight: element.scrollHeight || element.offsetHeight,
        onclone: (clonedDocument) => {
          const clonedResume = clonedDocument.querySelector("[data-enhanced-resume='true']");

          if (!clonedResume) {
            return;
          }

          clonedResume.querySelectorAll("*").forEach((node) => {
            node.style.boxShadow = "none";
            node.style.textShadow = "none";
            node.style.color = "#111827";
            node.style.borderColor = "#111827";
          });
        },
      }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timed out preparing visual PDF")), 8000);
      }),
    ]);
    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 24;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;
    const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
    const imageWidth = canvas.width * scale;
    const imageHeight = canvas.height * scale;
    const imageX = (pageWidth - imageWidth) / 2;
    const imageY = (pageHeight - imageHeight) / 2;

    pdf.addImage(imageData, "PNG", imageX, imageY, imageWidth, imageHeight);

    const pdfBlob = pdf.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    return;
  }

  if (resume?.fileName || enhancedResume?.name) {
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 48;
    const gutter = 28;
    const columnWidth = (pageWidth - margin * 2 - gutter) / 2;
    const leftX = margin;
    const rightX = margin + columnWidth + gutter;
    let leftY = 162;
    let rightY = 162;

    const addPageIfNeeded = (side, needed = 30) => {
      return (side === "left" ? leftY : rightY) + needed <= pageHeight - margin;
    };

    const text = (value, x, y, options = {}) => {
      const {
        size = 10,
        style = "normal",
        color = [17, 24, 39],
        width = columnWidth,
        lineHeight = size + 4,
      } = options;

      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      doc.setTextColor(...color);

      const lines = doc.splitTextToSize(normalizePdfText(value), width);
      doc.text(lines, x, y);

      return y + lines.length * lineHeight;
    };

    const section = (title, lines, side = "left") => {
      const x = side === "left" ? leftX : rightX;
      let y = side === "left" ? leftY : rightY;

      if (!addPageIfNeeded(side, 58)) {
        return;
      }
      y = side === "left" ? leftY : rightY;
      y = text(title.toUpperCase(), x, y, {
        size: 12,
        style: "bold",
        width: columnWidth,
        lineHeight: 15,
      });
      doc.setDrawColor(17, 24, 39);
      doc.setLineWidth(2);
      doc.line(x, y + 4, x + columnWidth, y + 4);
      y += 24;
      if (side === "left") {
        leftY = y;
      } else {
        rightY = y;
      }

      (lines?.length ? lines : [""]).forEach((line) => {
        if (!addPageIfNeeded(side, 26)) {
          return;
        }
        y = side === "left" ? leftY : rightY;

        const cleanLine = normalizePdfText(line.replace(/^[•*-]\s*/, ""));
        const isBullet = /^[•*-]/.test(line) || /^\d+[.)]\s/.test(line);
        const looksLikeTitle =
          cleanLine.length < 90 &&
          /project|certificate|internship|degree|bachelor|intermediate|school|training|application|assistant|calculator/i.test(cleanLine);

        y = text(isBullet ? `- ${cleanLine.replace(/^\d+[.)]\s*/, "")}` : cleanLine, x + (isBullet ? 10 : 0), y, {
          size: 8.5,
          style: looksLikeTitle && !isBullet ? "bold" : "normal",
          width: columnWidth - (isBullet ? 10 : 0),
          lineHeight: 11,
        }) + 5;

        if (side === "left") {
          leftY = y;
        } else {
          rightY = y;
        }
      });

      if (side === "left") {
        leftY = y + 14;
      } else {
        rightY = y + 14;
      }
    };

    doc.setFillColor(14, 165, 233);
    doc.circle(pageWidth - 96, 92, 38, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(enhancedResume.initials || "GV", pageWidth - 108, 98);

    let headerY = 70;
    headerY = text(enhancedResume.name.toUpperCase(), margin, headerY, {
      size: 24,
      style: "bold",
      color: [2, 6, 23],
      width: pageWidth - margin * 2 - 120,
      lineHeight: 26,
    });
    headerY = text(
      checklist.find((item) => item.label === "Job Title")?.value ||
      "ATS-friendly resume",
      margin,
      headerY + 8,
      {
        size: 12,
        style: "bold",
        color: [2, 132, 199],
        width: pageWidth - margin * 2 - 120,
        lineHeight: 15,
      }
    );
    text(enhancedResume.contact, margin, headerY + 12, {
      size: 8,
      style: "bold",
      width: pageWidth - margin * 2 - 120,
      lineHeight: 10,
    });

    section("Summary", [enhancedResume.summary], "left");
    section("Education", enhancedResume.education, "left");
    section("Certifications", enhancedResume.certifications, "left");
    section("Skills", enhancedResume.skills, "left");
    section("Key Achievements", achievementLines.map((item) => `OK - ${item}`), "right");
    section("Projects", enhancedResume.projects, "right");

    return doc.output("blob");
  }

  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed = 18) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const drawText = (text, options = {}) => {
    const {
      x = margin,
      size = 10,
      style = "normal",
      leading = size + 4,
      gapAfter = 0,
      maxWidth = contentWidth - (x - margin),
    } = options;
    const lines = doc.splitTextToSize(
      normalizePdfText(text) || " ",
      maxWidth
    );

    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(17, 24, 39);

    lines.forEach((line) => {
      ensureSpace(leading + 2);
      doc.text(line, x, y);
      y += leading;
    });
    y += gapAfter;
  };

  const drawRule = () => {
    ensureSpace(8);
    doc.setDrawColor(17, 24, 39);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;
  };

  const drawSection = (title, lines, fallback) => {
    ensureSpace(34);
    y += 8;
    drawText(title.toUpperCase(), {
      size: 12,
      style: "bold",
      leading: 14,
      gapAfter: 0,
    });
    drawRule();

    const sectionLines = lines?.length ? lines : [fallback];

    sectionLines.forEach((line) => {
      const cleanLine = line.replace(/^[•*-]\s*/, "");
      const isBullet = /^[•*-]/.test(line);
      const isNumbered = /^\d+[.)]\s/.test(line);
      const text = isBullet || isNumbered
        ? `- ${cleanLine.replace(/^\d+[.)]\s*/, "")}`
        : cleanLine;

      drawText(text, {
        x: isBullet ? margin + 12 : margin,
        size: 10,
        style:
          !isBullet &&
            cleanLine.length < 85 &&
            /project|certificate|internship|degree|bachelor|intermediate|school|training|application|assistant|calculator/i.test(cleanLine)
            ? "bold"
            : "normal",
        leading: 13,
      });
    });
  };

  drawText(enhancedResume.name, {
    size: 22,
    style: "bold",
    leading: 26,
    maxWidth: contentWidth,
  });
  drawText(
    checklist.find((item) => item.label === "Job Title")?.value ||
    "ATS-friendly resume",
    {
      size: 12,
      style: "bold",
      leading: 16,
      gapAfter: 2,
    }
  );
  drawText(enhancedResume.contact, {
    size: 9,
    leading: 12,
    gapAfter: 8,
  });

  drawSection("Summary", [enhancedResume.summary], "Add a resume summary.");
  drawSection(
    "Education",
    enhancedResume.education,
    "Add education details with institution, degree, and dates."
  );
  drawSection(
    "Certifications",
    enhancedResume.certifications,
    "Add certifications from the uploaded resume."
  );
  drawSection(
    "Skills",
    enhancedResume.skills,
    checklist.find((item) => item.label === "Hard Skills")?.value ||
    "Add technical skills from the uploaded resume."
  );
  drawSection(
    "Key Achievements",
    achievementLines,
    "Add measurable achievements from the uploaded resume."
  );
  drawSection(
    "Projects",
    enhancedResume.projects,
    "Add project details from the uploaded resume."
  );

  return doc.output("blob");
};

function OriginalResumePreview({
  fileType,
  previewUrl,
  downloadUrl,
}) {
  if (!previewUrl && !downloadUrl) {
    return (
      <div className="grid h-[520px] place-items-center text-slate-500">
        Original file is not available.
      </div>
    );
  }

  if (fileType === "image") {
    return (
      <div className="grid min-h-[760px] place-items-center bg-white">
        <img
          src={previewUrl || downloadUrl}
          alt="Original resume"
          className="max-h-[820px] w-auto max-w-full object-contain"
        />
      </div>
    );
  }

  if (fileType === "pdf") {
    return (
      <iframe
        src={withPdfViewerOptions(previewUrl || downloadUrl)}
        loading="lazy"
        tabIndex="-1"
        className="h-[820px] w-full bg-white"
        title="Original Resume"
      />
    );
  }

  if (fileType === "document") {
    const officeViewerUrl =
      previewUrl || downloadUrl
        ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl || downloadUrl)}`
        : "";

    return (
      <div className="bg-white">
        {officeViewerUrl ? (
          <iframe
            src={officeViewerUrl}
            loading="lazy"
            className="h-[820px] w-full"
            title="Original Resume Document"
          />
        ) : null}
        <div className="border-t border-slate-200 p-4 text-center">
          <a
            href={downloadUrl || previewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white hover:bg-sky-700"
          >
            Open or download original file
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[520px] place-items-center bg-white p-6 text-center">
      <div>
        <p className="text-lg font-bold text-slate-950">
          Preview is not supported for this file type.
        </p>
        <a
          href={downloadUrl || previewUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white hover:bg-sky-700"
        >
          Download original file
        </a>
      </div>
    </div>
  );
}

function ResumeDetails() {
  const { id } = useParams();
  const enhancedResumeRef = useRef(null);

  const [resume, setResume] =
    useState(null);

  const [activeTab, setActiveTab] = useState("original");
  const [isDownloading, setIsDownloading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("Content");

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const fetchResume = async () => {
      try {
        const res = await API.get(
          `/resume/${id}`
        );

        if (isMounted) {
          setResume(res.data);
          requestAnimationFrame(() =>
            window.scrollTo(0, 0)
          );
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchResume();

    return () => {
      isMounted = false;
    };
  }, [id]);


  const checklist = useMemo(
    () => buildChecklist(resume?.extractedText || ""),
    [resume]
  );

  const categoryStats = useMemo(() => {
    if (resume?.parsedResumeData && resume.parsedResumeData.section_scores) {
      const data = resume.parsedResumeData;
      const scores = data.section_scores;

      return [
        {
          name: "Skills Match",
          detail: `${data.missing_skills?.length || 0} missing skills`,
          color: "bg-emerald-500",
          width: `${scores.skills_match || 0}%`,
          score: scores.skills_match || 0,
          suggestions: data.missing_skills?.map(s => `Missing skill from job requirements: ${s}`) || [],
        },
        {
          name: "Experience Match",
          detail: `Score: ${scores.experience_match || 0}/100`,
          color: "bg-blue-600",
          width: `${scores.experience_match || 0}%`,
          score: scores.experience_match || 0,
          suggestions: data.weaknesses?.filter(w => /experience|work|history|intern/i.test(w)) || [],
        },
        {
          name: "Education Match",
          detail: `Score: ${scores.education_match || 0}/100`,
          color: "bg-indigo-500",
          width: `${scores.education_match || 0}%`,
          score: scores.education_match || 0,
          suggestions: data.weaknesses?.filter(w => /degree|education|academic/i.test(w)) || [],
        },
        {
          name: "Projects & Achievements",
          detail: `Score: ${scores.projects_match || 0}/100`,
          color: "bg-violet-600",
          width: `${scores.projects_match || 0}%`,
          score: scores.projects_match || 0,
          suggestions: data.weaknesses?.filter(w => /project|metric|quant/i.test(w)) || [],
        },
        {
          name: "Keyword Optimization",
          detail: `${data.missing_keywords?.length || 0} missing keywords`,
          color: "bg-amber-500",
          width: `${scores.keyword_optimization || 0}%`,
          score: scores.keyword_optimization || 0,
          suggestions: data.missing_keywords?.map(k => `Missing keyword: ${k}`) || [],
        },
        {
          name: "Resume Quality",
          detail: `Score: ${scores.resume_quality || 0}/100`,
          color: "bg-rose-500",
          width: `${scores.resume_quality || 0}%`,
          score: scores.resume_quality || 0,
          suggestions: data.improvement_suggestions || [],
        }
      ];
    }

    return buildCategoryStats(checklist, resume?.suggestions || []);
  }, [checklist, resume]);

  const selectedCategoryStats = useMemo(
    () =>
      categoryStats.find((item) => item.name === selectedCategory) ||
      categoryStats[0],
    [categoryStats, selectedCategory]
  );

  const enhancedResume = useMemo(
    () =>
      buildEnhancedResume(
        resume?.enhancedText || resume?.extractedText || "",
        resume?.extractedText || ""
      ),
    [resume]
  );

  const achievementLines = useMemo(
    () => getAchievementLines(enhancedResume),
    [enhancedResume]
  );

  if (!resume) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="rounded-2xl bg-white border border-slate-200 px-6 py-4 text-slate-700 shadow-sm">
          Loading resume analysis...
        </div>
      </div>
    );
  }

  const uploadedAt = resume.createdAt
    ? new Date(resume.createdAt).toLocaleDateString()
    : "Recently uploaded";

  const suggestionCount =
    checklist.filter((item) => !item.value).length +
    (resume.suggestions?.length || 0);
  const scoreTone = getScoreTone(
    resume.atsScore || 0
  );
  const fileType = inferFileType(resume);
  const streamedOriginalUrl =
    `https://ai-powered-resume-grader-hmyz.onrender.com/api/resume/file/${resume._id}`;
  const originalPreviewUrl =
    fileType === "image"
      ? resume.previewUrl ||
      resume.cloudinaryUrl ||
      resume.resumeUrl ||
      streamedOriginalUrl
      : streamedOriginalUrl;
  const originalDownloadUrl =
    resume.downloadUrl ||
    resume.resumeUrl ||
    resume.cloudinaryUrl ||
    originalPreviewUrl;
  const activeCategoryName =
    selectedCategoryStats?.name || selectedCategory;

  const handleDownloadEnhanced = async () => {
    setIsDownloading(true);
    try {
      setActiveTab("enhanced");

      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });

      const element =
        enhancedResumeRef.current ||
        document.querySelector("[data-enhanced-resume='true']");
      const safeName = (resume.fileName || "enhanced-resume")
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-z0-9_-]+/gi, "-");

      if (!element) {
        return;
      }

      try {
        await buildDownloadPdf(element, `${safeName}-enhanced.pdf`);
      } catch (captureErr) {
        console.error("Visual PDF capture failed, using text PDF fallback:", captureErr);
        const fallbackBlob = await buildDownloadPdf(
          resume,
          enhancedResume,
          checklist,
          achievementLines
        );
        const fallbackUrl = URL.createObjectURL(fallbackBlob);
        const fallbackLink = document.createElement("a");

        fallbackLink.href = fallbackUrl;
        fallbackLink.download = `${safeName}-enhanced.pdf`;
        document.body.appendChild(fallbackLink);
        fallbackLink.click();
        fallbackLink.remove();
        setTimeout(() => URL.revokeObjectURL(fallbackUrl), 2000);
      }
    } catch (err) {
      console.error("Unable to download enhanced resume PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-sky-600">
                ATS Checker AI analysis
              </p>
              <h1 className="mt-2 text-4xl font-black text-slate-950">
                {resume.fileName}
              </h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                Review parsed resume content, ATS sections, original upload, and the enhanced version built from your suggestions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-slate-400"
              >
                Back to history
              </Link>
              <button
                onClick={handleDownloadEnhanced}
                disabled={isDownloading}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                {isDownloading ? "Preparing PDF..." : "Download enhanced"}
              </button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Uploaded
              </p>
              <p className="text-sm font-bold text-slate-950">
                {uploadedAt}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                ATS score
              </p>
              <p className="text-sm font-bold text-slate-950">
                {resume.atsScore || 0}/100
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Suggestions
              </p>
              <p className="text-sm font-bold text-slate-950">
                {suggestionCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Parsed text
              </p>
              <p className="text-sm font-bold text-slate-950">
                {resume.extractedText?.length || 0} chars
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
            <aside className="space-y-5">
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-4 border-b border-slate-200 p-5">
                  <div className="relative flex items-center justify-center size-28 shrink-0 select-none">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke={scoreTone.stroke}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 48}
                        strokeDashoffset={2 * Math.PI * 48 * (1 - (resume.atsScore || 0) / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <span className={`absolute text-3xl font-black ${scoreTone.textClass}`}>
                      {resume.atsScore || 0}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-950">
                      {suggestionCount} suggestions
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Resumes with a score of 75 or higher are more likely to pass ATS.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {categoryStats.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setSelectedCategory(item.name)}
                      className={`w-full p-5 text-left transition ${activeCategoryName === item.name
                          ? "bg-slate-100"
                          : "hover:bg-slate-50"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-black text-slate-950">
                            {item.name}
                          </h2>
                          <p className="mt-2 text-xs text-slate-500">
                            {item.detail}
                          </p>
                        </div>
                        <div className="h-2 w-24 rounded-full bg-slate-200">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{
                              width: item.width,
                            }}
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <h2 className="text-xl font-black text-slate-950">
                    Parsed resume content
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Detected directly from the uploaded file.
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {checklist.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 p-4"
                    >
                      <span
                        className={`mt-1 text-base font-black ${item.value ? "text-emerald-600" : "text-rose-500"
                          }`}
                      >
                        {item.value ? "✓" : "✗"}
                      </span>
                      <p className="min-w-0 text-sm leading-6 text-slate-700">
                        <span className="font-black text-slate-950">
                          {item.label}
                        </span>
                        {item.value ? (
                          <>
                            <span className="px-2 text-slate-400">-</span>
                            <span className="break-words">
                              {item.value.length > 70
                                ? `${item.value.slice(0, 70)}...`
                                : item.value}
                            </span>
                          </>
                        ) : null}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </aside>

            <div className="space-y-5">
              {resume.parsedResumeData && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-2xl font-black text-slate-950 mb-1">
                    ATS Recruiter Insights
                  </h2>
                  <p className="text-sm text-slate-500 mb-5">
                    Direct insights parsed from the resume content against the job requirements.
                  </p>

                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Strengths */}
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
                      <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-lg">✓</span> Strengths
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc pl-4">
                        {(resume.parsedResumeData.strengths || []).map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                        {(!resume.parsedResumeData.strengths || resume.parsedResumeData.strengths.length === 0) && (
                          <li>No notable strengths identified. Add more highlights.</li>
                        )}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4">
                      <h3 className="text-sm font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-lg">✗</span> Gaps & Weaknesses
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc pl-4">
                        {(resume.parsedResumeData.weaknesses || []).map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                        {(!resume.parsedResumeData.weaknesses || resume.parsedResumeData.weaknesses.length === 0) && (
                          <li>No critical weaknesses identified. Excellent match!</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Missing Badges */}
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    {/* Missing Skills */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Missing Required Skills ({resume.parsedResumeData.missing_skills?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(resume.parsedResumeData.missing_skills || []).map((skill, idx) => (
                          <span key={idx} className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
                            {skill}
                          </span>
                        ))}
                        {(!resume.parsedResumeData.missing_skills || resume.parsedResumeData.missing_skills.length === 0) && (
                          <span className="text-xs text-emerald-600 font-bold">All required skills present!</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Unoptimized ATS Keywords ({resume.parsedResumeData.missing_keywords?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(resume.parsedResumeData.missing_keywords || []).map((kw, idx) => (
                          <span key={idx} className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700">
                            {kw}
                          </span>
                        ))}
                        {(!resume.parsedResumeData.missing_keywords || resume.parsedResumeData.missing_keywords.length === 0) && (
                          <span className="text-xs text-emerald-600 font-bold">ATS keywords are perfectly optimized!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-sky-600">
                      {selectedCategoryStats?.name || "Content"} suggestions
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-slate-950">
                      Related improvements
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Click a category on the left to show matching suggestions here.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                    {selectedCategoryStats?.detail || "0 suggestions"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {(selectedCategoryStats?.suggestions?.length
                    ? selectedCategoryStats.suggestions
                    : []).map((item, index) => (
                      <div
                        key={`${selectedCategoryStats?.name}-${index}`}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Suggestion {index + 1}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {item}
                        </p>
                      </div>
                    ))}
                  {!selectedCategoryStats?.suggestions?.length ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-bold text-slate-950">
                        No suggestions
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        This category is complete.
                      </p>
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">PDF</span>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Your Resume
                    </h2>
                  </div>

                  <div className="inline-flex rounded-xl bg-slate-200 p-1">
                    <button
                      onClick={() => setActiveTab("original")}
                      className={`min-w-28 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === "original"
                          ? "bg-white text-emerald-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-950"
                        }`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setActiveTab("enhanced")}
                      className={`min-w-28 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === "enhanced"
                          ? "bg-white text-emerald-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-950"
                        }`}
                    >
                      Enhanced
                    </button>
                  </div>
                </div>

                <div className="bg-slate-100 p-4 lg:p-7">
                  {activeTab === "original" ? (
                    <div className="min-h-[760px] overflow-hidden bg-white shadow-sm">
                      <OriginalResumePreview
                        fileType={fileType}
                        previewUrl={originalPreviewUrl}
                        downloadUrl={originalDownloadUrl}
                      />
                    </div>
                  ) : (
                    <article
                      ref={enhancedResumeRef}
                      data-enhanced-resume="true"
                      className="min-h-[820px] bg-white p-8 shadow-sm lg:p-12"
                    >
                      <header className="flex items-start justify-between gap-6">
                        <div>
                          <h3 className="text-4xl font-black uppercase text-slate-950">
                            {enhancedResume.name}
                          </h3>
                          <p className="mt-2 text-lg font-bold text-sky-600">
                            {checklist.find((item) => item.label === "Job Title")?.value ||
                              "ATS-friendly resume"}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-600">
                            {enhancedResume.contactItems?.length ? (
                              enhancedResume.contactItems.map((item, index) => (
                                <span
                                  key={`${item.label}-${index}`}
                                  className="inline-flex items-center gap-2"
                                >
                                  {index > 0 ? (
                                    <span className="text-slate-400">|</span>
                                  ) : null}
                                  <a
                                    href={item.href}
                                    target={item.href.startsWith("http") ? "_blank" : undefined}
                                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                                    className="text-slate-700 hover:text-sky-600 hover:underline"
                                  >
                                    {item.label}
                                  </a>
                                </span>
                              ))
                            ) : (
                              <span>{enhancedResume.contact}</span>
                            )}
                          </div>
                        </div>

                        <div className="grid size-28 shrink-0 place-items-center rounded-full bg-sky-500 text-3xl font-bold text-slate-950">
                          {enhancedResume.initials || "AI"}
                        </div>
                      </header>

                      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
                        <div className="space-y-8">
                          <section>
                            <h4 className="border-b-4 border-slate-950 pb-1 text-lg font-black uppercase">
                              Summary
                            </h4>
                            <p className="mt-3 text-sm leading-6 text-slate-700">
                              {enhancedResume.summary}
                            </p>
                          </section>

                          <section>
                            <h4 className="border-b-4 border-slate-950 pb-1 text-lg font-black uppercase">
                              Education
                            </h4>
                            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                              {renderResumeLines(
                                enhancedResume.education,
                                checklist.find((item) => item.label === "Education")?.value ||
                                "Add education details with institution, degree, and dates."
                              )}
                            </div>
                          </section>

                          <section>
                            <h4 className="border-b-4 border-slate-950 pb-1 text-lg font-black uppercase">
                              Certifications
                            </h4>
                            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                              {renderResumeLines(
                                enhancedResume.certifications,
                                "Add certifications from the uploaded resume."
                              )}
                            </div>
                          </section>

                          <section>
                            <h4 className="border-b-4 border-slate-950 pb-1 text-lg font-black uppercase">
                              Skills
                            </h4>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {((enhancedResume.skills.length
                                ? enhancedResume.skills.join(", ")
                                : checklist.find((item) => item.label === "Hard Skills")?.value) ||
                                "JavaScript React Node MongoDB Git")
                                .split(/[,|:]/)
                                .flatMap((item) => item.split(/\s{2,}/))
                                .flatMap((item) => item.split(/\s+(?=[A-Z][a-z]+:)/))
                                .map((skill) => skill.trim())
                                .map((skill) => skill.replace(/^(programming|web development|core concepts|databases|tools)\s*/i, ""))
                                .filter(Boolean)
                                .slice(0, 14)
                                .map((skill) => (
                                  <span
                                    key={skill}
                                    className="border-b border-slate-400 px-2 py-1 text-xs font-bold text-slate-700"
                                  >
                                    {skill}
                                  </span>
                                ))}
                            </div>
                          </section>
                        </div>

                        <div className="space-y-8">
                          <section>
                            <h4 className="border-b-4 border-slate-950 pb-1 text-lg font-black uppercase">
                              Key achievements
                            </h4>
                            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                              {achievementLines.map((item, index) => (
                                <li key={index}>
                                  <span className="font-black text-sky-600">OK</span>{" "}
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </section>

                          <section>
                            <h4 className="border-b-4 border-slate-950 pb-1 text-lg font-black uppercase">
                              Projects
                            </h4>
                            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                              {renderResumeLines(
                                enhancedResume.projects,
                                "Add project details from the uploaded resume."
                              )}
                            </div>
                          </section>
                        </div>
                      </div>
                    </article>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ResumeDetails;
