 import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiClient = () => {
  const key = process.env.GOOGLE_GEMINI_API_KEY;
  if (!key || key === "your_google_gemini_api_key_here") {
    throw new Error("Google Gemini API key is not configured. Add GOOGLE_GEMINI_API_KEY to backend/.env");
  }
  return new GoogleGenerativeAI(key);
};

const extractJSON = (text) => {
  const cleaned = text.trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("AI returned invalid JSON");
  }
};

const chat = async (system, user, temperature = 0.6) => {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });
    
    const prompt = `${system}\n\n${user}`;
    const result = await model.generateContent(prompt);
    return result.response.text() || "";
  } catch (error) {
    if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('billing') || error.message?.includes('API_KEY_INVALID')) {
      console.warn('Gemini API quota exceeded or invalid key, using fallback mode');
      throw new Error('API_QUOTA_EXCEEDED');
    }
    throw error;
  }
};

export const analyzeResume = async (resumeText) => {
  const system =
    "You are an expert ATS resume analyzer and career coach. Analyze resumes and return ONLY valid JSON.";
  const user = `Analyze this resume and provide ATS score and suggestions.

Resume:
${resumeText.slice(0, 8000)}

Return JSON:
{
  "extracted": {
    "name": "",
    "email": "",
    "phone": "",
    "skills": [],
    "projects": [{"title": "", "description": ""}],
    "education": [{"degree": "", "institution": "", "year": ""}],
    "experience": [{"role": "", "company": "", "duration": "", "description": ""}]
  },
  "atsScore": 0,
  "atsAnalysis": {
    "strengths": [],
    "suggestions": [],
    "missingKeywords": [],
    "atsFriendly": true
  }
}

Rules: atsScore 0-100. Provide at least 4 suggestions.`;
  
  try {
    return extractJSON(await chat(system, user, 0.4));
  } catch (error) {
    if (error.message === 'API_QUOTA_EXCEEDED') {
      // Fallback mock response when API quota is exceeded
      return {
        extracted: {
          name: "User",
          email: "user@example.com",
          phone: "",
          skills: ["JavaScript", "React", "Node.js", "Python"],
          projects: [{ title: "Sample Project", description: "A sample project description" }],
          education: [{ degree: "Bachelor's Degree", institution: "University", year: "2024" }],
          experience: [{ role: "Developer", company: "Tech Company", duration: "1 year", description: "Worked on web development" }]
        },
        atsScore: 75,
        atsAnalysis: {
          strengths: ["Good technical skills listed", "Clear education section"],
          suggestions: ["Add more project details", "Include measurable achievements", "Add GitHub links", "Improve formatting"],
          missingKeywords: ["TypeScript", "Docker", "AWS"],
          atsFriendly: true
        }
      };
    }
    throw error;
  }
};

export const generateQuestions = async (resumeText, skills = []) => {
  const system =
    "You are a technical interviewer. Generate interview questions based on resume skills. Return ONLY valid JSON.";
  const user = `Resume skills: ${skills.join(", ") || "General tech"}

Resume excerpt:
${resumeText.slice(0, 4000)}

Return JSON:
{
  "questions": {
    "easy": [{"question": "", "category": "", "topic": ""}],
    "medium": [{"question": "", "category": "", "topic": ""}],
    "hard": [{"question": "", "category": "", "topic": ""}]
  }
}

Provide 4 easy, 4 medium, 3 hard questions.`;
  
  try {
    return extractJSON(await chat(system, user));
  } catch (error) {
    if (error.message === 'API_QUOTA_EXCEEDED') {
      // Fallback mock questions when API quota is exceeded
      return {
        questions: {
          easy: [
            { question: "What is JavaScript?", category: "JavaScript", topic: "Basics" },
            { question: "Explain the difference between let and const", category: "JavaScript", topic: "ES6" },
            { question: "What is React?", category: "React", topic: "Basics" },
            { question: "What is a component in React?", category: "React", topic: "Components" }
          ],
          medium: [
            { question: "Explain React lifecycle methods", category: "React", topic: "Lifecycle" },
            { question: "What is the Virtual DOM?", category: "React", topic: "Performance" },
            { question: "Explain async/await in JavaScript", category: "JavaScript", topic: "Async" },
            { question: "What is REST API?", category: "Backend", topic: "API" }
          ],
          hard: [
            { question: "How would you optimize React performance?", category: "React", topic: "Optimization" },
            { question: "Explain event loop in JavaScript", category: "JavaScript", topic: "Advanced" },
            { question: "What is database indexing?", category: "Database", topic: "Performance" }
          ]
        }
      };
    }
    throw error;
  }
};



