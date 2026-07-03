import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  googleLogin: (credential: string) => api.post("/auth/google", { credential }),
  getMe: () => api.get("/auth/me"),
};

export const resumeAPI = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("resume", file);
    return api.post("/resume/upload", form);
  },
  getMine: () => api.get("/resume/me"),
  getQuestions: () => api.get("/resume/questions"),
  getCareer: () => api.get("/resume/career"),
};

export const interviewAPI = {
  start: (mode = "text", interviewType = "simple") => api.post("/interview/start", { mode, interviewType }),
  submitAnswer: (interviewId: string, questionId: number, answer: string) =>
    api.post("/interview/answer", { interviewId, questionId, answer }),
  complete: (id: string) => api.post(`/interview/${id}/complete`),
  getOne: (id: string) => api.get(`/interview/${id}`),
  getAll: () => api.get("/interview"),
  getDashboard: () => api.get("/interview/dashboard"),
  getRoadmap: () => api.get("/interview/roadmap"),
  downloadReport: (id: string) =>
    api.get(`/interview/${id}/report`, { responseType: "blob" }),
  getRoundsStatus: () => api.get("/interview/rounds/status"),
  updateRoundStatus: (interviewId: string, roundType: string, status: string, score?: number) =>
    api.post("/interview/rounds/update", { interviewId, roundType, status, score }),
};

export const learningAPI = {
  getAll: () => api.get("/learning"),
  getSubject: (subject: string) => api.get(`/learning/${encodeURIComponent(subject)}`),
};
