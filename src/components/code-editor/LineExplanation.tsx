import { X, Info } from 'lucide-react';

interface LineExplanationProps {
  line?: number;
  content: string;
  explanation: string;
  onClose: () => void;
}

export function LineExplanation({ line, content, explanation, onClose }: LineExplanationProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 p-4 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            <Info className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Code Explanation {line ? `(Line ${line})` : ''}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 space-y-3">
              <div className="bg-gray-50 dark:bg-dark-700 rounded-md p-3">
                <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {content}
                </pre>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {explanation}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}