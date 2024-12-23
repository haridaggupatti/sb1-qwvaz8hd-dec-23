import { useState } from 'react';
import { Send, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import Button from './Button';
import TextareaAutosize from 'react-textarea-autosize';
import { analyzeResume } from '../utils/resume-analyzer';
import { PersonalityEngine } from '../utils/personality-engine';

interface ResumeUploaderProps {
  onUpload: (content: string) => Promise<void>;
}

const MAX_LENGTH = 4000;
const MIN_LENGTH = 100;

interface ResumeAnalysis {
  score: number;
  feedback: string[];
  missingElements: string[];
  suggestions: string[];
}

export default function ResumeUploader({ onUpload }: ResumeUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const analyzeContent = (text: string) => {
    try {
      const resumeAnalysis = analyzeResume(text);
      const personalityEngine = new PersonalityEngine(text);
      
      const missingElements = [];
      const suggestions = [];
      let score = 100;

      // Check for key sections
      if (resumeAnalysis.experience.length === 0) {
        missingElements.push('Work experience section');
        score -= 20;
      }
      if (resumeAnalysis.skills.length === 0) {
        missingElements.push('Skills section');
        score -= 15;
      }
      if (resumeAnalysis.education.length === 0) {
        missingElements.push('Education section');
        score -= 15;
      }
      if (resumeAnalysis.achievements.length === 0) {
        missingElements.push('Achievements section');
        score -= 10;
      }

      // Generate feedback
      const feedback = [];
      
      if (resumeAnalysis.keywords.length < 10) {
        feedback.push('Consider adding more industry-specific keywords');
        score -= 5;
      }

      if (text.split(/\s+/).length < 200) {
        feedback.push('Resume seems too brief. Consider adding more details');
        score -= 5;
      }

      // Generate improvement suggestions
      if (resumeAnalysis.experience.length > 0 && !text.toLowerCase().includes('result')) {
        suggestions.push('Add measurable results and impact for your experiences');
      }

      if (!text.toLowerCase().includes('project')) {
        suggestions.push('Consider adding relevant project examples');
      }

      if (resumeAnalysis.skills.length > 0 && !text.toLowerCase().includes('level')) {
        suggestions.push('Specify proficiency levels for your skills');
      }

      setAnalysis({
        score: Math.max(0, score),
        feedback,
        missingElements,
        suggestions
      });

      setShowAnalysis(true);
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze resume content');
    }
  };

  const handleTextChange = (text: string) => {
    setResumeText(text);
    setShowAnalysis(false);
    
    if (text.length > MAX_LENGTH) {
      setError(`Resume is too long. Maximum ${MAX_LENGTH} characters allowed.`);
    } else if (text.length < MIN_LENGTH && text.length > 0) {
      setError(`Resume is too short. Minimum ${MIN_LENGTH} characters required.`);
    } else {
      setError(null);
    }

    // Analyze after 1 second of no typing
    if (text.length >= MIN_LENGTH) {
      const timeoutId = setTimeout(() => analyzeContent(text), 1000);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim() || loading || error) return;

    try {
      setLoading(true);
      await onUpload(resumeText.trim());
    } catch (error) {
      console.error('Error uploading resume:', error);
      setError('Failed to process resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const charCount = resumeText.length;
  const isValid = charCount >= MIN_LENGTH && charCount <= MAX_LENGTH;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label 
              htmlFor="resume" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Paste your resume text
            </label>
            <span 
              className={`text-sm ${
                error 
                  ? 'text-red-500' 
                  : charCount > MAX_LENGTH * 0.9 
                    ? 'text-yellow-500' 
                    : 'text-gray-500'
              }`}
            >
              {charCount}/{MAX_LENGTH}
            </span>
          </div>
          
          <div className="relative">
            <TextareaAutosize
              id="resume"
              value={resumeText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste your resume content here..."
              className={`w-full rounded-md shadow-sm resize-none min-h-[200px] p-3 ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500'
              } dark:bg-dark-700 dark:text-gray-100`}
              minRows={8}
              maxRows={20}
              disabled={loading}
            />
            {error && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-start pt-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {showAnalysis && analysis && (
            <div className="mt-4 space-y-4">
              <div className="bg-white dark:bg-dark-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Resume Analysis
                  </h3>
                  <div className="flex items-center">
                    <span className={`text-2xl font-bold ${
                      analysis.score >= 80 ? 'text-green-500' :
                      analysis.score >= 60 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {analysis.score}%
                    </span>
                  </div>
                </div>

                {analysis.missingElements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                      Missing Elements:
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.missingElements.map((element, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {element}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.feedback.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                      Feedback:
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.feedback.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                      Suggestions for Improvement:
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
            <p>Tips for a better interview experience:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Include detailed work experience with specific achievements</li>
              <li>List technical skills with proficiency levels</li>
              <li>Mention notable projects and their impact</li>
              <li>Add relevant education and certifications</li>
              <li>Use action verbs and quantify results where possible</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {showAnalysis && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAnalysis(false)}
              icon={<FileText className="w-4 h-4" />}
            >
              Hide Analysis
            </Button>
          )}
          <Button
            type="submit"
            loading={loading}
            disabled={loading || !resumeText.trim() || !isValid}
            icon={<Send className="w-4 h-4" />}
          >
            Start Interview
          </Button>
        </div>
      </form>
    </div>
  );
}