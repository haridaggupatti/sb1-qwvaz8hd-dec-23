export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  memoryUsage?: number;
  executionTime?: number;
  testResults?: TestResult[];
}

export interface TestResult {
  name: string;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string;
}

export interface ExecutionOptions {
  timeout?: number;
  memoryLimit?: number;
  testCases?: TestCase[];
  stdin?: string;
}

export interface TestCase {
  name: string;
  input: string;
  expectedOutput: string;
}

export interface CollaborationSession {
  id: string;
  users: string[];
  document: any; // Yjs document type
}