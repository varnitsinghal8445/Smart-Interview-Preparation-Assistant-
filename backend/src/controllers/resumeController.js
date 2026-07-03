import fs from "fs/promises";
import Resume from "../models/Resume.js";
import { analyzeResume, generateQuestions, getCareerRecommendation } from "../services/aiService.js";
import { extractTextFromFile } from "../utils/resumeParser.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Please upload a resume file." });

    const rawText = await extractTextFromFile(
      req.file.path,
      req.file.mimetype,
      req.file.originalname
    );

    if (!rawText) return res.status(400).json({ error: "Could not extract text from resume." });

    const analysis = await analyzeResume(rawText);

    await Resume.deleteMany({ userId: req.user._id });

    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      rawText,
      extracted: analysis.extracted,
      atsScore: analysis.atsScore,
      atsAnalysis: analysis.atsAnalysis,
    });

    await fs.unlink(req.file.path).catch(() => {});

    res.status(201).json(resume);
  } catch (error) {
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: error.message });
  }
};

export const getMyResume = async (req, res) => {
  const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
  if (!resume) return res.status(404).json({ error: "No resume found. Upload one first." });
  res.json(resume);
};

export const getResumeQuestions = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!resume) return res.status(404).json({ error: "Upload resume first." });

    const questions = await generateQuestions(resume.rawText, resume.extracted?.skills || []);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCareerSuggestions = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!resume) return res.status(404).json({ error: "Upload resume first." });

    const recommendation = await getCareerRecommendation(resume.rawText);
    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
