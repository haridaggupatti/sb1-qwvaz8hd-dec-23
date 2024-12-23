// Speech recognition configuration and types
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

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
}

export function createSpeechRecognition(config: SpeechRecognitionConfig = DEFAULT_CONFIG) {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = config.continuous ?? DEFAULT_CONFIG.continuous;
  recognition.interimResults = config.interimResults ?? DEFAULT_CONFIG.interimResults;
  recognition.lang = config.lang ?? DEFAULT_CONFIG.lang;

  return recognition;
}

export function handleRecognitionError(error: string, retryCallback?: () => void) {
  const retryableErrors = ['network', 'no-speech', 'audio-capture'];
  
  if (retryableErrors.includes(error) && retryCallback) {
    retryCallback();
  }
  
  return retryableErrors.includes(error);
}