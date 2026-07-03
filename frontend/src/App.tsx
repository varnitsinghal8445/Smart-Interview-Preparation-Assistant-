import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./components/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ResumePage from "./pages/ResumePage";
import QuestionsPage from "./pages/QuestionsPage";
import InterviewPage from "./pages/InterviewPage";
import InterviewRoundsPage from "./pages/InterviewRoundsPage";
import ResultsPage from "./pages/ResultsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import LearningPage from "./pages/LearningPage";
import RoadmapPage from "./pages/RoadmapPage";
import CareerPage from "./pages/CareerPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        Loading...
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="resume" element={<ResumePage />} />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="interview" element={<InterviewPage />} />
        <Route path="interview-rounds" element={<InterviewRoundsPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="learning" element={<LearningPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="career" element={<CareerPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
