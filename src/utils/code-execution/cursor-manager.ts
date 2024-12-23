import { EditorView } from '@codemirror/view';
import { Text } from '@codemirror/state';

export class CursorManager {
  static getCurrentLine(view: EditorView): { number: number; content: string } | null {
    if (!view) return null;

    const cursor = view.state.selection.main;
    const doc = view.state.doc;
    const line = doc.lineAt(cursor.head);

    return {
      number: line.number,
      content: line.text
    };
  }

  static getSelectedText(view: EditorView): string | null {
    if (!view) return null;

    const selection = view.state.selection.main;
    if (selection.empty) return null;

    return view.state.sliceDoc(selection.from, selection.to);
  }

  static getSelectedLines(view: EditorView): { number: number; content: string }[] {
    if (!view) return [];

    const selection = view.state.selection.main;
    if (selection.empty) return [];

    const doc = view.state.doc;
    const startLine = doc.lineAt(selection.from);
    const endLine = doc.lineAt(selection.to);
    const lines: { number: number; content: string }[] = [];

    for (let i = startLine.number; i <= endLine.number; i++) {
      const line = doc.line(i);
      lines.push({
        number: i,
        content: line.text
      });
    }

    return lines;
  }

  static replaceSelection(view: EditorView, text: string): void {
    const selection = view.state.selection.main;
    if (!selection.empty) {
      const transaction = view.state.update({
        changes: {
          from: selection.from,
          to: selection.to,
          insert: text
        },
        selection: { anchor: selection.from + text.length }
      });
      view.dispatch(transaction);
    }
  }

  static getLineAtPosition(doc: Text, pos: number): { number: number; content: string } {
    const line = doc.lineAt(pos);
    return {
      number: line.number,
      content: line.text
    };
  }

  static getSelectionRange(view: EditorView): { from: number; to: number } | null {
    const selection = view.state.selection.main;
    return selection.empty ? null : { from: selection.from, to: selection.to };
  }
}