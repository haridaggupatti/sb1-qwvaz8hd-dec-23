import type { ExecutionResult, ExecutionOptions } from './types';
import { supportedLanguages } from './languages';

export class CodeExecutor {
  private static readonly JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';
  private static readonly API_KEY = 'b27c47c119mshb1837216f4678d0p19043bjsnac53b3c15a6d';
  private static readonly API_HOST = 'judge0-ce.p.rapidapi.com';

  private static readonly LANGUAGE_IDS = {
    javascript: 63,
    typescript: 74,
    python: 71,
    java: 62,
    cpp: 54,
    c: 50,
    rust: 73,
    go: 60,
    php: 68,
    ruby: 72,
    sql: 82,
    bash: 46,
    csharp: 51
  };

  static async execute(
    code: string, 
    language: string, 
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    const languageId = this.LANGUAGE_IDS[language.toLowerCase() as keyof typeof this.LANGUAGE_IDS];
    
    if (!languageId) {
      return {
        success: false,
        error: `Unsupported language: ${language}`
      };
    }

    // For JavaScript/TypeScript, use local execution
    if (language === 'javascript' || language === 'typescript') {
      return this.executeJavaScript(code);
    }

    try {
      const response = await fetch(`${this.JUDGE0_API}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': this.API_KEY,
          'X-RapidAPI-Host': this.API_HOST
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          stdin: options.stdin || '',
          cpu_time_limit: options.timeout || 2,
          memory_limit: options.memoryLimit || 128000,
          expected_output: null,
          enable_per_process_and_thread_time_limit: false,
          enable_per_process_and_thread_memory_limit: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit code');
      }

      const { token } = await response.json();
      const result = await this.pollExecutionResult(token);

      if (result.status.id > 3) {
        return {
          success: false,
          error: result.stderr || result.compile_output || 'Execution failed',
          memoryUsage: result.memory,
          executionTime: result.time
        };
      }

      return {
        success: true,
        output: result.stdout,
        memoryUsage: result.memory,
        executionTime: result.time
      };
    } catch (error) {
      console.error('Execution error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute code'
      };
    }
  }

  private static async pollExecutionResult(token: string, maxAttempts = 10): Promise<any> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(`${this.JUDGE0_API}/submissions/${token}`, {
        headers: {
          'X-RapidAPI-Key': this.API_KEY,
          'X-RapidAPI-Host': this.API_HOST
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch execution results');
      }

      const result = await response.json();
      
      if (result.status.id >= 3) {
        return result;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Execution timed out');
  }

  private static async executeJavaScript(code: string): Promise<ExecutionResult> {
    try {
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog.apply(console, args);
      };

      const startTime = performance.now();
      const result = await eval(`(async () => { ${code} })()`);
      const endTime = performance.now();

      console.log = originalLog;

      return {
        success: true,
        output: logs.join('\n') + (result !== undefined ? `\n${result}` : ''),
        executionTime: endTime - startTime,
        memoryUsage: 0 // Not available in browser
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed'
      };
    }
  }

  static getSupportedLanguages() {
    return Object.entries(supportedLanguages).map(([id, config]) => ({
      id,
      name: config.name,
      version: config.version
    }));
  }

  static getDefaultCode(language: string): string {
    return supportedLanguages[language]?.defaultCode || '';
  }
}