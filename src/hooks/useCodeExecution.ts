import { useState, useCallback } from 'react';
import { codeServices } from '../services/code';
import { toast } from 'react-hot-toast';

export function useCodeExecution(language: string) {
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const executeCode = useCallback(async (code: string) => {
    if (!code.trim() || isExecuting) return;

    setIsExecuting(true);
    try {
      const result = await codeServices.execution.execute(code, language);
      if (result.success) {
        setOutput(result.output || '');
        setError(null);
        toast.success('Code executed successfully!');
      } else {
        setError(result.error || 'Execution failed');
        setOutput('');
        toast.error(result.error || 'Execution failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to execute code';
      setError(message);
      setOutput('');
      toast.error(message);
    } finally {
      setIsExecuting(false);
    }
  }, [language, isExecuting]);

  return {
    output,
    error,
    isExecuting,
    executeCode,
    clearOutput: () => {
      setOutput('');
      setError(null);
    }
  };
}