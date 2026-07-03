import { useState } from "react";
import { resumeAPI } from "../lib/api";
import { Card, Button, LoadingSpinner, Alert, Badge } from "../components/ui";

interface GeneratedQuestions {
  questions: {
    easy: { question: string; category: string; topic: string }[];
    medium: { question: string; category: string; topic: string }[];
    hard: { question: string; category: string; topic: string }[];
  };
}

export default function QuestionsPage() {
  const [data, setData] = useState<GeneratedQuestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await resumeAPI.getQuestions();
      setData(res.data);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Failed to generate questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderGroup = (
    title: string,
    questions: { question: string; category: string; topic: string }[],
    variant: "success" | "warning" | "danger"
  ) => (
    <Card title={`${title} (${questions?.length || 0})`}>
      <div className="space-y-3">
        {questions?.map((q, i) => (
          <div key={i} className="p-3 bg-gray-800 rounded-lg">
            <div className="flex gap-2 mb-1">
              <Badge variant={variant}>{q.category}</Badge>
              <Badge>{q.topic}</Badge>
            </div>
            <p className="text-sm">{q.question}</p>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Interview Question Generator</h1>
        <p className="text-gray-400 text-sm mt-1">
          Questions generated from your resume skills — Easy, Medium, Hard
        </p>
      </div>

      {error && <Alert message={error} />}

      <Card>
        <Button onClick={generate} disabled={loading}>
          {loading ? "Generating..." : "Generate Questions from Resume"}
        </Button>
      </Card>

      {loading && <LoadingSpinner text="AI is generating personalized questions..." />}

      {data && (
        <div className="grid grid-cols-1 gap-4 mt-4">
          {renderGroup("Easy Questions", data.questions.easy, "success")}
          {renderGroup("Medium Questions", data.questions.medium, "warning")}
          {renderGroup("Hard Questions", data.questions.hard, "danger")}
        </div>
      )}
    </div>
  );
}
