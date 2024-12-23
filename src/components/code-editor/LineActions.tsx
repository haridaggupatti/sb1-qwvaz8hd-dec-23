import { useState } from 'react';
import { MessageSquare, Code, RefreshCw } from 'lucide-react';
import { openaiService } from '../../services/openai';
import { toast } from 'react-hot-toast';

interface LineActionsProps {
  line: number;
  content: string;
  language: string;
  onExplain: (explanation: string) => void;
  onUpdate: (newContent: string) => void;
}

export function LineActions({
  line,
  content,
  language,
  onExplain,
  onUpdate
}: LineActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: 'explain' | 'improve' | 'rewrite') => {
    setIsLoading(true);
    try {
      switch (action) {
        case 'explain':
          const explanation = await openaiService.explainCode(
            content,
            language,
            `Line ${line}: ${content}`
          );
          onExplain(explanation);
          break;
        case 'improve':
          const improved = await openaiService.fixCode(content, language);
          onUpdate(improved);
          toast.success('Line improved successfully');
          break;
        case 'rewrite':
          const rewritten = await openaiService.generateCodeResponse(
            `Rewrite this line of code: ${content}`,
            language
          );
          onUpdate(rewritten.code);
          toast.success('Line rewritten successfully');
          break;
      }
    } catch (error) {
      console.error('Action error:', error);
      toast.error('Failed to process action');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute left-0 -ml-10 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => handleAction('explain')}
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        disabled={isLoading}
        title="Explain this line"
      >
        <Code className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleAction('improve')}
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        disabled={isLoading}
        title="Improve this line"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleAction('rewrite')}
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        disabled={isLoading}
        title="Rewrite this line"
      >
        <MessageSquare className="w-4 h-4" />
      </button>
    </div>
  );
}