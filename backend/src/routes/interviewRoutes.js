import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterview,
  getMyInterviews,
  getDashboardStats,
  getRoadmap,
  downloadReport,
  getRoundsStatus,
  updateRoundStatus,
} from "../controllers/interviewController.js";

const router = Router();

router.get("/dashboard", protect, getDashboardStats);
router.get("/roadmap", protect, getRoadmap);
router.get("/", protect, getMyInterviews);
router.post("/start", protect, startInterview);
router.post("/answer", protect, submitAnswer);
router.post("/:id/complete", protect, completeInterview);
router.get("/:id/report", protect, downloadReport);
router.get("/:id", protect, getInterview);
router.get("/rounds/status", protect, getRoundsStatus);
router.post("/rounds/update", protect, updateRoundStatus);

export default router;
