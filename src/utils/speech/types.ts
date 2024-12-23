export interface SpeechRecognitionConfig {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export const DEFAULT_CONFIG: SpeechRecognitionConfig = {
  continuous: true,
  interimResults: true,
  lang: 'en-US',
  maxRetries: 3,
  retryDelayMs: 1000,
};