import Interview from "../models/Interview.js";
import Resume from "../models/Resume.js";
import {
  evaluateAnswer,
  evaluateFullInterview,
  generateMockInterviewQuestions,
  generateRoadmap,
} from "../services/aiService.js";
import { generateInterviewReportPDF } from "../utils/pdfReport.js";

export const getRoundsStatus = async (req, res) => {
  try {
    const interview = await Interview.findOne({ 
      userId: req.user._id, 
      status: "in-progress",
      interviewType: "coding"
    }).sort({ createdAt: -1 });
    
    if (!interview) {
      return res.json({ rounds: { coding: { status: "not_started" }, mcq: { status: "not_started" }, hr: { status: "not_started" } } });
    }
    
    res.json({ 
      interviewId: interview._id,
      rounds: interview.rounds 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRoundStatus = async (req, res) => {
  try {
    const { interviewId, roundType, status, score } = req.body;
    
    const interview = await Interview.findOne({ _id: interviewId, userId: req.user._id });
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    
    interview.rounds[roundType] = {
      ...interview.rounds[roundType],
      status,
      ...(score !== undefined && { score }),
      ...(status === "completed" && { completedAt: new Date() })
    };
    
    await interview.save();
    res.json({ rounds: interview.rounds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const startInterview = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!resume) return res.status(404).json({ error: "Upload resume first." });

    const interviewType = req.body.interviewType || "simple";
    const questions = await generateMockInterviewQuestions(resume.rawText, interviewType);
    const interview = await Interview.create({
      userId: req.user._id,
      resumeId: resume._id,
      mode: req.body.mode || "text",
      interviewType,
      questions,
      status: "in-progress",
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    console.log("📤 Backend: Received answer submission");
    const { interviewId, questionId, answer } = req.body;
    console.log("📝 Backend: Interview ID:", interviewId, "Question ID:", questionId);
    console.log("💬 Backend: Answer:", answer);
    
    const interview = await Interview.findOne({ _id: interviewId, userId: req.user._id });
    if (!interview) {
      console.error("❌ Backend: Interview not found");
      return res.status(404).json({ error: "Interview not found." });
    }
    console.log("✅ Backend: Interview found");

    const question = interview.questions.find((q) => q.id === questionId);
    if (!question) {
      console.error("❌ Backend: Invalid question ID");
      return res.status(400).json({ error: "Invalid question." });
    }
    if (!answer?.trim()) {
      console.error("❌ Backend: Empty answer");
      return res.status(400).json({ error: "Answer cannot be empty." });
    }
    console.log("✅ Backend: Question validated:", question.question);

    const resume = await Resume.findById(interview.resumeId);
    console.log("📄 Backend: Resume found:", !!resume);
    
    console.log("🤖 Backend: Calling AI evaluation...");
    const evaluation = await evaluateAnswer(question.question, answer, resume?.rawText || "");
    console.log("✅ Backend: AI evaluation completed:", evaluation);

    const answerEntry = {
      question: question.question,
      category: question.category,
      difficulty: question.difficulty,
      userAnswer: answer,
      score: evaluation.score,
      maxScore: evaluation.maxScore || 10,
      feedback: evaluation.feedback,
      mistakes: evaluation.mistakes,
      suggestedAnswer: evaluation.suggestedAnswer,
      evaluation: evaluation.evaluation,
    };

    interview.answers = interview.answers.filter((a) => a.question !== question.question);
    interview.answers.push(answerEntry);
    await interview.save();

    res.json({ message: "Answer evaluated.", answer: answerEntry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ error: "Interview not found." });

    if (interview.answers.length < interview.questions.length) {
      return res.status(400).json({ error: "Answer all questions before completing." });
    }

    const resume = await Resume.findById(interview.resumeId);
    const qaPairs = interview.answers.map((a) => ({
      question: a.question,
      answer: a.userAnswer,
    }));

    const result = await evaluateFullInterview(resume?.rawText || "", qaPairs);

    interview.overallScore = result.overallScore;
    interview.selection = result.selection;
    interview.verdictSummary = result.verdictSummary;
    interview.weakTopics = result.weakTopics;
    interview.strongTopics = result.strongTopics;
    interview.roadmap = result.roadmap;
    interview.careerRecommendation = result.careerRecommendation;
    interview.status = "completed";

    if (result.answers?.length) {
      interview.answers = result.answers.map((a, i) => ({
        ...interview.answers[i]?.toObject?.() || interview.answers[i],
        ...a,
      }));
    }

    await interview.save();
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInterview = async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
  if (!interview) return res.status(404).json({ error: "Interview not found." });
  res.json(interview);
};

export const getMyInterviews = async (req, res) => {
  const interviews = await Interview.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(interviews);
};

export const getDashboardStats = async (req, res) => {
  const interviews = await Interview.find({
    userId: req.user._id,
    status: "completed",
  }).sort({ createdAt: -1 });

  const scores = interviews.map((i) => i.overallScore).filter(Boolean);
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;

  const weakTopics = {};
  const strongTopics = {};
  interviews.forEach((i) => {
    (i.weakTopics || []).forEach((t) => (weakTopics[t] = (weakTopics[t] || 0) + 1));
    (i.strongTopics || []).forEach((t) => (strongTopics[t] = (strongTopics[t] || 0) + 1));
  });

  const scoreTrend = interviews
    .slice(0, 10)
    .reverse()
    .map((i) => ({
      date: i.createdAt.toISOString().split("T")[0],
      score: i.overallScore,
    }));

  const topicPerformance = {};
  interviews.forEach((i) => {
    (i.answers || []).forEach((a) => {
      const topic = a.category || "General";
      if (!topicPerformance[topic]) topicPerformance[topic] = { total: 0, count: 0 };
      topicPerformance[topic].total += (a.score || 0) * 10;
      topicPerformance[topic].count += 1;
    });
  });

  const topicScores = Object.entries(topicPerformance).map(([topic, data]) => ({
    topic,
    score: data.count ? Math.round(data.total / data.count) : 0,
  }));

  res.json({
    totalInterviews: interviews.length,
    averageScore: avgScore,
    bestScore,
    weakTopics: Object.entries(weakTopics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic),
    strongTopics: Object.entries(strongTopics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic),
    scoreTrend,
    topicPerformance: topicScores,
    recentInterviews: interviews.slice(0, 5),
  });
};

export const getRoadmap = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    const lastInterview = await Interview.findOne({
      userId: req.user._id,
      status: "completed",
    }).sort({ createdAt: -1 });

    if (!resume) return res.status(404).json({ error: "Upload resume first." });

    const score = lastInterview?.overallScore || 50;
    const weak = lastInterview?.weakTopics || ["DSA", "OOPS"];

    if (lastInterview?.roadmap?.weeks?.length) {
      return res.json(lastInterview.roadmap);
    }

    const roadmap = await generateRoadmap(resume.rawText, score, weak);
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadReport = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ error: "Interview not found." });

    const resume = await Resume.findById(interview.resumeId);
    const pdfBuffer = await generateInterviewReportPDF(interview, req.user, resume);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=interview-report-${interview._id}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
