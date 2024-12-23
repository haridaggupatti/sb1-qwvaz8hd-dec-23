import { useState, useEffect, useRef } from 'react';
import { Code, MessageSquare, RefreshCw, Wand } from 'lucide-react';
import { openaiService } from '../../services/openai';
import { toast } from 'react-hot-toast';

interface ContextMenuProps {
  position: { x: number; y: number };
  code: string;
  language: string;
  onClose: () => void;
  onCodeUpdate: (newCode: string) => void;
  onExplain: (explanation: string) => void;
}

export function ContextMenu({
  position,
  code,
  language,
  onClose,
  onCodeUpdate,
  onExplain
}: ContextMenuProps) {
  const [command, setCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    inputRef.current?.focus();

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleCommand = async (type: string) => {
    setIsLoading(true);
    try {
      switch (type) {
        case 'explain':
          const explanation = await openaiService.explainCode(code, language);
          onExplain(explanation);
          toast.success('Code explanation generated');
          break;

        case 'improve':
          const improved = await openaiService.fixCode(code, language);
          onCodeUpdate(improved);
          toast.success('Code improved successfully');
          break;

        case 'rewrite':
          const rewritten = await openaiService.generateCodeResponse(
            `Rewrite this code in a better way: ${code}`,
            language
          );
          onCodeUpdate(rewritten.code);
          toast.success('Code rewritten successfully');
          break;

        case 'custom':
          if (!command.trim()) return;
          const response = await openaiService.answerCodeQuestion(code, command, language);
          if (response.suggestedChanges) {
            onCodeUpdate(response.suggestedChanges);
          }
          if (response.explanation) {
            onExplain(response.explanation);
          }
          toast.success('Command processed successfully');
          break;
      }
    } catch (error) {
      console.error('Command error:', error);
      toast.error('Failed to process command');
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommand('custom');
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Calculate position to keep menu in viewport
  const menuStyle = {
    top: Math.min(position.y, window.innerHeight - 300),
    left: Math.min(position.x, window.innerWidth - 300),
    maxWidth: '300px',
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      style={menuStyle}
    >
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this code or type a command..."
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-dark-700 dark:text-gray-100"
          autoFocus
        />
      </div>

      <div className="p-1">
        <button
          onClick={() => handleCommand('explain')}
          disabled={isLoading}
          className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center space-x-2 rounded"
        >
          <Code className="w-4 h-4" />
          <span>Explain Code</span>
        </button>

        <button
          onClick={() => handleCommand('improve')}
          disabled={isLoading}
          className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center space-x-2 rounded"
        >
          <Wand className="w-4 h-4" />
          <span>Fix & Improve Code</span>
        </button>

        <button
          onClick={() => handleCommand('rewrite')}
          disabled={isLoading}
          className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center space-x-2 rounded"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Rewrite Code</span>
        </button>
      </div>

      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Type a question or select an action • Press Esc to close
        </p>
      </div>
    </div>
  );
}