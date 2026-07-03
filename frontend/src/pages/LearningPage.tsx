import { useEffect, useState } from "react";
import { Play, Clock } from "lucide-react";
import { learningAPI } from "../lib/api";
import type { LearningSubjects } from "../types";
import { Card, LoadingSpinner, Alert, Badge } from "../components/ui";

export default function LearningPage() {
  const [subjects, setSubjects] = useState<LearningSubjects>({});
  const [activeSubject, setActiveSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    learningAPI
      .getAll()
      .then((res) => {
        setSubjects(res.data);
        const keys = Object.keys(res.data);
        if (keys.length) setActiveSubject(keys[0]);
      })
      .catch((err) => setError(err.response?.data?.error || "Failed to load topics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading learning center..." />;
  if (error) return <Alert message={error} />;

  const subjectKeys = Object.keys(subjects);
  const topics = subjects[activeSubject] || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Subject Learning Center</h1>
        <p className="text-gray-400 text-sm mt-1">One-shot video lessons for interview topics</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {subjectKeys.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSubject(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSubject === s
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic) => (
          <Card key={topic.title}>
            <div className="aspect-video bg-gray-800 rounded-lg mb-3 overflow-hidden relative group">
              <img
                src={topic.image}
                alt={topic.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={topic.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Play size={16} /> Watch Video
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{topic.title}</h3>
              <Badge>
                <Clock size={12} className="inline mr-1" />
                {topic.duration}
              </Badge>
            </div>
            <a
              href={topic.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1 text-sm text-blue-400 hover:underline"
            >
              <Play size={14} /> Watch on YouTube
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
