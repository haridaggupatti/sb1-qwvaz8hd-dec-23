import { useState, useCallback } from 'react';
import { codeServices } from '../services/code';
import { toast } from 'react-hot-toast';

export function useCodeAnalysis(language: string) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    explanation: string;
    suggestions: string[];
  } | null>(null);

  const analyzeCode = useCallback(async (code: string) => {
    if (!code.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const result = await codeServices.analysis.analyzeCode(code, language);
      setAnalysis(result);
      toast.success('Code analysis complete');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze code');
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [language, isAnalyzing]);

  return {
    analysis,
    isAnalyzing,
    analyzeCode,
    clearAnalysis: () => setAnalysis(null)
  };
}