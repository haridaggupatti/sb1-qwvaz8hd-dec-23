import { TestCase, TestResult } from '../../utils/code-execution/types';
import { CodeExecutor } from '../../utils/code-execution/executor';
import { openaiService } from '../openai';

export class TestService {
  async generateTestCases(code: string, language: string): Promise<TestCase[]> {
    try {
      const response = await openaiService.generateTestCases(code, language);
      return response.testCases;
    } catch (error) {
      console.error('Failed to generate test cases:', error);
      throw error;
    }
  }

  async runTests(code: string, language: string, testCases: TestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      try {
        const result = await CodeExecutor.execute(code, language, {
          stdin: testCase.input
        });

        results.push({
          name: testCase.name,
          passed: result.output?.trim() === testCase.expectedOutput.trim(),
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.output,
          error: result.error
        });
      } catch (error) {
        results.push({
          name: testCase.name,
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          error: error instanceof Error ? error.message : 'Test execution failed'
        });
      }
    }

    return results;
  }
}