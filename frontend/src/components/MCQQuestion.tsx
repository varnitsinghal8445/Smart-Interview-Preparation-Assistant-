import { useState, useEffect } from "react";

interface MCQQuestionProps {
  question: string;
  options: string[];
  onSubmit: (selectedOption: number) => void;
  loading?: boolean;
}

export default function MCQQuestion({
  question,
  options,
  onSubmit,
  loading = false,
}: MCQQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    console.log("📝 MCQ Question received:", question);
    console.log("🔢 MCQ Options received:", options);
    console.log("📊 Number of options:", options.length);
  }, [question, options]);

  const handleSubmit = () => {
    if (selectedOption !== null) {
      onSubmit(selectedOption);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Left Panel: Question */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col justify-center">
        <h3 className="font-semibold text-xl mb-4">Question</h3>
        <p className="text-gray-300 text-lg">{question}</p>
      </div>

      {/* Right Panel: Options */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col justify-between">
        <div>
          <h4 className="font-medium mb-4">Select your answer:</h4>
          <div className="space-y-3">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(index)}
                className={`w-full p-4 text-left rounded-lg border transition-colors ${
                  selectedOption === index
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-gray-700 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || selectedOption === null}
          className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg border border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Submitting..." : "Submit Answer"}
        </button>
      </div>
    </div>
  );
}
