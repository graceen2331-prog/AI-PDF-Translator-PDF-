export interface TranslationPage {
  id: number;
  originalText: string;
  translatedText: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  retryCount?: number;
}

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_MS = 1000; // 1 second base delay