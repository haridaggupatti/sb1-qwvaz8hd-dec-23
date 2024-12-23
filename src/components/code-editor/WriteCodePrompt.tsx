import { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
import Button from '../Button';
import { openaiService } from '../../services/openai';
import { toast } from 'react-hot-toast';

interface WriteCodePromptProps {
  language: string;
  onAccept: (code: string) => void;
  onClose: () => void;
  currentCode?: string;
}

export function WriteCodePrompt({ 
  language, 
  onAccept, 
  onClose,
  currentCode 
}: WriteCodePromptProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.ctrlKey && e.key === 'Enter' && generatedCode) {
        handleAcceptCode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generatedCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await openaiService.generateCodeResponse(prompt, language);
      setGeneratedCode(response.code);
      setPreviewMode(true);
      toast.success('Code generated successfully');
    } catch (error) {
      toast.error('Failed to generate code');
      console.error('Code generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptCode = () => {
    if (!generatedCode) return;

    if (currentCode) {
      // If there's existing code, insert at cursor position or append
      const updatedCode = currentCode + '\n\n' + generatedCode;
      onAccept(updatedCode);
    } else {
      onAccept(generatedCode);
    }
    
    toast.success('Code applied successfully');
    onClose();
  };

  const handleModifyPrompt = () => {
    setPreviewMode(false);
    setGeneratedCode(null);
  };

  return (
    <div className="fixed inset-0 bg-gray-800/95 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {previewMode ? 'Generated Code Preview' : 'Generate Code'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {!previewMode ? (
            <div className="h-full p-4 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Describe what code you want to generate:
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Generate a function that sorts an array using quicksort algorithm"
                    className="w-full h-32 rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-gray-100"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!prompt.trim() || isLoading}
                    loading={isLoading}
                    icon={<MessageSquare className="w-4 h-4" />}
                  >
                    Generate
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <pre className="p-4 text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-x-auto">
                    {generatedCode}
                  </pre>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-700/50">
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleModifyPrompt}
                  >
                    Modify Prompt
                  </Button>
                  <Button
                    onClick={handleAcceptCode}
                    disabled={!generatedCode}
                  >
                    Accept Code (Ctrl+Enter)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-700/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Tips:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Be specific about the functionality you want</li>
              <li>Mention any specific algorithms or approaches</li>
              <li>Include requirements for input/output handling</li>
              <li>Press Ctrl+Enter to quickly accept generated code</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}