import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParseFromCjs = require("./pdfParseCjs.cjs");


export const parseResume = async (filePath) => {
  try {
    console.log("Parsing file:", filePath);

    if (!fs.existsSync(filePath)) {
      console.error("File does not exist:", filePath);
      throw new Error("File not found");
    }

    if (filePath.toLowerCase().endsWith(".pdf")) {
      console.log("Reading PDF file...");
      const dataBuffer = await fs.promises.readFile(filePath);
      console.log("PDF buffer size:", dataBuffer.length);

      // pdf-parse@2.x callable form (loaded from CJS helper)
      let extractedTextRaw = "";
      try {
        extractedTextRaw = await pdfParseFromCjs(dataBuffer);
      } catch (e) {
        console.warn("PDF parsing failed; continuing with empty extracted text.", e?.message || e);
        extractedTextRaw = "";
      }

      const extractedText = extractedTextRaw || "";


      const rawText = extractedText.trim();

      // Keep upload successful for scanned PDFs, but make the backend state explicit.
      if (!rawText || rawText.length < 20) {
        console.warn("PDF text extraction produced no usable text.");
        return "No selectable text was found in this PDF. If this is a scanned resume, upload a text-based PDF for ATS analysis.";
      }

      const structuredText = rawText
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim();

      console.log("PDF parsed successfully, text length:", structuredText.length);
      return structuredText;
    }

    console.log("File is not a PDF, returning placeholder");
    return "File parsed successfully (text extraction for .doc/.docx not yet implemented)";
  } catch (error) {
    console.error("Error parsing resume:", error.message);
    console.error("Full error:", error);
    throw new Error(`Failed to parse resume file: ${error.message}`);
  }
};

