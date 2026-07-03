import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { interviewAPI } from "../lib/api";
import type { DashboardStats } from "../types";
import { Card, LoadingSpinner, Alert, Badge } from "../components/ui";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    interviewAPI
      .getDashboard()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert message={error} type="info" />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Performance Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">
          Track your interview scores, trends, and topic performance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card title="Score Trend">
          {stats?.scoreTrend?.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "#1f2937", border: "1px solid #374151" }}
                />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm py-8 text-center">No interview data yet.</p>
          )}
        </Card>

        <Card title="Topic Performance">
          {stats?.topicPerformance?.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.topicPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="topic" stroke="#9ca3af" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "#1f2937", border: "1px solid #374151" }}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm py-8 text-center">No topic data yet.</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Weak Topics">
          {stats?.weakTopics?.length ? (
            <div className="flex flex-wrap gap-2">
              {stats.weakTopics.map((t) => (
                <Badge key={t} variant="danger">
                  {t}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No weak topics identified yet.</p>
          )}
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
            <p className="text-gray-500 text-sm">No strong topics identified yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
