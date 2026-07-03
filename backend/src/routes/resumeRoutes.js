import { Router } from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/auth.js";
import {
  uploadResume,
  getMyResume,
  getResumeQuestions,
  getCareerSuggestions,
} from "../controllers/resumeController.js";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = [".pdf", ".docx", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF, DOCX, and TXT files allowed."));
  },
});

const router = Router();

router.post("/upload", protect, upload.single("resume"), uploadResume);
router.get("/me", protect, getMyResume);
router.get("/questions", protect, getResumeQuestions);
router.get("/career", protect, getCareerSuggestions);

export default router;
