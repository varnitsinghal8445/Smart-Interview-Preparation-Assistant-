import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Code, FileText, Mic, Play, Eye, CheckCircle } from "lucide-react";
import { interviewAPI } from "../lib/api";
import { Card, Button, Badge } from "../components/ui";

interface RoundStatus {
  status: "not_started" | "in_progress" | "completed";
  score?: number;
  completedAt?: string;
}

interface InterviewRounds {
  coding: RoundStatus;
  mcq: RoundStatus;
  hr: RoundStatus;
}

export default function InterviewRoundsPage() {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState<InterviewRounds>({
    coding: { status: "not_started" },
    mcq: { status: "not_started" },
    hr: { status: "not_started" },
  });
  const [loading, setLoading] = useState(true);
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null);

  useEffect(() => {
    loadRoundsStatus();
  }, []);

  const loadRoundsStatus = async () => {
    try {
      const res = await interviewAPI.getRoundsStatus();
      if (res.data) {
        setRounds(res.data.rounds);
        setCurrentInterviewId(res.data.interviewId);
      }
    } catch (error) {
      console.error("Failed to load rounds status:", error);
    } finally {
      setLoading(false);
    }
  };

  const startRound = async (roundType: "coding" | "mcq" | "hr") => {
    try {
      // Create or get interview
      if (!currentInterviewId) {
        const interviewRes = await interviewAPI.start("text", "coding");
        setCurrentInterviewId(interviewRes.data._id);
      }

      // Navigate to interview page with round type
      navigate(`/interview?round=${roundType}&interviewId=${currentInterviewId}`);
    } catch (error) {
      console.error("Failed to start round:", error);
    }
  };

  const resumeRound = (roundType: "coding" | "mcq" | "hr") => {
    navigate(`/interview?round=${roundType}&interviewId=${currentInterviewId}&resume=true`);
  };

  const viewRound = (roundType: "coding" | "mcq" | "hr") => {
    navigate(`/interview?round=${roundType}&interviewId=${currentInterviewId}&view=true`);
  };

  const getStatusBadge = (status: RoundStatus["status"]) => {
    switch (status) {
      case "not_started":
        return <Badge variant="default">Not Started</Badge>;
      case "in_progress":
        return <Badge variant="warning">In Progress</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
    }
  };

  const getButton = (roundType: "coding" | "mcq" | "hr", status: RoundStatus["status"]) => {
    switch (status) {
      case "not_started":
        return (
          <Button onClick={() => startRound(roundType)} className="w-full">
            <Play size={16} className="inline mr-2" /> Start
          </Button>
        );
      case "in_progress":
        return (
          <Button onClick={() => resumeRound(roundType)} className="w-full">
            <Play size={16} className="inline mr-2" /> Resume
          </Button>
        );
      case "completed":
        return (
          <Button onClick={() => viewRound(roundType)} variant="secondary" className="w-full">
            <Eye size={16} className="inline mr-2" /> View
          </Button>
        );
    }
  };

  const allCompleted = rounds.coding.status === "completed" && 
                        rounds.mcq.status === "completed" && 
                        rounds.hr.status === "completed";

  if (loading) {
    return <div className="text-center py-12">Loading interview rounds...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Interview Rounds</h1>
        <p className="text-gray-400 text-sm mt-1">
          Complete all three rounds in any order to finish your interview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Coding Round */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Code className="text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Round 1</h3>
                <p className="text-gray-400 text-sm">Coding Round</p>
              </div>
            </div>
            {getStatusBadge(rounds.coding.status)}
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Solve 2 coding problems with test cases. Choose from C, C++, Python, or Java.
          </p>
          {rounds.coding.status === "completed" && rounds.coding.score !== undefined && (
            <div className="mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Score</span>
                <span className="font-bold text-green-400">{rounds.coding.score}/20</span>
              </div>
            </div>
          )}
          {getButton("coding", rounds.coding.status)}
        </Card>

        {/* MCQ Round */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <FileText className="text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Round 2</h3>
                <p className="text-gray-400 text-sm">MCQ Round</p>
              </div>
            </div>
            {getStatusBadge(rounds.mcq.status)}
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Answer 10 multiple-choice aptitude questions covering data structures and algorithms.
          </p>
          {rounds.mcq.status === "completed" && rounds.mcq.score !== undefined && (
            <div className="mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Score</span>
                <span className="font-bold text-green-400">{rounds.mcq.score}/10</span>
              </div>
            </div>
          )}
          {getButton("mcq", rounds.mcq.status)}
        </Card>

        {/* HR Interview Round */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Mic className="text-orange-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Round 3</h3>
                <p className="text-gray-400 text-sm">HR Interview</p>
              </div>
            </div>
            {getStatusBadge(rounds.hr.status)}
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Answer 3 behavioral and HR questions using voice or text input.
          </p>
          {rounds.hr.status === "completed" && rounds.hr.score !== undefined && (
            <div className="mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Score</span>
                <span className="font-bold text-green-400">{rounds.hr.score}/30</span>
              </div>
            </div>
          )}
          {getButton("hr", rounds.hr.status)}
        </Card>
      </div>

      {allCompleted && (
        <Card className="text-center py-8">
          <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-bold mb-2">All Rounds Completed!</h3>
          <p className="text-gray-400 mb-6">
            You have completed all three interview rounds. View your final report.
          </p>
          <Button
            onClick={() => navigate(`/results/${currentInterviewId}`)}
            className="px-8 py-3"
          >
            View Final Interview Report
          </Button>
        </Card>
      )}
    </div>
  );
}