// LeetCode problem list for coding questions
const LEETCODE_PROBLEMS = [
  { title: "Two Sum", difficulty: "Easy", url: "https://leetcode.com/problems/two-sum/" },
  { title: "Add Two Numbers", difficulty: "Medium", url: "https://leetcode.com/problems/add-two-numbers/" },
  { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
  { title: "Median of Two Sorted Arrays", difficulty: "Hard", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },
  { title: "Longest Palindromic Substring", difficulty: "Medium", url: "https://leetcode.com/problems/longest-palindromic-substring/" },
  { title: "Container With Most Water", difficulty: "Medium", url: "https://leetcode.com/problems/container-with-most-water/" },
  { title: "3Sum", difficulty: "Medium", url: "https://leetcode.com/problems/3sum/" },
  { title: "Binary Search", difficulty: "Easy", url: "https://leetcode.com/problems/binary-search/" },
  { title: "Valid Parentheses", difficulty: "Easy", url: "https://leetcode.com/problems/valid-parentheses/" },
  { title: "Merge Two Sorted Lists", difficulty: "Easy", url: "https://leetcode.com/problems/merge-two-sorted-lists/" },
  { title: "Reverse Linked List", difficulty: "Easy", url: "https://leetcode.com/problems/reverse-linked-list/" },
  { title: "Climbing Stairs", difficulty: "Easy", url: "https://leetcode.com/problems/climbing-stairs/" },
  { title: "Best Time to Buy and Sell Stock", difficulty: "Easy", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
  { title: "Maximum Subarray", difficulty: "Medium", url: "https://leetcode.com/problems/maximum-subarray/" },
  { title: "Search in Rotated Sorted Array", difficulty: "Medium", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
];

// Shuffle array for randomization
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateMockInterviewQuestions = async (resumeText, interviewType = "simple") => {
  const shuffledLeetCode = shuffleArray(LEETCODE_PROBLEMS);
  
  if (interviewType === "coding") {
    // 3-round structure for coding interview
    // Round 1: 2 coding questions with test cases
    // Round 2: 10 MCQ aptitude questions with 4 options
    // Round 3: 3 interview questions (speaking/text)
    
    const round1Coding = shuffledLeetCode.slice(0, 2).map((problem, index) => ({
      id: index + 1,
      question: problem.title,
      description: `Solve the ${problem.title} problem from LeetCode.`,
      category: "Coding",
      difficulty: problem.difficulty,
      type: "coding",
      round: 1,
      url: problem.url,
      testCases: [
        { input: "Example input 1", expected: "Example output 1", explanation: "Explanation for test case 1" },
        { input: "Example input 2", expected: "Example output 2", explanation: "Explanation for test case 2" }
      ],
      languages: ["C", "C++", "Python", "Java"]
    }));
    
    const round2MCQ = await generateMCQQuestions(resumeText);
    const round2Questions = round2MCQ.map((q, index) => ({
      id: 2 + index + 1,
      question: q.question,
      category: "Aptitude",
      difficulty: "Medium",
      type: "mcq",
      round: 2,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));
    
    // Round 3: 3 interview questions
    const round3Questions = [
      { id: 12, question: "Tell me about yourself.", category: "HR", difficulty: "Easy", type: "interview", round: 3 },
      { id: 13, question: "Explain a challenging project you worked on.", category: "Project", difficulty: "Medium", type: "interview", round: 3 },
      { id: 14, question: "What are your strengths and weaknesses?", category: "Behavioral", difficulty: "Easy", type: "interview", round: 3 }
    ];
    
    return [...round1Coding, ...round2Questions, ...round3Questions];
  } else {
    // Simple interview: 10 general interview questions
    const system = "You are a professional interviewer. Create realistic mock interview questions. Return ONLY valid JSON.";
    const user = `Resume:
${resumeText.slice(0, 5000)}

Return JSON:
{
  "questions": [
    {"id": 1, "question": "Tell me about yourself.", "category": "HR", "difficulty": "Easy"},
    {"id": 2, "question": "...", "category": "Technical|Behavioral|Project", "difficulty": "Easy|Medium|Hard"}
  ]
}

Provide exactly 10 questions. First question should be "Tell me about yourself." Include mix of HR, behavioral, technical, and project questions.`;
    
    try {
      const data = extractJSON(await chat(system, user, 0.5));
      const questions = data.questions || [];
      // Add randomization by shuffling questions (except first one)
      if (questions.length > 1) {
        const firstQuestion = questions[0];
        const remainingQuestions = shuffleArray(questions.slice(1));
        return [firstQuestion, ...remainingQuestions.slice(0, 9)];
      }
      return questions.slice(0, 10);
    } catch (error) {
      if (error.message === 'API_QUOTA_EXCEEDED') {
        // Expanded fallback question pool for better randomization
        const fallbackQuestionPool = [
          { id: 1, question: "Tell me about yourself.", category: "HR", difficulty: "Easy" },
          { id: 2, question: "What are your strengths and weaknesses?", category: "Behavioral", difficulty: "Easy" },
          { id: 3, question: "Explain a challenging project you worked on.", category: "Project", difficulty: "Medium" },
          { id: 4, question: "What is React and why do you use it?", category: "Technical", difficulty: "Medium" },
          { id: 5, question: "How do you handle debugging and troubleshooting?", category: "Technical", difficulty: "Medium" },
          { id: 6, question: "Where do you see yourself in 5 years?", category: "HR", difficulty: "Easy" },
          { id: 7, question: "Explain the difference between let, const, and var", category: "Technical", difficulty: "Easy" },
          { id: 8, question: "What is the Virtual DOM in React?", category: "Technical", difficulty: "Medium" },
          { id: 9, question: "How do you handle state management in React?", category: "Technical", difficulty: "Medium" },
          { id: 10, question: "What is your approach to learning new technologies?", category: "Behavioral", difficulty: "Easy" },
          { id: 11, question: "Describe your experience with version control systems like Git.", category: "Technical", difficulty: "Medium" },
          { id: 12, question: "How do you handle tight deadlines and pressure?", category: "Behavioral", difficulty: "Medium" },
          { id: 13, question: "Explain the concept of closures in JavaScript.", category: "Technical", difficulty: "Medium" },
          { id: 14, question: "What is your greatest professional achievement?", category: "Behavioral", difficulty: "Easy" },
          { id: 15, question: "How do you ensure code quality in your projects?", category: "Technical", difficulty: "Medium" },
          { id: 16, question: "Explain the difference between synchronous and asynchronous programming.", category: "Technical", difficulty: "Medium" },
          { id: 17, question: "How do you handle conflicts in a team?", category: "Behavioral", difficulty: "Medium" },
          { id: 18, question: "What is REST and what are RESTful APIs?", category: "Technical", difficulty: "Medium" },
          { id: 19, question: "Why do you want to work for our company?", category: "HR", difficulty: "Easy" },
          { id: 20, question: "Explain the concept of promises in JavaScript.", category: "Technical", difficulty: "Medium" },
          { id: 21, question: "How do you stay updated with industry trends?", category: "Behavioral", difficulty: "Easy" },
          { id: 22, question: "What is your experience with testing frameworks?", category: "Technical", difficulty: "Medium" },
          { id: 23, question: "Describe a time you had to learn a new technology quickly.", category: "Behavioral", difficulty: "Medium" },
          { id: 24, question: "Explain the difference between SQL and NoSQL databases.", category: "Technical", difficulty: "Medium" },
          { id: 25, question: "How do you handle constructive criticism?", category: "Behavioral", difficulty: "Easy" }
        ];
        // Always keep "Tell me about yourself" as first question, then shuffle the rest
        const firstQuestion = fallbackQuestionPool[0];
        const shuffledRemaining = shuffleArray(fallbackQuestionPool.slice(1));
        const selectedQuestions = [firstQuestion, ...shuffledRemaining.slice(0, 9)];
        return selectedQuestions.map((q, i) => ({ ...q, id: i + 1 }));
      }
      throw error;
    }
  }
};

export const generateMCQQuestions = async (resumeText) => {
  const system = "You are an aptitude test creator. Generate multiple choice questions for technical interviews. Return ONLY valid JSON.";
  const user = `Resume context:
${resumeText.slice(0, 3000)}

Return JSON:
{
  "mcqs": [
    {
      "question": "What is the time complexity of binary search?",
      "options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
      "correctAnswer": 1
    }
  ]
}

Generate 10 MCQ questions covering: Data Structures, Algorithms, Time Complexity, Space Complexity, Arrays, Linked Lists, Trees, Graphs, Sorting, Searching. Mix of easy, medium, and hard difficulty.`;
  
  try {
    const data = extractJSON(await chat(system, user, 0.6));
    return data.mcqs || [];
  } catch (error) {
    if (error.message === 'API_QUOTA_EXCEEDED') {
      // Fallback MCQ questions when API quota is exceeded
      return [
        { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"], correctAnswer: 1 },
        { question: "Which data structure uses LIFO?", options: ["Queue", "Stack", "Array", "Linked List"], correctAnswer: 1 },
        { question: "What is the space complexity of merge sort?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], correctAnswer: 1 },
        { question: "Which sorting algorithm has worst case O(n^2)?", options: ["Merge Sort", "Quick Sort", "Bubble Sort", "Heap Sort"], correctAnswer: 2 },
        { question: "What is the height of a balanced binary tree with n nodes?", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"], correctAnswer: 1 },
        { question: "Which traversal uses a queue?", options: ["Preorder", "Inorder", "Postorder", "Level order"], correctAnswer: 3 },
        { question: "What is the worst case time complexity of quick sort?", options: ["O(n)", "O(log n)", "O(n^2)", "O(n log n)"], correctAnswer: 2 },
        { question: "Which data structure is best for implementing priority queue?", options: ["Array", "Linked List", "Heap", "Stack"], correctAnswer: 2 },
        { question: "What is the time complexity of accessing an array element by index?", options: ["O(n)", "O(log n)", "O(1)", "O(n^2)"], correctAnswer: 2 },
        { question: "Which algorithm is used for finding shortest path in weighted graph?", options: ["BFS", "DFS", "Dijkstra", "Prim"], correctAnswer: 2 }
      ];
    }
    throw error;
  }
};

export const evaluateAnswer = async (question, userAnswer, resumeContext = "") => {
  const system =
    "You are an interview evaluator. Score answers fairly and provide detailed feedback. Return ONLY valid JSON.";
  const user = `Question: ${question}
User Answer: ${userAnswer}
Resume Context: ${resumeContext.slice(0, 2000)}

Return JSON:
{
  "score": 0,
  "maxScore": 10,
  "feedback": "",
  "mistakes": [],
  "suggestedAnswer": "",
  "evaluation": {
    "confidence": 0,
    "communication": 0,
    "technicalAccuracy": 0,
    "grammar": 0,
    "completeness": 0
  }
}

All evaluation scores 0-10. score is overall out of 10.`;
  
  try {
    return extractJSON(await chat(system, user, 0.3));
  } catch (error) {
    if (error.message === 'API_QUOTA_EXCEEDED') {
      // Fallback mock evaluation when API quota is exceeded
      const score = userAnswer.length > 50 ? 7 : 5;
      return {
        score: score,
        maxScore: 10,
        feedback: "Good attempt. Your answer shows understanding of the topic.",
        mistakes: userAnswer.length < 30 ? ["Answer could be more detailed"] : [],
        suggestedAnswer: "A comprehensive answer would include specific examples and technical details.",
        evaluation: {
          confidence: 7,
          communication: 7,
          technicalAccuracy: 6,
          grammar: 8,
          completeness: 6
        }
      };
    }
    throw error;
  }
};

export const evaluateFullInterview = async (resumeText, qaPairs) => {
  const system =
    "You are a senior hiring manager. Evaluate the full mock interview and provide hiring decision. Return ONLY valid JSON.";
  const transcript = qaPairs
    .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}`)
    .join("\n\n");

  const user = `Resume:
${resumeText.slice(0, 4000)}

Interview:
${transcript}

Return JSON:
{
  "overallScore": 0,
  "selection": "Yes|No",
  "verdictSummary": "",
  "weakTopics": [],
  "strongTopics": [],
  "answers": [
    {
      "question": "",
      "userAnswer": "",
      "score": 0,
      "maxScore": 10,
      "feedback": "",
      "mistakes": [],
      "suggestedAnswer": "",
      "evaluation": {"confidence": 0, "communication": 0, "technicalAccuracy": 0, "grammar": 0, "completeness": 0}
    }
  ],
  "roadmap": {
    "currentScore": 0,
    "weeks": [{"week": 1, "topics": [], "focus": ""}]
  },
  "careerRecommendation": {
    "recommendedRoles": [],
    "missingSkills": [],
    "reasoning": ""
  }
}

Rules: overallScore 0-100. selection Yes if >= 65. Provide 4-week roadmap.`;
  
  try {
    return extractJSON(await chat(system, user, 0.3));
  } catch (error) {
    if (error.message === 'API_QUOTA_EXCEEDED') {
      // Fallback mock evaluation when API quota is exceeded
      const avgScore = qaPairs.length > 0 ? 70 : 50;
      return {
        overallScore: avgScore,
        selection: avgScore >= 65 ? "Yes" : "No",
        verdictSummary: avgScore >= 65 
          ? "Good performance overall. Shows solid understanding of concepts and good communication skills."
          : "Needs improvement in technical depth and answer completeness.",
        weakTopics: ["System Design", "Advanced Algorithms"],
        strongTopics: ["JavaScript", "React", "Problem Solving"],
        answers: qaPairs.map((qa, i) => ({
          question: qa.question,
          userAnswer: qa.answer,
          score: 7,
          maxScore: 10,
          feedback: "Good answer with relevant points.",
          mistakes: [],
          suggestedAnswer: "A more detailed answer would include specific examples.",
          evaluation: { confidence: 7, communication: 7, technicalAccuracy: 7, grammar: 8, completeness: 7 }
        })),
        roadmap: {
          currentScore: avgScore,
          weeks: [
            { week: 1, topics: ["Data Structures", "Algorithms"], focus: "DSA Fundamentals" },
            { week: 2, topics: ["System Design", "Database Design"], focus: "Architecture" },
            { week: 3, topics: ["Advanced JavaScript", "React Patterns"], focus: "Frontend" },
            { week: 4, topics: ["Mock Interviews", "Practice Problems"], focus: "Interview Prep" }
          ]
        },
        careerRecommendation: {
          recommendedRoles: ["Frontend Developer", "Full Stack Developer", "React Developer"],
          missingSkills: ["System Design", "Cloud Services", "DevOps"],
          reasoning: "Based on your resume and interview performance, you show strong frontend skills. Adding backend and cloud knowledge would make you more competitive."
        }
      };
    }
    throw error;
  }
};

export const getCareerRecommendation = async (resumeText) => {
  const system =
    "You are a career counselor. Recommend roles based on resume. Return ONLY valid JSON.";
  const user = `Resume:
${resumeText.slice(0, 5000)}

Return JSON:
{
  "recommendedRoles": [],
  "missingSkills": [],
  "reasoning": ""
}`;
  
  try {
    return extractJSON(await chat(system, user, 0.5));
  } catch (error) {
    if (error.message === 'API_QUOTA_EXCEEDED') {
      // Fallback mock career recommendation when API quota is exceeded
      return {
        recommendedRoles: ["Frontend Developer", "Full Stack Developer", "React Developer", "Software Engineer"],
        missingSkills: ["TypeScript", "Docker", "AWS", "GraphQL", "System Design"],
        reasoning: "Based on your resume, you have strong frontend development skills. To advance your career, consider learning backend technologies, cloud services, and system design to become a more well-rounded developer."
      };
    }
    throw error;
  }
};

export const generateRoadmap = async (resumeText, currentScore, weakTopics) => {
  const system =
    "You are a learning coach. Create a 4-week study roadmap. Return ONLY valid JSON.";
  const user = `Current Score: ${currentScore}/100
Weak Topics: ${weakTopics.join(", ")}
Resume:
${resumeText.slice(0, 3000)}

Return JSON:
{
  "currentScore": ${currentScore},
  "weeks": [
    {"week": 1, "topics": [], "focus": ""},
    {"week": 2, "topics": [], "focus": ""},
    {"week": 3, "topics": [], "focus": ""},
    {"week": 4, "topics": [], "focus": ""}
  ]
}`;
  
  try {
    return extractJSON(await chat(system, user, 0.5));
  } catch (error) {
    if (error.message === 'API_QUOTA_EXCEEDED') {
      // Fallback mock roadmap when API quota is exceeded
      return {
        currentScore: currentScore,
        weeks: [
          { week: 1, topics: weakTopics.slice(0, 2).concat(["Basics"]), focus: "Foundation Building" },
          { week: 2, topics: weakTopics.slice(2, 4).concat(["Practice"]), focus: "Skill Development" },
          { week: 3, topics: ["Advanced Topics", "Problem Solving"], focus: "Advanced Concepts" },
          { week: 4, topics: ["Mock Interviews", "Revision"], focus: "Interview Preparation" }
        ]
      };
    }
    throw error;
  }
};
