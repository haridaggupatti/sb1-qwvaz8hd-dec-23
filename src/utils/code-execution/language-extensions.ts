import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { sql } from '@codemirror/lang-sql';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { php } from '@codemirror/lang-php';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';
import { Extension } from '@codemirror/state';

export function getLanguageExtension(language: string): Extension {
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'js':
    case 'typescript':
    case 'ts':
    case 'jsx':
    case 'tsx':
      return javascript();
    case 'python':
    case 'py':
      return python();
    case 'java':
      return java();
    case 'cpp':
    case 'c++':
    case 'c':
      return cpp();
    case 'sql':
    case 'mysql':
    case 'postgresql':
    case 'plsql':
    case 'oracle':
      return sql();
    case 'html':
      return html();
    case 'css':
      return css();
    case 'php':
      return php();
    case 'rust':
    case 'rs':
      return rust();
    case 'go':
      return go();
    default:
      return javascript();
  }
}