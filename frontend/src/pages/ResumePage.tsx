import { useEffect, useState } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { resumeAPI } from "../lib/api";
import type { Resume } from "../types";
import { Card, LoadingSpinner, Alert, Badge } from "../components/ui";

export default function ResumePage() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    resumeAPI
      .getMine()
      .then((res) => setResume(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const res = await resumeAPI.upload(file);
      setResume(res.data);
      setSuccess("Resume analyzed successfully!");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Resume Upload & Analysis</h1>
        <p className="text-gray-400 text-sm mt-1">
          Upload PDF/DOCX resume for ATS scoring and AI extraction
        </p>
      </div>

      {error && <Alert message={error} />}
      {success && <Alert message={success} type="success" />}

      <Card title="Upload Resume">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl p-10 cursor-pointer hover:border-blue-500 transition-colors">
          <Upload className="text-gray-500 mb-3" size={36} />
          <p className="text-sm font-medium">Click to upload PDF or DOCX</p>
          <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {uploading && <LoadingSpinner text="AI is analyzing your resume..." />}
      </Card>

      {resume && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <Card className="text-center">
              <p className="text-sm text-gray-400 mb-2">ATS Resume Score</p>
              <div className="text-5xl font-bold text-blue-400">{resume.atsScore}</div>
              <p className="text-sm text-gray-500">out of 100</p>
              <div className="mt-3">
                <Badge variant={resume.atsAnalysis?.atsFriendly ? "success" : "warning"}>
                  {resume.atsAnalysis?.atsFriendly ? "ATS Friendly" : "Needs Improvement"}
                </Badge>
              </div>
            </Card>

            <Card title="Extracted Skills" className="lg:col-span-2">
              <div className="flex flex-wrap gap-2">
                {resume.extracted?.skills?.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <Card title="Profile Info">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-400">Name:</span> {resume.extracted?.name}
                </p>
                <p>
                  <span className="text-gray-400">Email:</span> {resume.extracted?.email}
                </p>
              </div>
              <h3 className="text-sm font-medium mt-4 mb-2 text-gray-400">Education</h3>
              {resume.extracted?.education?.map((e, i) => (
                <p key={i} className="text-sm">
                  {e.degree} — {e.institution} ({e.year})
                </p>
              ))}
              <h3 className="text-sm font-medium mt-4 mb-2 text-gray-400">Projects</h3>
              {resume.extracted?.projects?.map((p, i) => (
                <p key={i} className="text-sm">
                  <strong>{p.title}:</strong> {p.description}
                </p>
              ))}
            </Card>

            <Card title="ATS Suggestions">
              <ul className="space-y-2">
                {resume.atsAnalysis?.suggestions?.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
              {resume.atsAnalysis?.missingKeywords?.length > 0 && (
                <>
                  <h3 className="text-sm font-medium mt-4 mb-2 text-gray-400">Missing Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {resume.atsAnalysis.missingKeywords.map((k) => (
                      <Badge key={k} variant="warning">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>

          <Card title="Strengths" className="mt-4">
            <ul className="space-y-2">
              {resume.atsAnalysis?.strengths?.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
