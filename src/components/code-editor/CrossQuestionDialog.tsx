import { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import Button from '../Button';
import { openaiService } from '../../services/openai';

interface CrossQuestionDialogProps {
  code: string;
  language: string;
  onClose: () => void;
  onCodeUpdate?: (newCode: string) => void;
}

export function CrossQuestionDialog({ code, language, onClose, onCodeUpdate }: CrossQuestionDialogProps) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{
    explanation: string;
    suggestedChanges?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await openaiService.answerCodeQuestion(code, question, language);
      setResponse(result);
    } catch (error) {
      console.error('Failed to get answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChanges = () => {
    if (response?.suggestedChanges && onCodeUpdate) {
      onCodeUpdate(response.suggestedChanges);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800/95 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Ask About Code
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Code:
              </label>
              <pre className="bg-gray-50 dark:bg-dark-700 p-3 rounded-md text-sm font-mono overflow-x-auto">
                {code}
              </pre>
            </div>

            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Question:
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about this code..."
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={!question.trim() || isLoading}
              loading={isLoading}
              icon={<MessageSquare className="w-4 h-4" />}
            >
              Ask Question
            </Button>
          </form>

          {response && (
            <div className="mt-6 space-y-4">
              <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Answer:
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {response.explanation}
                </div>
              </div>

              {response.suggestedChanges && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Suggested Changes:
                  </h4>
                  <pre className="bg-gray-50 dark:bg-dark-700 p-3 rounded-md text-sm font-mono overflow-x-auto">
                    {response.suggestedChanges}
                  </pre>
                  <div className="mt-4">
                    <Button onClick={handleApplyChanges}>
                      Apply Changes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}