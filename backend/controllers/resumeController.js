import Resume from "../models/Resume.js";
import { parseResume } from "../services/parserService.js";
import { calculateATSScore } from "../services/atsService.js";
import { buildEnhancedResumeText } from "../services/aiService.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getFileType = (mimeType = "", fileName = "") => {
  const ext = path.extname(fileName).toLowerCase();

  if (mimeType === "application/pdf" || ext === ".pdf") {
    return "pdf";
  }

  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if ([".doc", ".docx"].includes(ext)) {
    return "document";
  }

  return "unsupported";
};

const getCloudinaryResourceType = (fileType) =>
  fileType === "image" ? "image" : "raw";

export const uploadResume = async (req, res) => {
  try {
    console.log("FILE RECEIVED:", req.file);
    console.log("USER:", req.user);

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const { jobDescription } = req.body;

    // Parse the local file
    const extractedText = await parseResume(req.file.path);
    console.log("EXTRACTED TEXT:", extractedText ? extractedText.slice(0, 100) + "..." : "empty");

    // Perform strict ATS Analysis
    const analysisResult = await calculateATSScore(
      extractedText,
      jobDescription || ""
    );

    console.log("ATS ANALYSIS COMPLETE:", analysisResult.ats_score);

    const atsScore = analysisResult.ats_score;
    const suggestions = analysisResult.improvement_suggestions || [];

    const enhancedText = buildEnhancedResumeText(
      extractedText,
      suggestions
    );

    const originalName = path
      .parse(req.file.originalname)
      .name
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const originalExt = path.extname(req.file.originalname) || ".pdf";
    const fileType = getFileType(
      req.file.mimetype,
      req.file.originalname
    );
    const cloudinaryResourceType =
      getCloudinaryResourceType(fileType);
    const cloudinaryPublicId =
      cloudinaryResourceType === "raw"
        ? `${Date.now()}-${originalName}${originalExt}`
        : `${Date.now()}-${originalName}`;
    const extractedTextPath = path.join(
      path.dirname(req.file.path),
      `${path.parse(req.file.filename).name}-extracted.txt`
    );

    await fs.promises.writeFile(
      extractedTextPath,
      extractedText,
      "utf8"
    );

    
    const uploadOptions = {
  folder: "resumes/originals",
  resource_type: "raw",
  type: "upload",
  access_mode: "public",
  use_filename: true,
  unique_filename: true,
};

    const cloudinaryResult = await cloudinary.uploader.upload(
      req.file.path,
      uploadOptions
    );

    const extractedTextResult = await cloudinary.uploader.upload(
      extractedTextPath,
      {
        folder: "resumes/extracted-text",
        resource_type: "raw",
        use_filename: true,
        unique_filename: true,
        filename_override: `${originalName}-extracted.txt`,
        public_id: `${Date.now()}-${originalName}-extracted.txt`,
      }
    );

    console.log("CLOUDINARY URL:", cloudinaryResult.secure_url);

    
    const previewUrl =
      cloudinaryResult.secure_url;

    // Delete local files after Cloudinary upload
    fs.unlinkSync(req.file.path);
    fs.unlinkSync(extractedTextPath);

    const resume = await Resume.create({
      user: req.user.id,

      // Legacy fields for backward compatibility
      resumeUrl: cloudinaryResult.secure_url,
      resumePublicId: cloudinaryResult.public_id,
      resumeResourceType: cloudinaryResult.resource_type,
      fileMimeType: req.file.mimetype,
      fileType,
      previewUrl,
      downloadUrl: cloudinaryResult.secure_url,
      extractedTextUrl: extractedTextResult.secure_url,
      fileName: req.file.originalname,
      extractedText,
      enhancedText,
      atsScore,
      suggestions,

      // Modern required fields
      originalFileName: req.file.originalname,
      cloudinaryUrl: previewUrl,
      publicId: cloudinaryResult.public_id,
      parsedResumeData: analysisResult,
      uploadedAt: new Date(),
      jobDescription: jobDescription || "",
    });

    console.log("RESUME SAVED:", resume._id);

    res.status(201).json({
      message: "Resume uploaded successfully",
      resume,
    });
  } catch (err) {
    console.log("UPLOAD ERROR:", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({
      user: req.user.id,
    });
    res.json(resumes);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    res.json(resume);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

export const previewResumeFile = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        message: "Resume file not found",
      });
    }

    // Prefer regenerating the Cloudinary URL from stable fields.
    // Some older records may contain an invalid/stale resumeUrl.
    const publicId =
      resume.publicId ||
      resume.resumePublicId;

    const resourceType =
      resume.resumeResourceType ||
      (resume.fileType === "image" ? "image" : "raw");

    let fileUrl;

    
    if (resume.resumeUrl) {
  fileUrl = resume.resumeUrl;
} else if (publicId) {
  fileUrl = cloudinary.url(publicId, {
    resource_type: resourceType,
    type: "upload",
    secure: true,
  });
}


    if (!fileUrl) {
      return res.status(404).json({
        message: "Resume URL not found (missing publicId and resumeUrl)",
      });
    }

    console.log(
      "Fetching resume file for preview from:",
      fileUrl,
      "| publicId:",
      publicId,
      "| resourceType:",
      resourceType,
      "| recordId:",
      resume._id
    );

    // IMPORTANT: Cloudinary assets might be private/authenticated.
    // For iframe/pdf rendering, we must use the server to proxy the file bytes.
    // If authenticated access is still required, this endpoint may need auth/signature,
    // which requires correct Cloudinary credentials and asset type.
    const response = await fetch(fileUrl);

    if (!response.ok) {

      const bodyText = await response.text().catch(() => "");
      console.error(
        "Failed to fetch resume file from Cloudinary:",
        response.status,
        response.statusText,
        bodyText.slice(0, 300)
      );
      return res.status(502).json({
        message: "Unable to load resume file from Cloudinary",
        status: response.status,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType =
      response.headers.get("content-type") ||
      "application/pdf";

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${resume.fileName || "resume.pdf"}"`
    );

    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("Error in previewResumeFile:", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

