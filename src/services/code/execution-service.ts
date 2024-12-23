import { CodeExecutor } from '../../utils/code-execution/executor';
import { ExecutionResult } from '../../utils/code-execution/types';

export class ExecutionService {
  private executionQueue: Map<string, Promise<ExecutionResult>> = new Map();
  private readonly THROTTLE_MS = 1000;

  async execute(code: string, language: string): Promise<ExecutionResult> {
    const key = `${language}:${code}`;
    
    // Check if execution is already in progress
    if (this.executionQueue.has(key)) {
      return this.executionQueue.get(key)!;
    }

    // Add to queue and execute
    const execution = this.executeWithThrottle(code, language);
    this.executionQueue.set(key, execution);

    try {
      const result = await execution;
      return result;
    } finally {
      // Cleanup queue after execution
      setTimeout(() => {
        this.executionQueue.delete(key);
      }, this.THROTTLE_MS);
    }
  }

  private async executeWithThrottle(code: string, language: string): Promise<ExecutionResult> {
    await new Promise(resolve => setTimeout(resolve, this.THROTTLE_MS));
    return CodeExecutor.execute(code, language);
  }

  getLanguages() {
    return CodeExecutor.getSupportedLanguages();
  }
}