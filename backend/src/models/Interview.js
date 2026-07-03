import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  question: String,
  category: String,
  difficulty: String,
  userAnswer: String,
  score: Number,
  maxScore: { type: Number, default: 10 },
  feedback: String,
  mistakes: [String],
  suggestedAnswer: String,
  evaluation: {
    confidence: Number,
    communication: Number,
    technicalAccuracy: Number,
    grammar: Number,
    completeness: Number,
  },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
    mode: { type: String, enum: ["text", "voice"], default: "text" },
    status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
    interviewType: { type: String, enum: ["simple", "coding"], default: "simple" },
    questions: [
      {
        id: Number,
        question: String,
        category: String,
        difficulty: String,
        type: { type: String, enum: ["interview", "coding", "mcq"] },
        round: Number,
      },
    ],
    answers: [answerSchema],
    overallScore: Number,
    selection: { type: String, enum: ["Yes", "No"] },
    weakTopics: [String],
    strongTopics: [String],
    verdictSummary: String,
    roadmap: {
      currentScore: Number,
      weeks: [{ week: Number, topics: [String], focus: String }],
    },
    careerRecommendation: {
      recommendedRoles: [String],
      missingSkills: [String],
      reasoning: String,
    },
    // Round-specific tracking
    rounds: {
      coding: {
        status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
        score: Number,
        completedAt: Date,
      },
      mcq: {
        status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
        score: Number,
        completedAt: Date,
      },
      hr: {
        status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
        score: Number,
        completedAt: Date,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);
