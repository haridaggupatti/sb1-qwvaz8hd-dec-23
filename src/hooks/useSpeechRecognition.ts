import { useState, useRef, useEffect } from 'react';
import { 
  SpeechRecognitionConfig, 
  DEFAULT_CONFIG,
  createSpeechRecognition,
  handleRecognitionError,
  isSpeechRecognitionSupported
} from '../utils/speech-recognition';
import { TranscriptManager } from '../utils/transcript-manager';

interface SpeechRecognitionHookProps extends SpeechRecognitionConfig {
  onTranscriptChange?: (transcript: string, isFinal: boolean) => void;
}

export function useSpeechRecognition({
  onTranscriptChange,
  ...config
}: SpeechRecognitionHookProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const transcriptManagerRef = useRef(new TranscriptManager());
  const retryTimeoutRef = useRef<number | undefined>();
  const retryCountRef = useRef(0);

  const maxRetries = config.maxRetries ?? DEFAULT_CONFIG.maxRetries;
  const retryDelayMs = config.retryDelayMs ?? DEFAULT_CONFIG.retryDelayMs;

  const handleRetry = () => {
    if (retryCountRef.current < maxRetries!) {
      retryCountRef.current++;
      console.log(`Retrying speech recognition (attempt ${retryCountRef.current}/${maxRetries})...`);
      
      retryTimeoutRef.current = window.setTimeout(() => {
        if (isListening) {
          try {
            recognitionRef.current = createSpeechRecognition(config);
            setupRecognitionHandlers(recognitionRef.current);
            recognitionRef.current?.start();
          } catch (e) {
            console.error('Failed to restart recognition:', e);
            setIsListening(false);
          }
        }
      }, retryDelayMs! * retryCountRef.current);
    } else {
      console.error('Max retry attempts reached');
      setIsListening(false);
      retryCountRef.current = 0;
    }
  };

  const setupRecognitionHandlers = (recognition: any) => {
    if (!recognition) return;

    recognition.onstart = () => {
      setIsListening(true);
      retryCountRef.current = 0;
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript = transcript;
        } else {
          interimTranscript = transcript;
        }
      }

      if (finalTranscript) {
        transcriptManagerRef.current.append(finalTranscript);
        const fullTranscript = transcriptManagerRef.current.getCurrentText();
        setTranscript(fullTranscript);
        onTranscriptChange?.(fullTranscript, true);
      } else if (interimTranscript) {
        const fullTranscript = transcriptManagerRef.current.getFullTranscript(interimTranscript);
        setTranscript(fullTranscript);
        onTranscriptChange?.(fullTranscript, false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (handleRecognitionError(event.error, handleRetry)) {
        // Error is being handled by retry mechanism
        return;
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
          handleRecognitionError('restart-error', handleRetry);
        }
      }
    };
  };

  useEffect(() => {
    if (!isSpeechRecognitionSupported()) return;

    recognitionRef.current = createSpeechRecognition(config);
    setupRecognitionHandlers(recognitionRef.current);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [isListening, config, onTranscriptChange]);

  const startListening = () => {
    if (!isSpeechRecognitionSupported() || !recognitionRef.current) return;
    try {
      transcriptManagerRef.current.clear();
      retryCountRef.current = 0;
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      handleRecognitionError('start-error', handleRetry);
    }
  };

  const stopListening = () => {
    if (!isSpeechRecognitionSupported() || !recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  };

  const clearTranscript = () => {
    transcriptManagerRef.current.clear();
    setTranscript('');
    if (onTranscriptChange) {
      onTranscriptChange('', true);
    }
  };

  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    isSupported: isSpeechRecognitionSupported(),
    clearTranscript,
  };
}