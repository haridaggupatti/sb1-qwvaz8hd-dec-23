import { Play, Copy, MessageSquare, Code, BookOpen } from 'lucide-react';
import Button from '../Button';

interface EditorToolbarProps {
  onRun: () => void;
  onCopy?: () => void;
  onAskAI?: () => void;
  onWriteCode: () => void;
  onExplainAll: () => void;
  language: string;
}

export function EditorToolbar({ 
  onRun, 
  onCopy, 
  onAskAI, 
  onWriteCode, 
  onExplainAll,
  language 
}: EditorToolbarProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRun}
            icon={<Play className="w-4 h-4" />}
          >
            Run
          </Button>
          {onCopy && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCopy}
              icon={<Copy className="w-4 h-4" />}
            >
              Copy
            </Button>
          )}
          {onAskAI && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAskAI}
              icon={<MessageSquare className="w-4 h-4" />}
            >
              Ask AI
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onWriteCode}
            icon={<Code className="w-4 h-4" />}
          >
            Generate Code
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExplainAll}
            icon={<BookOpen className="w-4 h-4" />}
          >
            Explain All
          </Button>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Language: {language}
        </div>
      </div>
    </div>
  );
}