import { useState } from 'react';
import { Check, X, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../Button';
import { openaiService } from '../../services/openai';
import { toast } from 'react-hot-toast';

interface CodeCorrectionProps {
  code: string;
  language: string;
  onApplyCorrection: (correctedCode: string) => void;
  onClose: () => void;
}

export function CodeCorrection({ code, language, onApplyCorrection, onClose }: CodeCorrectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [correction, setCorrection] = useState<{
    code: string;
    explanation: string;
    improvements: string[];
  } | null>(null);

  const handleGetCorrection = async () => {
    setIsLoading(true);
    try {
      const result = await openaiService.fixCode(code, language);
      const explanation = await openaiService.explainCode(result, language, 'Code improvements explanation:');
      const improvements = await openaiService.suggestImprovements(result, language);
      
      setCorrection({
        code: result,
        explanation,
        improvements
      });
      toast.success('Code analysis complete');
    } catch (error) {
      console.error('Failed to get code correction:', error);
      toast.error('Failed to analyze code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCorrection = () => {
    if (!correction) return;
    onApplyCorrection(correction.code);
    toast.success('Code correction applied');
    onClose();
  };

  if (!correction) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Would you like to analyze and improve your code?
            </h4>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              AI will analyze your code for potential improvements and suggest corrections.
            </p>
            <div className="mt-3 flex space-x-3">
              <Button
                size="sm"
                onClick={handleGetCorrection}
                loading={isLoading}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Analyze Code
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
            Suggested Improvements
          </h4>
          
          <div className="bg-white dark:bg-dark-800 rounded-md p-3 mb-3">
            <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {correction.code}
            </pre>
          </div>

          <div className="mb-4">
            <h5 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
              Explanation:
            </h5>
            <p className="text-sm text-green-700 dark:text-green-300">
              {correction.explanation}
            </p>
          </div>

          {correction.improvements.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                Key Improvements:
              </h5>
              <ul className="list-disc list-inside space-y-1">
                {correction.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm text-green-700 dark:text-green-300">
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              size="sm"
              onClick={handleApplyCorrection}
              icon={<Check className="w-4 h-4" />}
            >
              Apply Changes
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              icon={<X className="w-4 h-4" />}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}