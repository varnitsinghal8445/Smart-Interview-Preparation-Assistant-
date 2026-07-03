import { useEffect, useState } from "react";
import { interviewAPI } from "../lib/api";
import type { Roadmap } from "../types";
import { Card, LoadingSpinner, Alert, Badge } from "../components/ui";

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    interviewAPI
      .getRoadmap()
      .then((res) => setRoadmap(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load roadmap"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="AI is generating your roadmap..." />;
  if (error) return <Alert message={error} type="info" />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Roadmap Generator</h1>
        <p className="text-gray-400 text-sm mt-1">
          Personalized 4-week study plan based on your interview performance
        </p>
      </div>

      <Card className="text-center mb-6">
        <p className="text-sm text-gray-400">Current Score</p>
        <p className="text-4xl font-bold text-blue-400 mt-1">{roadmap?.currentScore}/100</p>
      </Card>

      <div className="space-y-4">
        {roadmap?.weeks?.map((week) => (
          <Card key={week.week}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
                W{week.week}
              </div>
              <div>
                <h3 className="font-semibold">Week {week.week}</h3>
                <p className="text-sm text-gray-400 mt-1">{week.focus}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {week.topics.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
