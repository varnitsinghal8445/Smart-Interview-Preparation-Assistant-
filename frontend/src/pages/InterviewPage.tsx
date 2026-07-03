import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mic, Type, X, AlertTriangle } from "lucide-react";
import { interviewAPI } from "../lib/api";
import type { Interview, Question, AnswerEvaluation } from "../types";
import { Card, Button, Alert, Badge } from "../components/ui";
import CodeEditor from "../components/CodeEditor";
import MCQQuestion from "../components/MCQQuestion";

export default function InterviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roundParam = searchParams.get("round");
  const interviewIdParam = searchParams.get("interviewId");
  
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluations, setEvaluations] = useState<AnswerEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [interviewType, setInterviewType] = useState<"simple" | "coding">("simple");
  const [listening, setListening] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const warningShown = useRef(false);
  const securityEnabled = useRef(false);
  const recognitionRef = useRef<any>(null);
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [currentRoundType, setCurrentRoundType] = useState<"coding" | "mcq" | "hr" | null>(null);

  useEffect(() => {
    if (roundParam && interviewIdParam) {
      // Load existing interview and start from specific round
      loadInterviewForRound(interviewIdParam, roundParam as "coding" | "mcq" | "hr");
    }
  }, [roundParam, interviewIdParam]);

  const loadInterviewForRound = async (interviewId: string, roundType: "coding" | "mcq" | "hr") => {
    setLoading(true);
    try {
      const res = await interviewAPI.getOne(interviewId);
      setInterview(res.data);
      setCurrentRoundType(roundType);
      
      // Update round status to in_progress
      await interviewAPI.updateRoundStatus(interviewId, roundType, "in_progress");
      
      // Find starting index based on round type
      const startIndex = res.data.questions.findIndex((q: any) => q.round === getRoundNumber(roundType));
      
      setCurrentIndex(startIndex >= 0 ? startIndex : 0);
      setEvaluations([]);
      setAnswer("");
      securityEnabled.current = true;
    } catch (error) {
      setError("Failed to load interview");
    } finally {
      setLoading(false);
    }
  };

  const getRoundNumber = (roundType: "coding" | "mcq" | "hr"): number => {
    switch (roundType) {
      case "coding": return 1;
      case "mcq": return 2;
      case "hr": return 3;
    }
  };

  const startInterview = async () => {
    setLoading(true);
    setError("");
    setShowWarning(false);
    warningShown.current = false;
    try {
      const res = await interviewAPI.start(mode, interviewType);
      console.log("📋 Interview started with questions:", res.data.questions);
      console.log("📊 Question types:", res.data.questions.map((q: any) => ({ id: q.id, type: q.type, hasOptions: !!q.options })));
      
      // Find the starting index based on selected round
      let startIndex = 0;
      if (interviewType === "coding") {
        const round1Questions = res.data.questions.filter((q: any) => q.round === 1);
        const round2Questions = res.data.questions.filter((q: any) => q.round === 2);
        
        if (selectedRound === 2) {
          startIndex = round1Questions.length;
        } else if (selectedRound === 3) {
          startIndex = round1Questions.length + round2Questions.length;
        }
      }
      
      console.log(`🎯 Starting from Round ${selectedRound} at index ${startIndex}`);
      setInterview(res.data);
      setCurrentIndex(startIndex);
      setEvaluations([]);
      setAnswer("");
      securityEnabled.current = true;
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Failed to start interview"
      );
    } finally {
      setLoading(false);
    }
  };

  const exitInterview = async () => {
    securityEnabled.current = false;
    setShowExitDialog(false);
    
    // Update round status if we're in a specific round
    if (currentRoundType && interview) {
      try {
        await interviewAPI.updateRoundStatus(interview._id, currentRoundType, "in_progress");
      } catch (err) {
        console.error("Failed to update round status:", err);
      }
    }
    
    if (interview) {
      try {
        await interviewAPI.complete(interview._id);
      } catch (err) {
        console.error("Failed to complete interview:", err);
      }
    }
    
    setInterview(null);
    setCurrentIndex(0);
    setEvaluations([]);
    setAnswer("");
    setShowWarning(false);
    warningShown.current = false;
    
    // Navigate back to rounds page if we came from there
    if (roundParam) {
      navigate("/interview-rounds");
    } else {
      navigate("/dashboard");
    }
  };

  const handleExitClick = () => {
    setShowExitDialog(true);
  };

  const handleFocusLoss = () => {
    if (securityEnabled.current && !warningShown.current && interview) {
      warningShown.current = true;
      setShowWarning(true);
    }
  };

  const handleCopyPaste = (e: ClipboardEvent) => {
    if (securityEnabled.current) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (securityEnabled.current) {
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "v" || e.key === "x")) {
        e.preventDefault();
      }
    }
  };

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (securityEnabled.current && interview) {
      e.preventDefault();
      e.returnValue = "";
      return "";
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (securityEnabled.current && document.hidden) {
        handleFocusLoss();
      }
    };

    const handleBlur = () => {
      if (securityEnabled.current) {
        handleFocusLoss();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      console.log("🧹 Cleaning up event listeners and recognition");
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      // Stop recognition if active
      if (recognitionRef.current) {
        console.log("🛑 Stopping recognition on cleanup");
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log("Recognition already stopped during cleanup");
        }
        recognitionRef.current = null;
      }
    };
  }, [interview]);

  const startVoiceInput = async () => {
    console.log("🎤 Starting voice input...");
    
    // Check if browser supports Speech Recognition
    const SpeechRecognitionAPI = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    console.log("🔍 Checking Speech Recognition API support...");
    if (!SpeechRecognitionAPI) {
      console.error("❌ Speech Recognition API not supported");
      setError("Voice input is not supported in this browser. Please use Chrome or Edge, or switch to text mode.");
      return;
    }
    console.log("✅ Speech Recognition API supported");

    // Stop any existing recognition
    if (recognitionRef.current) {
      console.log("🛑 Stopping existing recognition instance");
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Recognition already stopped");
      }
    }

    // Request microphone access first
    console.log("🎙️ Requesting microphone access...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("✅ Microphone access granted, stream received:", stream);
      
      // Stop the stream immediately since we only needed permission check
      stream.getTracks().forEach(track => track.stop());
      console.log("🛑 Permission check stream stopped");
    } catch (err: any) {
      console.error("❌ Microphone access denied:", err);
      const errorMessage = err.name === 'NotAllowedError' 
        ? "Microphone permission denied. Please allow microphone access in your browser settings."
        : err.name === 'NotFoundError'
        ? "No microphone found. Please check your audio devices."
        : `Microphone error: ${err.message}`;
      setError(errorMessage);
      return;
    }

    try {
      console.log("🎯 Creating Speech Recognition instance...");
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      console.log("⚙️ Recognition config:", {
        lang: recognition.lang,
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        maxAlternatives: recognition.maxAlternatives
      });

      recognition.onstart = () => {
        console.log("✅ Speech Recognition started");
        setListening(true);
        setError("");
      };

      recognition.onend = () => {
        console.log("🏁 Speech Recognition ended");
        setListening(false);
        recognitionRef.current = null;
      };

      recognition.onresult = (event: any) => {
        console.log("📝 Speech recognition result received");
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        console.log("🗣️ Transcript:", transcript, "Confidence:", confidence);
        
        if (confidence > 0.5) {
          console.log("✅ Confidence acceptable, updating answer");
          setAnswer((prev) => {
            const newAnswer = prev ? `${prev} ${transcript}` : transcript;
            console.log("📝 Updated answer:", newAnswer);
            return newAnswer;
          });
        } else {
          console.warn("⚠️ Confidence too low:", confidence);
          setError("Voice recognition confidence low. Please try again or use text mode.");
        }
      };

      recognition.onerror = (event: any) => {
        console.error("❌ Speech Recognition error:", event.error);
        setListening(false);
        recognitionRef.current = null;
        
        const errorMessage = event.error === 'not-allowed' 
          ? "Microphone access denied. Please allow microphone permission and try again."
          : event.error === 'no-speech'
          ? "No speech detected. Please speak clearly and try again."
          : event.error === 'audio-capture'
          ? "No microphone found. Please check your audio devices."
          : event.error === 'network'
          ? "Network error. Please check your internet connection."
          : `Voice recognition failed: ${event.error}. Please use text mode.`;
        setError(errorMessage);
      };

      console.log("▶️ Starting recognition...");
      recognition.start();
    } catch (err: any) {
      console.error("❌ Failed to initialize voice recognition:", err);
      setListening(false);
      recognitionRef.current = null;
      setError(`Failed to initialize voice recognition: ${err.message}. Please use text mode.`);
    }
  };

  const submitAnswer = async () => {
    console.log("📤 Submitting answer...");
    if (!interview || !answer.trim()) {
      console.warn("⚠️ Cannot submit: interview not active or answer empty");
      return;
    }
    const question = interview.questions[currentIndex];
    console.log("📝 Question:", question.question);
    console.log("💬 Answer:", answer);
    setLoading(true);
    setError("");
    try {
      console.log("🌐 Sending answer to backend...");
      const res = await interviewAPI.submitAnswer(interview._id, question.id, answer);
      console.log("✅ Answer submitted successfully:", res.data);
      setEvaluations((prev) => [...prev, res.data.answer]);

      // Check if we're completing a round
      const nextQuestion = interview.questions[currentIndex + 1];
      const currentRound = question.round;
      const nextRound = nextQuestion?.round;
      
      if (nextRound !== currentRound && currentRoundType) {
        // Round completed
        const roundScore = evaluations.reduce((sum, evaluation) => sum + (evaluation.score || 0), 0);
        await interviewAPI.updateRoundStatus(interview._id, currentRoundType, "completed", roundScore);
        
        // Navigate back to rounds page
        navigate("/interview-rounds");
        return;
      }

      if (currentIndex < interview.questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setAnswer("");
      } else {
        // All questions completed
        if (currentRoundType) {
          await interviewAPI.updateRoundStatus(interview._id, currentRoundType, "completed");
          navigate("/interview-rounds");
        } else {
          setLoading(true);
          const completeRes = await interviewAPI.complete(interview._id);
          navigate(`/results/${completeRes.data._id}`);
        }
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Failed to submit answer"
      );
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion: Question | undefined = interview?.questions[currentIndex];
  const lastEval = evaluations[evaluations.length - 1];
  const progress = interview
    ? Math.round((currentIndex / interview.questions.length) * 100)
    : 0;

  const currentRound = currentQuestion?.round || 1;
  const questionType = currentQuestion?.type || "interview";

  const handleCodingSubmit = async (code: string, language: string) => {
    if (!interview || !currentQuestion) return;
    setLoading(true);
    setError("");
    try {
      const res = await interviewAPI.submitAnswer(
        interview._id,
        currentQuestion.id,
        `Code (${language}):\n${code}`
      );
      setEvaluations((prev) => [...prev, res.data.answer]);
      if (currentIndex < interview.questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setLoading(true);
        const completeRes = await interviewAPI.complete(interview._id);
        navigate(`/results/${completeRes.data._id}`);
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Failed to submit answer"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMCQSubmit = async (selectedOption: number) => {
    if (!interview || !currentQuestion) return;
    setLoading(true);
    setError("");
    try {
      const answer = `Selected option: ${String.fromCharCode(65 + selectedOption)}`;
      const res = await interviewAPI.submitAnswer(interview._id, currentQuestion.id, answer);
      setEvaluations((prev) => [...prev, res.data.answer]);
      if (currentIndex < interview.questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setLoading(true);
        const completeRes = await interviewAPI.complete(interview._id);
        navigate(`/results/${completeRes.data._id}`);
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Failed to submit answer"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Mock Interview</h1>
        <p className="text-gray-400 text-sm mt-1">
          Text or voice-based interview with real-time AI evaluation
        </p>
      </div>

      {error && <Alert message={error} />}

      {!interview ? (
        <Card title="Choose Interview Mode">
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3">Interview Type</p>
            <div className="flex gap-4">
              <button
                onClick={() => setInterviewType("simple")}
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  interviewType === "simple"
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-gray-700 text-gray-400"
                }`}
              >
                Simple Interview (10 Questions)
              </button>
              <button
                onClick={() => setInterviewType("coding")}
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  interviewType === "coding"
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-gray-700 text-gray-400"
                }`}
              >
                3-Round Coding Interview
              </button>
            </div>
            {interviewType === "coding" && (
              <>
                <p className="text-xs text-gray-500 mt-2">
                  Round 1: 2 Coding Questions | Round 2: 10 MCQ Aptitude | Round 3: 3 Interview Questions
                </p>
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-3">Select Starting Round</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setSelectedRound(1)}
                      className={`px-4 py-3 rounded-lg border ${
                        selectedRound === 1
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-gray-700 text-gray-400"
                      }`}
                    >
                      <div className="font-medium">Round 1</div>
                      <div className="text-xs mt-1">Coding</div>
                    </button>
                    <button
                      onClick={() => setSelectedRound(2)}
                      className={`px-4 py-3 rounded-lg border ${
                        selectedRound === 2
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-gray-700 text-gray-400"
                      }`}
                    >
                      <div className="font-medium">Round 2</div>
                      <div className="text-xs mt-1">MCQ</div>
                    </button>
                    <button
                      onClick={() => setSelectedRound(3)}
                      className={`px-4 py-3 rounded-lg border ${
                        selectedRound === 3
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-gray-700 text-gray-400"
                      }`}
                    >
                      <div className="font-medium">Round 3</div>
                      <div className="text-xs mt-1">HR Questions</div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3">Input Mode</p>
            <div className="flex gap-4">
              <button
                onClick={() => setMode("text")}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                  mode === "text"
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-gray-700 text-gray-400"
                }`}
              >
                <Type size={18} /> Text Based
              </button>
              <button
                onClick={() => setMode("voice")}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                  mode === "voice"
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-gray-700 text-gray-400"
                }`}
              >
                <Mic size={18} /> Voice Based
              </button>
            </div>
          </div>
          <Button onClick={startInterview} disabled={loading}>
            {loading ? "Starting..." : "Start Mock Interview"}
          </Button>
        </Card>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>
                Round {currentRound} - Question {currentIndex + 1} of {interview.questions.length}
              </span>
              <div className="flex items-center gap-4">
                <span>{progress}%</span>
                <button
                  onClick={handleExitClick}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm"
                >
                  <X size={14} /> Exit Interview
                </button>
              </div>
            </div>
            <div className="h-2 bg-gray-800 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {currentQuestion && (
            <>
              {questionType === "coding" && currentQuestion.testCases && currentQuestion.languages ? (
                <Card>
                  <CodeEditor
                    question={currentQuestion.question}
                    description={currentQuestion.description || ""}
                    testCases={currentQuestion.testCases}
                    languages={currentQuestion.languages}
                    onSubmit={handleCodingSubmit}
                    loading={loading}
                  />
                </Card>
              ) : questionType === "mcq" && currentQuestion.options ? (
                <Card>
                  <MCQQuestion
                    question={currentQuestion.question}
                    options={currentQuestion.options}
                    onSubmit={handleMCQSubmit}
                    loading={loading}
                  />
                </Card>
              ) : (
                <Card>
                  <div className="flex gap-2 mb-3">
                    <Badge>{currentQuestion.category}</Badge>
                    <Badge
                      variant={
                        currentQuestion.difficulty === "Hard"
                          ? "danger"
                          : currentQuestion.difficulty === "Medium"
                            ? "warning"
                            : "success"
                      }
                    >
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                  <p className="text-lg font-medium mb-4">{currentQuestion.question}</p>

                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={5}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                  />

                  {mode === "voice" && (
                    <Button
                      onClick={startVoiceInput}
                      variant="secondary"
                      className="mt-2"
                      disabled={listening}
                    >
                      <Mic size={16} className="inline mr-1" />
                      {listening ? "Listening..." : "Speak Answer"}
                    </Button>
                  )}

                  <div className="flex gap-3 mt-4">
                    {currentIndex > 0 && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCurrentIndex((i) => i - 1);
                          setAnswer("");
                        }}
                      >
                        Previous
                      </Button>
                    )}
                    <Button onClick={submitAnswer} disabled={loading || !answer.trim()}>
                      {loading
                        ? "Evaluating..."
                        : currentIndex < interview.questions.length - 1
                          ? "Submit & Next"
                          : "Finish Interview"}
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}

          {lastEval && (
            <Card title="Latest Answer Evaluation" className="mt-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl font-bold text-blue-400">
                  {lastEval.score}/{lastEval.maxScore}
                </span>
                <span className="text-sm text-gray-400">Score</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">{lastEval.feedback}</p>
              {lastEval.mistakes?.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Mistakes:</p>
                  <ul className="text-sm text-red-300 space-y-1">
                    {lastEval.mistakes.map((m, i) => (
                      <li key={i}>• {m}</li>
                    ))}
                  </ul>
                </div>
              )}
              {lastEval.suggestedAnswer && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs text-green-400 mb-1">Suggested Answer:</p>
                  <p className="text-sm">{lastEval.suggestedAnswer}</p>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-lg mb-2">Warning!</h3>
                <p className="text-gray-300 text-sm">
                  You have attempted to leave the interview window. Please stay on the interview screen. If you intentionally want to end the interview, click the Exit Interview button.
                </p>
              </div>
            </div>
            <Button onClick={() => setShowWarning(false)} className="w-full">
              I Understand
            </Button>
          </Card>
        </div>
      )}

      {showExitDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Exit Interview</h3>
              <p className="text-gray-300 text-sm">
                Are you sure you want to exit the interview? Your interview session will end.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowExitDialog(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={exitInterview} className="flex-1">
                Exit
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
