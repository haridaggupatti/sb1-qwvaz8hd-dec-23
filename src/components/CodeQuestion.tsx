import { useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import Button from './Button';
import CodeEditor from './CodeEditor';

interface CodeQuestionProps {
  question: string;
  hints?: string[];
  onSubmit: (code: string) => void;
  onAskQuestion: (question: string) => void;
}

export default function CodeQuestion({
  question,
  hints = [],
  onSubmit,
  onAskQuestion
}: CodeQuestionProps) {
  const [showHints, setShowHints] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'unhelpful' | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');

  const handleAskQuestion = () => {
    if (followUpQuestion.trim()) {
      onAskQuestion(followUpQuestion);
      setFollowUpQuestion('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Problem Statement
        </h3>
        <div className="prose dark:prose-invert max-w-none">
          {question}
        </div>
        
        {hints.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowHints(!showHints)}
              className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              {showHints ? 'Hide Hints' : 'Show Hints'}
            </button>
            {showHints && (
              <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {hints.map((hint, index) => (
                  <li key={index} className="flex items-start">
                    <span className="font-medium mr-2">Hint {index + 1}:</span>
                    {hint}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setFeedback('helpful')}
              className={`flex items-center space-x-1 text-sm ${
                feedback === 'helpful'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Helpful</span>
            </button>
            <button
              onClick={() => setFeedback('unhelpful')}
              className={`flex items-center space-x-1 text-sm ${
                feedback === 'unhelpful'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>Not Helpful</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg">
        <CodeEditor
          onRun={onSubmit}
          showLineNumbers={true}
        />
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Ask a Question
        </h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={followUpQuestion}
            onChange={(e) => setFollowUpQuestion(e.target.value)}
            placeholder="Ask about specific parts of the code or problem..."
            className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <Button
            onClick={handleAskQuestion}
            disabled={!followUpQuestion.trim()}
            icon={<MessageSquare className="w-4 h-4" />}
          >
            Ask
          </Button>
        </div>
      </div>
    </div>
  );
}