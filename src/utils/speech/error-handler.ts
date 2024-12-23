export type RetryCallback = () => void;

export function handleRecognitionError(error: string, retryCallback?: RetryCallback): boolean {
  const retryableErrors = ['network', 'no-speech', 'audio-capture'];
  
  if (retryableErrors.includes(error) && retryCallback) {
    retryCallback();
  }
  
  return retryableErrors.includes(error);
}

export function createRetryHandler(
  maxRetries: number,
  currentRetries: { current: number },
  onRetry: () => void
) {
  return () => {
    if (currentRetries.current < maxRetries) {
      currentRetries.current++;
      console.log(`Retrying speech recognition (attempt ${currentRetries.current}/${maxRetries})...`);
      onRetry();
    } else {
      console.error('Max retry attempts reached');
      currentRetries.current = 0;
    }
  };
}