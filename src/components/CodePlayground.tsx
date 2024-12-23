import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Code, Play } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CodeEditor from './CodeEditor';
import Button from './Button';
import ThemeToggle from './ThemeToggle';
import { openaiService } from '../services/openai';
import { CodeExecutor } from '../utils/code-execution/executor';

export default function CodePlayground() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const handleAskQuestion = useCallback(async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await openaiService.generateCodeResponse(question, selectedLanguage);
      setCode(response.code);
      setExplanation(response.explanation);
      
      if (response.suggestions.length > 0) {
        toast.success('Code generated! Check suggestions below.');
      } else {
        toast.success('Code generated successfully!');
      }
    } catch (error) {
      toast.error('Failed to generate code');
    } finally {
      setLoading(false);
    }
  }, [question, selectedLanguage]);

  const handleRunCode = async (codeToRun: string) => {
    try {
      const result = await CodeExecutor.execute(codeToRun, selectedLanguage);
      if (result.success) {
        setOutput(result.output || '');
        toast.success('Code executed successfully!');
      } else {
        setOutput(result.error || 'Execution failed');
        toast.error(result.error || 'Execution failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to execute code';
      setOutput(message);
      toast.error(message);
    }
  };

  const handleExplainCode = async () => {
    if (!code.trim()) return;

    setLoading(true);
    try {
      const explanation = await openaiService.explainCode(code, selectedLanguage);
      setExplanation(explanation);
      toast.success('Code explanation generated!');
    } catch (error) {
      toast.error('Failed to explain code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/interview')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Interview
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Code Playground
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Input */}
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a coding question (e.g., 'Write a function to check if a string is a palindrome')"
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <Button
                  onClick={handleAskQuestion}
                  disabled={loading || !question.trim()}
                  loading={loading}
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  Ask
                </Button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {CodeExecutor.getSupportedLanguages().map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleExplainCode}
                      disabled={!code.trim() || loading}
                      icon={<Code className="w-4 h-4" />}
                    >
                      Explain Code
                    </Button>
                    <Button
                      onClick={() => handleRunCode(code)}
                      disabled={!code.trim() || loading}
                      icon={<Play className="w-4 h-4" />}
                    >
                      Run Code
                    </Button>
                  </div>
                </div>
              </div>

              <CodeEditor
                value={code}
                onChange={setCode}
                language={selectedLanguage}
                onRun={handleRunCode}
              />

              {/* Output */}
              {output && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Output
                  </h3>
                  <pre className="font-mono text-sm p-3 bg-gray-50 dark:bg-dark-700 rounded-lg overflow-x-auto">
                    {output}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Explanation */}
            {explanation && (
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Code Explanation
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
                    {explanation}
                  </pre>
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Quick Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="font-mono bg-gray-100 dark:bg-dark-700 px-1.5 py-0.5 rounded text-xs mr-2">
                    Ctrl + Enter
                  </span>
                  Run code
                </li>
                <li className="flex items-start">
                  <span className="font-mono bg-gray-100 dark:bg-dark-700 px-1.5 py-0.5 rounded text-xs mr-2">
                    Tab
                  </span>
                  Indent code
                </li>
                <li className="flex items-start">
                  <span className="font-mono bg-gray-100 dark:bg-dark-700 px-1.5 py-0.5 rounded text-xs mr-2">
                    Shift + Tab
                  </span>
                  Unindent code
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}