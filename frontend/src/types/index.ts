export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Resume {
  _id: string;
  fileName: string;
  rawText: string;
  extracted: {
    name: string;
    email: string;
    skills: string[];
    projects: { title: string; description: string }[];
    education: { degree: string; institution: string; year: string }[];
    experience: { role: string; company: string; duration: string; description: string }[];
  };
  atsScore: number;
  atsAnalysis: {
    strengths: string[];
    suggestions: string[];
    missingKeywords: string[];
    atsFriendly: boolean;
  };
}

export interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: string;
  type?: "interview" | "coding" | "mcq";
  round?: number;
  description?: string;
  url?: string;
  testCases?: Array<{ input: string; expected: string; explanation: string }>;
  languages?: string[];
  options?: string[];
  correctAnswer?: number;
}

export interface AnswerEvaluation {
  question: string;
  category?: string;
  difficulty?: string;
  userAnswer: string;
  score: number;
  maxScore: number;
  feedback: string;
  mistakes: string[];
  suggestedAnswer: string;
  evaluation: {
    confidence: number;
    communication: number;
    technicalAccuracy: number;
    grammar: number;
    completeness: number;
  };
}

export interface Interview {
  _id: string;
  status: string;
  mode: string;
  questions: Question[];
  answers: AnswerEvaluation[];
  overallScore?: number;
  selection?: "Yes" | "No";
  verdictSummary?: string;
  weakTopics?: string[];
  strongTopics?: string[];
  roadmap?: Roadmap;
  careerRecommendation?: CareerRecommendation;
  createdAt: string;
}

export interface Roadmap {
  currentScore: number;
  weeks: { week: number; topics: string[]; focus: string }[];
}

export interface CareerRecommendation {
  recommendedRoles: string[];
  missingSkills: string[];
  reasoning: string;
}

export interface DashboardStats {
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
  weakTopics: string[];
  strongTopics: string[];
  scoreTrend: { date: string; score: number }[];
  topicPerformance: { topic: string; score: number }[];
  recentInterviews: Interview[];
}

export interface LearningTopic {
  title: string;
  videoId?: string;
  duration: string;
  url: string;
  image: string;
}

export type LearningSubjects = Record<string, LearningTopic[]>;
