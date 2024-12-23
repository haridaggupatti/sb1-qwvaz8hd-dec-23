import { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, ChevronRight, Loader2, Mic, MicOff, Trash2, Code } from 'lucide-react';
import { format } from 'date-fns';
import { useTheme } from '../context/ThemeContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import Button from './Button';
import TextareaAutosize from 'react-textarea-autosize';
import CodeEditor from './CodeEditor';

interface Message {
  question: string;
  response: string;
  timestamp: string;
  code?: {
    content: string;
    language: string;
    explanation?: string;
  };
}

interface ChatInterfaceProps {
  messages: Message[];
  onSend: (message: string) => Promise<void>;
  onPrevious: () => void;
  onNext: () => void;
  currentIndex: number;
  onClear?: () => void;
  settings?: {
    autoScroll?: boolean;
    showTimestamps?: boolean;
    fontSize?: 'sm' | 'base' | 'lg';
  };
}

export default function ChatInterface({
  messages,
  onSend,
  onPrevious,
  onNext,
  currentIndex,
  onClear,
  settings = {
    autoScroll: true,
    showTimestamps: true,
    fontSize: 'base'
  }
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();

  const { 
    isListening, 
    startListening, 
    stopListening, 
    isSupported,
    clearTranscript
  } = useSpeechRecognition({
    onTranscriptChange: (text, isFinal) => {
      if (isFinal) {
        setInput(prev => {
          const newInput = prev ? `${prev} ${text}` : text;
          return newInput.trim();
        });
        setCurrentTranscript('');
      } else {
        setCurrentTranscript(text);
      }
    },
    continuous: true,
    interimResults: true
  });

  useEffect(() => {
    if (settings.autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, settings.autoScroll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      await onSend(input.trim());
      setInput('');
      setCurrentTranscript('');
      if (isListening) {
        clearTranscript();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleClearInput = () => {
    setInput('');
    setCurrentTranscript('');
    clearTranscript();
    inputRef.current?.focus();
  };

  const displayText = isListening ? `${input}${currentTranscript ? ` ${currentTranscript}` : ''}` : input;

  const renderMessage = (message: Message) => (
    <div className="space-y-2">
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          <div className="bg-gray-100 dark:bg-dark-700 p-3 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <p className={`font-medium text-gray-900 dark:text-gray-100 text-${settings.fontSize}`}>
                {message.question}
              </p>
              {settings.showTimestamps && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {format(new Date(message.timestamp), 'p')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
            <p className={`text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-${settings.fontSize}`}>
              {message.response}
            </p>
            {message.code && (
              <div className="mt-4">
                <CodeEditor
                  initialCode={message.code.content}
                  language={message.code.language}
                  readOnly={false}
                />
                {message.code.explanation && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {message.code.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium">Welcome to your interview practice session</p>
            <p className="text-sm mt-2">Start by asking a question or use voice input</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index}>
              {renderMessage(message)}
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={currentIndex <= 0}
              title="Previous question"
              icon={<ChevronLeft className="w-4 h-4" />}
            />
            {onClear && messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                title="Clear chat"
                icon={<Trash2 className="w-4 h-4" />}
              />
            )}
          </div>
          
          <div className="flex-1 flex space-x-2">
            <div className="flex-1 relative">
              <TextareaAutosize
                ref={inputRef}
                value={displayText}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-gray-100 resize-none min-h-[40px] max-h-[200px] py-2 px-3"
                disabled={loading}
                minRows={1}
                maxRows={5}
              />
              {isListening && (
                <div className="absolute right-2 bottom-2">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              {displayText && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearInput}
                  title="Clear input"
                  icon={<Trash2 className="w-4 h-4" />}
                />
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCodeEditor(!showCodeEditor)}
                title="Toggle code editor"
                icon={<Code className="w-4 h-4" />}
              />
              
              {isSupported && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isListening ? stopListening : startListening}
                  title={isListening ? 'Stop recording' : 'Start recording'}
                  icon={isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  className={isListening ? 'text-red-500' : ''}
                />
              )}
              
              <Button
                type="submit"
                size="sm"
                disabled={loading || (!displayText.trim())}
                title="Send question"
                icon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={currentIndex >= messages.length - 1}
            title="Next question"
            icon={<ChevronRight className="w-4 h-4" />}
          />
        </form>

        {showCodeEditor && (
          <div className="mt-4">
            <CodeEditor
              language="javascript"
              onRun={(code) => {
                console.log('Running code:', code);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}