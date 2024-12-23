import { useState, useEffect, useRef } from 'react';
import { Code, MessageSquare, Terminal, RefreshCw } from 'lucide-react';
import Button from '../Button';
import { Tooltip } from '../Tooltip';

interface SelectionMenuProps {
  position: { x: number; y: number };
  language: string;
  selectedText: string;
  onCodeUpdate: (newCode: string) => void;
  onCommand: (command: string) => void;
  commandMode: boolean;
  onCommandModeChange: (mode: boolean) => void;
  onCrossQuestion: () => void;
}

export function SelectionMenu({
  position,
  language,
  selectedText,
  onCommand,
  commandMode,
  onCommandModeChange,
  onCrossQuestion
}: SelectionMenuProps) {
  const [command, setCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [commandMode]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!command.trim()) return;
      await onCommand(command);
      setCommand('');
    } else if (e.key === 'Escape') {
      onCommandModeChange(false);
      setCommand('');
    }
  };

  return (
    <div 
      className="selection-menu fixed z-50 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[300px]"
      style={{ 
        top: position.y, 
        left: position.x,
        transform: `translate(${position.x + 300 > window.innerWidth ? '-100%' : '0'}, 0)`
      }}
    >
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {language} Code Actions
          </span>
          <Tooltip content="Toggle command mode (/)">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCommandModeChange(!commandMode)}
              icon={<Terminal className="w-4 h-4" />}
            >
              {commandMode ? 'Hide' : 'Command'}
            </Button>
          </Tooltip>
        </div>

        {commandMode && (
          <div className="mt-2">
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or question..."
              className="w-full bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
        )}
      </div>

      {!commandMode && (
        <div className="py-1">
          <button
            onClick={onCrossQuestion}
            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Ask About Code
          </button>
          <button
            onClick={() => onCommand('explain this code')}
            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center"
          >
            <Code className="w-4 h-4 mr-2" />
            Explain Code
          </button>
          <button
            onClick={() => onCommand('improve this code')}
            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Improve Code
          </button>
        </div>
      )}

      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {commandMode ? (
            'Enter to execute, Esc to cancel'
          ) : (
            'Type "/" or click Command for more options'
          )}
        </div>
      </div>
    </div>
  );
}