import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: String,
    fileUrl: String,
    rawText: String,
    extracted: {
      name: String,
      email: String,
      phone: String,
      skills: [String],
      projects: [{ title: String, description: String }],
      education: [{ degree: String, institution: String, year: String }],
      experience: [{ role: String, company: String, duration: String, description: String }],
    },
    atsScore: { type: Number, default: 0 },
    atsAnalysis: {
      strengths: [String],
      suggestions: [String],
      missingKeywords: [String],
      atsFriendly: Boolean,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);
