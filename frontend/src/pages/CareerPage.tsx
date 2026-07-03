import { useEffect, useState } from "react";
import { Briefcase, AlertTriangle } from "lucide-react";
import { resumeAPI } from "../lib/api";
import type { CareerRecommendation } from "../types";
import { Card, LoadingSpinner, Alert, Badge } from "../components/ui";

export default function CareerPage() {
  const [career, setCareer] = useState<CareerRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    resumeAPI
      .getCareer()
      .then((res) => setCareer(res.data))
      .catch((err) => setError(err.response?.data?.error || "Upload resume first"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="AI is analyzing your career fit..." />;
  if (error) return <Alert message={error} type="info" />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Career Recommendation</h1>
        <p className="text-gray-400 text-sm mt-1">Roles and skills based on your resume</p>
      </div>

      <Card title="Recommended Roles" className="mb-4">
        <div className="space-y-3">
          {career?.recommendedRoles?.map((role) => (
            <div key={role} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <Briefcase className="text-blue-400" size={20} />
              <span className="font-medium">{role}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Skills to Learn" className="mb-4">
        <div className="flex flex-wrap gap-2">
          {career?.missingSkills?.map((skill) => (
            <Badge key={skill} variant="warning">
              <AlertTriangle size={12} className="inline mr-1" />
              {skill}
            </Badge>
          ))}
        </div>
      </Card>

      <Card title="AI Analysis">
        <p className="text-sm text-gray-300">{career?.reasoning}</p>
      </Card>
    </div>
  );
}
