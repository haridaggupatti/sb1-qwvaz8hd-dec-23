import { useState } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Wand } from 'lucide-react';
import Button from '../Button';
import { openaiService } from '../../services/openai';
import { toast } from 'react-hot-toast';

interface OutputPanelProps {
  output: string;
  error: string | null;
  code: string;
  language: string;
  onRerunCode: () => void;
  onUpdateCode: (newCode: string) => void;
}

export function OutputPanel({
  output,
  error,
  code,
  language,
  onRerunCode,
  onUpdateCode
}: OutputPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    isCorrect: boolean;
    explanation: string;
    suggestions?: string[];
    improvedCode?: string;
  } | null>(null);

  const analyzeOutput = async () => {
    setIsAnalyzing(true);
    try {
      // Get code explanation
      const explanation = await openaiService.explainCode(code, language);
      
      // Get suggestions for improvement
      const suggestions = await openaiService.suggestImprovements(code, language);
      
      // Get improved code if there are issues
      let improvedCode;
      if (error || suggestions.length > 0) {
        improvedCode = await openaiService.fixCode(code, language);
      }

      setAnalysis({
        isCorrect: !error && suggestions.length === 0,
        explanation,
        suggestions,
        improvedCode
      });

      toast.success('Code analysis complete');
    } catch (err) {
      console.error('Failed to analyze output:', err);
      toast.error('Failed to analyze code');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyFix = () => {
    if (analysis?.improvedCode) {
      onUpdateCode(analysis.improvedCode);
      toast.success('Applied suggested fixes');
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Output
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeOutput}
              loading={isAnalyzing}
              icon={<Wand className="w-4 h-4" />}
            >
              Analyze Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRerunCode}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Rerun
            </Button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <pre className="font-mono text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
              {error}
            </pre>
          </div>
        ) : (
          <pre className="font-mono text-sm p-3 bg-gray-50 dark:bg-dark-700 rounded-lg overflow-x-auto">
            {output}
          </pre>
        )}

        {analysis && (
          <div className={`mt-4 p-4 rounded-lg ${
            analysis.isCorrect 
              ? 'bg-green-50 dark:bg-green-900/20' 
              : 'bg-yellow-50 dark:bg-yellow-900/20'
          }`}>
            <div className="flex items-start space-x-3">
              {analysis.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  analysis.isCorrect 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-yellow-800 dark:text-yellow-200'
                }`}>
                  {analysis.isCorrect ? 'Code analysis successful' : 'Potential improvements found'}
                </p>
                
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <h4 className="font-medium mb-1">Code Explanation:</h4>
                  <p className="whitespace-pre-wrap">{analysis.explanation}</p>
                </div>

                {analysis.suggestions && analysis.suggestions.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-1">Suggested Improvements:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.improvedCode && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">Improved Code:</h4>
                    <pre className="text-sm bg-white dark:bg-dark-700 p-3 rounded-md font-mono overflow-x-auto">
                      {analysis.improvedCode}
                    </pre>
                    <Button
                      className="mt-2"
                      size="sm"
                      onClick={handleApplyFix}
                    >
                      Apply Fixes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}