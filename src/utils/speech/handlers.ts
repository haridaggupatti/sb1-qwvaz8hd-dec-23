import { TranscriptManager } from '../transcript-manager';
import { SpeechRecognitionConfig } from './types';

export function setupRecognitionHandlers(
  recognition: any,
  config: SpeechRecognitionConfig,
  {
    onStart,
    onResult,
    onError,
    onEnd,
    transcriptManager
  }: {
    onStart: () => void;
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (error: any) => void;
    onEnd: () => void;
    transcriptManager: TranscriptManager;
  }
) {
  if (!recognition) return;

  recognition.onstart = () => {
    onStart();
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
      transcriptManager.append(finalTranscript);
      const fullTranscript = transcriptManager.getCurrentText();
      onResult(fullTranscript, true);
    } else if (interimTranscript) {
      const fullTranscript = transcriptManager.getFullTranscript(interimTranscript);
      onResult(fullTranscript, false);
    }
  };

  recognition.onerror = onError;
  recognition.onend = onEnd;
}