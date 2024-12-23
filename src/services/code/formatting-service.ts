import { CodeAnalyzer } from '../../utils/code-execution/code-analyzer';

export class FormattingService {
  format(code: string, language: string): string {
    return CodeAnalyzer.formatCode(code, language);
  }

  addLineNumbers(code: string): string {
    return CodeAnalyzer.addLineNumbers(code);
  }
}