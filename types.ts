export interface TranslationPage {
  id: number;
  originalText: string;
  translatedText: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}