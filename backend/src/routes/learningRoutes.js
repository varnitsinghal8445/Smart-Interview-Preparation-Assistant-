import { Router } from "express";
import { getAllTopics, getSubjectTopics } from "../controllers/learningController.js";

const router = Router();

router.get("/", getAllTopics);
router.get("/:subject", getSubjectTopics);

export default router;
