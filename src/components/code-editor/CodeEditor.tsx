import { useState, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { getLanguageExtension } from '../../utils/code-execution/language-extensions';
import { EditorView } from '@codemirror/view';
import { SelectionHandler } from './SelectionHandler';
import { LineExplanation } from './LineExplanation';
import { CodeCorrection } from './CodeCorrection';
import { WriteCodePrompt } from './WriteCodePrompt';
import { EditorToolbar } from './EditorToolbar';
import { OutputPanel } from './OutputPanel';
import { openaiService } from '../../services/openai';
import { toast } from 'react-hot-toast';
import { CursorManager } from '../../utils/code-execution/cursor-manager';
import { ContextMenu } from './ContextMenu';
import { CodeExecutor } from '../../utils/code-execution/executor';

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  readOnly?: boolean;
  showLineNumbers?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export default function CodeEditor({
  initialCode = '',
  language = 'javascript',
  readOnly = false,
  showLineNumbers = true,
  value,
  onChange
}: CodeEditorProps) {
  const [code, setCode] = useState(value || initialCode);
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [selectedLine, setSelectedLine] = useState<{ number: number; content: string } | null>(null);
  const [lineExplanation, setLineExplanation] = useState<string | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [showWritePrompt, setShowWritePrompt] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');

  useEffect(() => {
    if (value !== undefined) {
      setCode(value);
    }
  }, [value]);

  const handleChange = useCallback((newCode: string) => {
    setCode(newCode);
    onChange?.(newCode);
  }, [onChange]);

  const handleKeyDown = useCallback(async (e: React.KeyboardEvent) => {
    if (!editorView) return;

    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      const line = CursorManager.getCurrentLine(editorView);
      if (line) {
        setSelectedLine(line);
        try {
          const explanation = await openaiService.explainCode(
            line.content,
            language,
            `Line ${line.number}: ${line.content}`
          );
          setLineExplanation(explanation);
          toast.success('Line explanation generated');
        } catch (error) {
          toast.error('Failed to explain code');
        }
      }
    } else if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      setShowWritePrompt(true);
    }
  }, [editorView, language]);

  const handleRunCode = async () => {
    if (!code.trim()) return;

    try {
      const result = await CodeExecutor.execute(code, language);
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
    }
  };

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!editorView) return;

    const selection = CursorManager.getSelectedText(editorView);
    if (selection) {
      setSelectedText(selection);
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  }, [editorView]);

  const handleCodeUpdate = useCallback((newCode: string) => {
    if (editorView && selectedText) {
      CursorManager.replaceSelection(editorView, newCode);
    } else {
      handleChange(newCode);
    }
  }, [editorView, selectedText, handleChange]);

  const handleCreateEditor = useCallback((view: EditorView) => {
    setEditorView(view);
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
    setSelectedText('');
  }, []);

  return (
    <div className="relative rounded-lg border border-gray-200 dark:border-gray-700">
      <EditorToolbar
        onRun={handleRunCode}
        onWriteCode={() => setShowWritePrompt(true)}
        language={language}
      />

      <div className="relative" onContextMenu={handleContextMenu}>
        <CodeMirror
          value={code}
          height="400px"
          theme={vscodeDark}
          extensions={[getLanguageExtension(language)]}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          editable={!readOnly}
          onCreateEditor={handleCreateEditor}
          basicSetup={{
            lineNumbers: showLineNumbers,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />

        <SelectionHandler
          view={editorView}
          language={language}
          onExplanation={setLineExplanation}
          onCodeUpdate={handleCodeUpdate}
        />

        {contextMenu && selectedText && (
          <ContextMenu
            position={contextMenu}
            code={selectedText}
            language={language}
            onClose={handleCloseContextMenu}
            onCodeUpdate={handleCodeUpdate}
            onExplain={setLineExplanation}
          />
        )}

        {selectedLine && lineExplanation && (
          <LineExplanation
            line={selectedLine.number}
            content={selectedLine.content}
            explanation={lineExplanation}
            onClose={() => {
              setSelectedLine(null);
              setLineExplanation(null);
            }}
          />
        )}
      </div>

      {showCorrection && (
        <CodeCorrection
          code={code}
          language={language}
          onApplyCorrection={handleCodeUpdate}
          onClose={() => setShowCorrection(false)}
        />
      )}

      {showWritePrompt && (
        <WriteCodePrompt
          language={language}
          onAccept={handleCodeUpdate}
          onClose={() => setShowWritePrompt(false)}
          currentCode={code}
        />
      )}

      {(output || error) && (
        <OutputPanel
          output={output}
          error={error}
          code={code}
          language={language}
          onRerunCode={handleRunCode}
          onUpdateCode={handleCodeUpdate}
        />
      )}
    </div>
  );
}