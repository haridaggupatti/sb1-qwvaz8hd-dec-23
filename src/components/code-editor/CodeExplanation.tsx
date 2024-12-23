import { X } from 'lucide-react';
import Button from '../Button';

interface CodeExplanationProps {
  code: string;
  explanation: string;
  onClose: () => void;
}

export function CodeExplanation({ code, explanation, onClose }: CodeExplanationProps) {
  return (
    <div className="fixed inset-0 bg-gray-800/95 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Code Explanation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Your Code:
              </h4>
              <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-x-auto">
                {code}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Line-by-Line Explanation:
              </h4>
              <div className="prose dark:prose-invert max-w-none">
                <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {explanation}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}