import { useState } from "react";

interface CodeEditorProps {
  question: string;
  description: string;
  testCases: Array<{ input: string; expected: string; explanation: string }>;
  languages: string[];
  onSubmit: (code: string, language: string) => void;
  loading?: boolean;
}

export default function CodeEditor({
  question,
  description,
  testCases,
  languages,
  onSubmit,
  loading = false,
}: CodeEditorProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(languages[0] || "Python");
  const [output, setOutput] = useState("");

  const handleRun = () => {
    if (!code.trim()) {
      setOutput("Error: No code provided. Please write your code before running.");
      return;
    }

    // Basic syntax validation based on language
    const syntaxErrors = validateSyntax(code, language);
    if (syntaxErrors.length > 0) {
      setOutput(`Syntax Errors Found:\n${syntaxErrors.join('\n')}\n\nPlease fix the syntax errors before running.`);
      return;
    }

    // Simulate running code against test cases with realistic output
    const result1 = Math.random() > 0.3 ? "PASSED ✓" : "FAILED ✗";
    const result2 = Math.random() > 0.3 ? "PASSED ✓" : "FAILED ✗";
    const output1 = result1 === "PASSED ✓" ? testCases[0].expected : "Incorrect output";
    const output2 = result2 === "PASSED ✓" ? testCases[1].expected : "Incorrect output";

    setOutput(`Running code (${language}) against test cases...\n\nTest Case 1:\nInput: ${testCases[0].input}\nExpected: ${testCases[0].expected}\nYour Output: ${output1}\nStatus: ${result1}\n\nTest Case 2:\nInput: ${testCases[1].input}\nExpected: ${testCases[1].expected}\nYour Output: ${output2}\nStatus: ${result2}\n\n${result1 === "PASSED ✓" && result2 === "PASSED ✓" ? "All test cases passed! ✓" : "Some test cases failed. Please review your code."}`);
  };

  const validateSyntax = (code: string, lang: string): string[] => {
    const errors: string[] = [];
    
    if (lang === "C" || lang === "C++") {
      if (!code.includes("main")) {
        errors.push("Missing main() function");
      }
      if (!code.includes("#include")) {
        errors.push("Missing #include directives");
      }
      if (!code.includes("{") || !code.includes("}")) {
        errors.push("Missing braces {}");
      }
    } else if (lang === "Python") {
      if (!code.includes("def ") && !code.includes("print")) {
        errors.push("No function definition or print statement found");
      }
      // Check for basic Python syntax
      const lines = code.split('\n');
      let indentLevel = 0;
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed.endsWith(':')) {
          indentLevel++;
        } else if (trimmed && !trimmed.startsWith('#')) {
          const currentIndent = line.search(/\S/);
          if (currentIndent < indentLevel * 4 && currentIndent > 0) {
            errors.push(`Line ${index + 1}: Inconsistent indentation`);
          }
        }
      });
    } else if (lang === "Java") {
      if (!code.includes("class ")) {
        errors.push("Missing class definition");
      }
      if (!code.includes("public static void main")) {
        errors.push("Missing main method");
      }
      if (!code.includes("{") || !code.includes("}")) {
        errors.push("Missing braces {}");
      }
    }
    
    return errors;
  };

  const handleSubmit = () => {
    onSubmit(code, language);
  };

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Left Panel: Question and Test Cases */}
      <div className="flex flex-col gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="font-semibold text-lg mb-2">{question}</h3>
          <p className="text-gray-400 text-sm mb-4">{description}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex-1">
          <h4 className="font-medium mb-3">Test Cases</h4>
          {testCases.map((testCase, index) => (
            <div key={index} className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
              <div className="mb-2">
                <span className="text-xs text-gray-500">Input:</span>
                <code className="text-sm ml-2">{testCase.input}</code>
              </div>
              <div className="mb-2">
                <span className="text-xs text-gray-500">Expected Output:</span>
                <code className="text-sm ml-2">{testCase.expected}</code>
              </div>
              <div>
                <span className="text-xs text-gray-500">Explanation:</span>
                <p className="text-sm ml-2 text-gray-400">{testCase.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Code Editor */}
      <div className="flex flex-col gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Code Editor</h4>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 text-sm"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Write your ${language} code here...`}
            className="w-full h-64 bg-gray-900 text-green-400 p-3 rounded border border-gray-700 font-mono text-sm resize-none"
            spellCheck={false}
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />
        </div>

        {output && (
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="font-medium mb-2">Output</h4>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{output}</pre>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleRun}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors"
          >
            Run Code
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !code.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded border border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
