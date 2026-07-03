import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, RotateCcw } from "lucide-react";
import { interviewAPI } from "../lib/api";
import type { Interview } from "../types";
import { Card, Button, LoadingSpinner, Alert, Badge } from "../components/ui";

export default function ResultsPage() {
  const { id } = useParams();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    interviewAPI
      .getOne(id)
      .then((res) => setInterview(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load results"))
      .finally(() => setLoading(false));
  }, [id]);

  const downloadPDF = async () => {
    if (!id) return;
    try {
      const res = await interviewAPI.downloadReport(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `interview-report-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download PDF report");
    }
  };

  if (loading) return <LoadingSpinner text="Loading interview replay..." />;
  if (error) return <Alert message={error} />;
  if (!interview) return <Alert message="Interview not found" type="info" />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interview Replay AI</h1>
          <p className="text-gray-400 text-sm mt-1">
            Question-by-question analysis with ideal answers
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadPDF} variant="secondary">
            <Download size={16} className="inline mr-1" /> PDF Report
          </Button>
          <Button onClick={() => (window.location.href = "/interview")} variant="primary">
            <RotateCcw size={16} className="inline mr-1" /> Retry
          </Button>
        </div>
      </div>

      <Card className="text-center mb-6">
        <div className="text-6xl font-bold text-blue-400 mb-2">{interview.overallScore}/100</div>
        <Badge variant={interview.selection === "Yes" ? "success" : "danger"}>
          Selection: {interview.selection}
        </Badge>
        <p className="text-gray-400 text-sm mt-3 max-w-lg mx-auto">{interview.verdictSummary}</p>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {interview.weakTopics?.map((t) => (
          <Card key={t} className="text-center">
            <p className="text-xs text-gray-500">Weak Topic</p>
            <Badge variant="danger">{t}</Badge>
          </Card>
        ))}
        {interview.strongTopics?.map((t) => (
          <Card key={t} className="text-center">
            <p className="text-xs text-gray-500">Strong Topic</p>
            <Badge variant="success">{t}</Badge>
          </Card>
        ))}
      </div>

      <Card title="Question-by-Question Replay">
        <div className="space-y-4">
          {interview.answers?.map((a, i) => (
            <div key={i} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-sm">
                  Q{i + 1}: {a.question}
                </p>
                <span className="text-blue-400 font-bold text-sm">
                  {a.score}/{a.maxScore}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">
                <span className="text-gray-500">Your answer:</span> {a.userAnswer}
              </p>
              <p className="text-sm mb-2">{a.feedback}</p>

              {a.evaluation && (
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {Object.entries(a.evaluation).map(([key, val]) => (
                    <div key={key} className="text-center p-2 bg-gray-900 rounded">
                      <p className="text-xs text-gray-500 capitalize">{key}</p>
                      <p className="font-bold text-sm">{val}/10</p>
                    </div>
                  ))}
                </div>
              )}

              {a.mistakes?.length > 0 && (
                <ul className="text-sm text-red-300 mb-2">
                  {a.mistakes.map((m, j) => (
                    <li key={j}>• {m}</li>
                  ))}
                </ul>
              )}

              {a.suggestedAnswer && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs text-green-400 mb-1">Ideal Answer:</p>
                  <p className="text-sm">{a.suggestedAnswer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {interview.roadmap && (
        <Card title="4-Week AI Roadmap" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {interview.roadmap.weeks?.map((w) => (
              <div key={w.week} className="p-4 bg-gray-800 rounded-lg">
                <p className="font-bold text-blue-400 mb-2">Week {w.week}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {w.topics.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-400">{w.focus}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {interview.careerRecommendation && (
        <Card title="Career Recommendations" className="mt-4">
          <p className="text-sm mb-3">{interview.careerRecommendation.reasoning}</p>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Recommended Roles</p>
            <div className="flex flex-wrap gap-2">
              {interview.careerRecommendation.recommendedRoles?.map((r) => (
                <Badge key={r} variant="success">
                  {r}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Skills to Learn</p>
            <div className="flex flex-wrap gap-2">
              {interview.careerRecommendation.missingSkills?.map((s) => (
                <Badge key={s} variant="warning">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
