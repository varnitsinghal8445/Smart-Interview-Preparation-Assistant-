import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Trophy, TrendingUp, AlertTriangle } from "lucide-react";
import { interviewAPI } from "../lib/api";
import type { DashboardStats } from "../types";
import { Card, StatCard, LoadingSpinner, Alert, Badge } from "../components/ui";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [subjects, setSubjects] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      interviewAPI.getDashboard(),
      import("../lib/api").then(api => api.learningAPI.getAll())
    ])
      .then(([statsRes, subjectsRes]) => {
        setStats(statsRes.data);
        setSubjects(subjectsRes.data);
      })
      .catch((err) => setError(err.response?.data?.error || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const getTopicSubject = (topic: string): string => {
    for (const [subject, topicList] of Object.entries(subjects)) {
      if (topicList.some((t: any) => t.title.toLowerCase().includes(topic.toLowerCase()) || 
                           topic.toLowerCase().includes(t.title.toLowerCase()))) {
        return subject;
      }
    }
    return "General";
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <Alert message={error} type="info" />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Your interview preparation overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Interviews"
          value={stats?.totalInterviews || 0}
          icon={<BarChart3 size={22} />}
          color="blue"
        />
        <StatCard
          label="Average Score"
          value={`${stats?.averageScore || 0}/100`}
          icon={<TrendingUp size={22} />}
          color="green"
        />
        <StatCard
          label="Best Score"
          value={`${stats?.bestScore || 0}/100`}
          icon={<Trophy size={22} />}
          color="yellow"
        />
        <StatCard
          label="Weak Topics"
          value={stats?.weakTopics?.length || 0}
          icon={<AlertTriangle size={22} />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: "/resume", label: "Upload Resume", desc: "ATS analysis" },
              { to: "/interview-rounds", label: "3-Round Interview", desc: "Coding + MCQ + HR" },
              { to: "/interview", label: "Mock Interview", desc: "Practice now" },
              { to: "/questions", label: "AI Questions", desc: "By difficulty" },
              { to: "/learning", label: "Learn Topics", desc: "One-shot videos" },
              { to: "/roadmap", label: "AI Roadmap", desc: "Study plan" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors border border-gray-700"
              >
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Strong Topics">
          {stats?.strongTopics?.length ? (
            <div className="flex flex-wrap gap-2">
              {stats.strongTopics.map((t) => (
                <Badge key={t} variant="success">
                  {t}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Complete interviews to see strong topics.</p>
          )}
        </Card>
      </div>

      <Card title="Weak Topics Analysis" className="mb-6">
        {stats?.weakTopics?.length ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-400" />
                <span className="text-sm text-gray-400">
                  {stats.weakTopics.length} areas to improve
                </span>
              </div>
              <Link to="/learning" className="text-blue-400 text-sm hover:underline ml-auto">
                View learning resources →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.weakTopics.map((topic, index) => {
                const subject = getTopicSubject(topic);
                return (
                  <div key={topic} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-red-400">#{index + 1}</span>
                      <Badge variant="danger">{topic}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">Subject:</span>
                      <Badge variant="default">{subject}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Focus area requiring improvement based on interview performance
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            Complete interviews to identify your weak topics.
          </p>
        )}
      </Card>

      <Card title="Recent Interviews">
        {stats?.recentInterviews?.length ? (
          <div className="space-y-3">
            {stats.recentInterviews.map((i) => (
              <div
                key={i._id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="text-sm">
                    {new Date(i.createdAt).toLocaleDateString()} — {i.questions?.length || 0}{" "}
                    questions
                  </p>
                  <p className="text-xs text-gray-500">{i.verdictSummary?.slice(0, 80)}...</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{i.overallScore}/100</p>
                  <Badge variant={i.selection === "Yes" ? "success" : "danger"}>
                    {i.selection}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No interviews yet.{" "}
            <Link to="/interview" className="text-blue-400 hover:underline">
              Start your first mock interview
            </Link>
          </p>
        )}
      </Card>
    </div>
  );
}
