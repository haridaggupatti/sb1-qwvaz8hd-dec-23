import { useState, useEffect } from 'react';
import { EditorView } from '@codemirror/view';
import { CursorManager } from '../../utils/code-execution/cursor-manager';
import { openaiService } from '../../services/openai';
import { toast } from 'react-hot-toast';

interface SelectionHandlerProps {
  view: EditorView | null;
  language: string;
  onExplanation: (explanation: string) => void;
  onCodeUpdate: (newCode: string) => void;
}

export function SelectionHandler({
  view,
  language,
  onExplanation,
  onCodeUpdate
}: SelectionHandlerProps) {
  useEffect(() => {
    if (!view) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        
        // Get selected text or current line
        const selection = CursorManager.getSelectedText(view);
        const selectedLines = CursorManager.getSelectedLines(view);
        
        let codeToExplain = '';
        if (selection) {
          codeToExplain = selection;
        } else if (selectedLines.length > 0) {
          codeToExplain = selectedLines.map(line => line.content).join('\n');
        } else {
          const currentLine = CursorManager.getCurrentLine(view);
          if (currentLine) {
            codeToExplain = currentLine.content;
          }
        }

        if (codeToExplain) {
          try {
            const explanation = await openaiService.explainCode(
              codeToExplain,
              language,
              'Explain this code in detail, focusing on its purpose and functionality:'
            );
            onExplanation(explanation);
            toast.success('Code explanation generated');
          } catch (error) {
            console.error('Failed to explain code:', error);
            toast.error('Failed to explain code');
          }
        }
      }
    };

    // Add event listeners
    view.dom.addEventListener('keydown', handleKeyDown);

    return () => {
      view.dom.removeEventListener('keydown', handleKeyDown);
    };
  }, [view, language, onExplanation]);

  return null;
}