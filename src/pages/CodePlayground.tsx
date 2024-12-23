import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import ThemeToggle from '../components/ThemeToggle';
import { CodeExecutor } from '../utils/code-execution/executor';
import { toast } from 'react-hot-toast';

export default function CodePlayground() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [output, setOutput] = useState('');

  const handleRunCode = async (code: string) => {
    try {
      const result = await CodeExecutor.execute(code, selectedLanguage);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
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
            </div>
          </div>

          <CodeEditor
            language={selectedLanguage}
            onRun={handleRunCode}
          />

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
    </div>
  );
}