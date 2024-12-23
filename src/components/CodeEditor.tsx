import { useState, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { getLanguageExtension } from '../utils/code-execution/language-extensions';
import { EditorView } from '@codemirror/view';
import { openaiService } from '../services/openai';
import { toast } from 'react-hot-toast';
import { CursorManager } from '../utils/code-execution/cursor-manager';
import { CodeExecutor } from '../utils/code-execution/executor';
import { ContextMenu } from './code-editor/ContextMenu';
import { LineExplanation } from './code-editor/LineExplanation';
import { WriteCodePrompt } from './code-editor/WriteCodePrompt';
import { OutputPanel } from './code-editor/OutputPanel';
import { EditorToolbar } from './code-editor/EditorToolbar';
import { CodeExplanation } from './code-editor/CodeExplanation';
import { useCodeExecution } from '../hooks/useCodeExecution';
import { useCodeAnalysis } from '../hooks/useCodeAnalysis';

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  onRun?: (code: string) => void;
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
  const [showExplanation, setShowExplanation] = useState(false);
  const [codeExplanation, setCodeExplanation] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');

  const { output, error, isExecuting, executeCode, clearOutput } = useCodeExecution(language);
  const { analysis, isAnalyzing, analyzeCode } = useCodeAnalysis(language);

  useEffect(() => {
    if (value !== undefined) {
      setCode(value);
    }
  }, [value]);

  const handleChange = useCallback((newCode: string) => {
    setCode(newCode);
    onChange?.(newCode);
  }, [onChange]);

  const handleRunCode = useCallback(() => {
    if (!code.trim()) {
      toast.error('No code to run');
      return;
    }
    executeCode(code);
  }, [code, executeCode]);

  const handleKeyDown = useCallback(async (e: React.KeyboardEvent) => {
    if (!editorView) return;

    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      const selection = CursorManager.getSelectedText(editorView);
      if (selection) {
        try {
          const explanation = await openaiService.explainCode(selection, language);
          setLineExplanation(explanation);
          toast.success('Code explanation generated');
        } catch (error) {
          toast.error('Failed to explain code');
        }
      }
    } else if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      setShowWritePrompt(true);
    }
  }, [editorView, language]);

  const handleExplainAll = async () => {
    if (!code.trim()) {
      toast.error('No code to explain');
      return;
    }

    try {
      const explanation = await openaiService.explainCode(
        code,
        language,
        'Provide a detailed line-by-line explanation of this code, including its purpose, logic, and any important concepts:'
      );
      setCodeExplanation(explanation);
      setShowExplanation(true);
      toast.success('Code explanation generated');
    } catch (error) {
      toast.error('Failed to explain code');
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

  const handleCreateEditor = useCallback((view: EditorView) => {
    setEditorView(view);
  }, []);

  return (
    <div className="relative rounded-lg border border-gray-200 dark:border-gray-700">
      <EditorToolbar
        onRun={handleRunCode}
        onWriteCode={() => setShowWritePrompt(true)}
        onExplainAll={handleExplainAll}
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

        {contextMenu && selectedText && (
          <ContextMenu
            position={contextMenu}
            code={selectedText}
            language={language}
            onClose={() => setContextMenu(null)}
            onCodeUpdate={handleChange}
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
          onApplyCorrection={handleChange}
          onClose={() => setShowCorrection(false)}
        />
      )}

      {showWritePrompt && (
        <WriteCodePrompt
          language={language}
          onAccept={handleChange}
          onClose={() => setShowWritePrompt(false)}
          currentCode={code}
        />
      )}

      {showExplanation && codeExplanation && (
        <CodeExplanation
          code={code}
          explanation={codeExplanation}
          onClose={() => setShowExplanation(false)}
        />
      )}

      {(output || error) && (
        <OutputPanel
          output={output}
          error={error}
          code={code}
          language={language}
          onRerunCode={handleRunCode}
          onUpdateCode={handleChange}
        />
      )}
    </div>
  );
}