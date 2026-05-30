import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    resumeUrl: String,

    resumePublicId: String,

    resumeResourceType: String,

    fileMimeType: String,

    fileType: String,

    previewUrl: String,

    downloadUrl: String,

    extractedTextUrl: String,

    fileName: String,

    extractedText: String,

    enhancedText: String,

    atsScore: Number,

    suggestions: [String],

    targetRole: {
      type: String,
      default: "Software Engineer",
    },

    originalFileName: String,

    cloudinaryUrl: String,

    publicId: String,

    parsedResumeData: mongoose.Schema.Types.Mixed,

    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    jobDescription: String,
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
