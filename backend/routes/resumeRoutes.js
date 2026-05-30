import express from "express";

import protect from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

import {
  uploadResume,
  getMyResumes,
  getResumeById,
  previewResumeFile,
} from "../controllers/resumeController.js";

const router = express.Router();

router.post(
  "/upload",
  protect,
  upload.single("resume"),
  uploadResume
);

router.get(
  "/my-resumes",
  protect,
  getMyResumes
);

router.get(
  "/file/:id",
  previewResumeFile
);

router.get(
  "/:id",
  protect,
  getResumeById
);

export default router;
