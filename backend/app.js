import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "https://ai-powered-resume-grader-three.vercel.app",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/auth", authRoutes);

app.use("/api/resume", resumeRoutes);

export default app;