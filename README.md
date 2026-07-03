# 🎯 Smart Interview Preparation Assistant

An AI-powered web app that helps job seekers prepare for interviews — upload your resume, get an ATS analysis, practice with AI-generated interview questions (text, voice, or coding rounds), receive instant AI feedback on your answers, and follow a personalized learning roadmap to close your skill gaps.

![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/mongodb-8-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 📖 Overview

Smart Interview Preparation Assistant analyzes a candidate's resume with AI, then builds a tailored interview-prep experience around it — from ATS scoring and resume-based question generation to full mock interviews (simple Q&A or coding rounds) with detailed, per-answer AI evaluation and a personalized learning roadmap.

---

## ✨ Features

- **Resume Upload & Parsing** — Upload a PDF, DOCX, or TXT resume; the backend extracts skills, projects, education, and experience automatically.
- **ATS Resume Analysis** — Get an ATS-friendliness score with strengths, suggestions, and missing keywords.
- **AI-Generated Interview Questions** — Questions generated directly from your resume content and skills.
- **Mock Interviews** — Text or voice mode, with **simple Q&A** or **coding round** interview types.
- **MCQ Practice** — Auto-generated multiple-choice questions to test core concepts.
- **Per-Answer AI Evaluation** — Each answer is scored on confidence, communication, technical accuracy, grammar, and completeness, with mistakes and a suggested ideal answer.
- **Full Interview Evaluation** — End-to-end scoring and feedback across an entire interview session.
- **Career Recommendations** — AI-suggested career paths based on resume content.
- **Personalized Learning Roadmap** — Roadmap generated from your current score and weak topics, linked to a curated topic library (OS, DBMS, CS fundamentals, etc.) with video resources.
- **Dashboard & Analytics** — Track interview history, scores, and progress over time.
- **Downloadable Reports** — Generate a PDF report of interview results.
- **Auth** — Email/password login plus Google Sign-In.

---

## 🛠️ Tech Stack

| Layer          | Technology                                                        |
|----------------|---------------------------------------------------------------------|
| Frontend       | React 19 + TypeScript, Vite, Tailwind CSS, React Router, Recharts   |
| Backend        | Node.js, Express 4                                                  |
| Database       | MongoDB + Mongoose                                                  |
| Auth           | JWT, Google OAuth (`google-auth-library`)                          |
| AI             | OpenAI API, Google Generative AI (Gemini)                          |
| File Handling  | Multer (uploads), `mammoth` (DOCX), `pdf-parse` (PDF), `pdfkit` (report generation), Cloudinary |

---

## 📂 Project Structure

```
Smart Interview Preparation Assistant/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── interviewController.js
│   │   │   ├── learningController.js
│   │   │   └── resumeController.js
│   │   ├── data/learningTopics.js
│   │   ├── middleware/auth.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Resume.js
│   │   │   └── Interview.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── resumeRoutes.js
│   │   │   ├── interviewRoutes.js
│   │   │   └── learningRoutes.js
│   │   ├── services/aiService.js
│   │   ├── utils/
│   │   │   ├── pdfReport.js
│   │   │   └── resumeParser.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/AuthContext.tsx
│   │   ├── lib/api.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ResumePage.tsx
│   │   │   ├── QuestionsPage.tsx
│   │   │   ├── InterviewRoundsPage.tsx
│   │   │   ├── InterviewPage.tsx
│   │   │   ├── ResultsPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── CareerPage.tsx
│   │   │   └── RoadmapPage.tsx
│   │   ├── types/index.ts
│   │   └── App.tsx
│   ├── index.html
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local instance or MongoDB Atlas)
- An OpenAI API key and/or Google Generative AI (Gemini) API key
- (Optional) Google OAuth Client ID for Google Sign-In
- (Optional) Cloudinary account for file storage

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "Smart Interview Preparation Assistant"
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/smart-interview-assistant
JWT_SECRET=your-super-secret-jwt-key-change-this
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

Run the backend:

```bash
npm run dev     # auto-restarts on changes
# or
npm start
```

The API runs at `http://localhost:5001` (health check: `GET /api/health`).

### 3. Set up the frontend

```bash
cd ../frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### 4. Build for production

```bash
cd frontend
npm run build    # outputs to frontend/dist
```

---

## 🔌 API Overview

| Method | Endpoint                          | Description                          |
|--------|------------------------------------|---------------------------------------|
| POST   | `/api/auth/register`              | Register a new user                   |
| POST   | `/api/auth/login`                 | Login with email/password             |
| POST   | `/api/auth/google`                | Login with Google                     |
| GET    | `/api/auth/me`                    | Get current authenticated user        |
| POST   | `/api/resume/upload`              | Upload & parse a resume               |
| GET    | `/api/resume/me`                  | Get the user's parsed resume          |
| GET    | `/api/resume/questions`           | Get resume-based interview questions  |
| GET    | `/api/resume/career`              | Get AI career recommendations         |
| GET    | `/api/interview/dashboard`        | Get dashboard stats                   |
| GET    | `/api/interview/roadmap`          | Get personalized learning roadmap     |
| POST   | `/api/interview/start`            | Start a new mock interview            |
| POST   | `/api/interview/answer`           | Submit an answer for AI evaluation    |
| POST   | `/api/interview/:id/complete`     | Complete an interview & get full eval |
| GET    | `/api/interview/:id/report`       | Download a PDF report                 |
| GET    | `/api/interview/:id`              | Get a specific interview              |
| GET    | `/api/interview/rounds/status`    | Get interview round progress          |
| POST   | `/api/interview/rounds/update`    | Update interview round status         |
| GET    | `/api/learning`                   | Get all learning topics               |
| GET    | `/api/learning/:subject`          | Get topics for a specific subject     |

All routes above (except register/login/health) require a `Bearer` JWT in the `Authorization` header.

---

## 🗺️ Roadmap Ideas

- [ ] Real-time voice transcription during voice-mode interviews
- [ ] Multi-language question generation
- [ ] Company-specific question banks
- [ ] Peer/mentor review of recorded answers

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

Licensed under the MIT License.

---

<p align="center">Built to help candidates walk into interviews prepared and confident. 🚀</p>
