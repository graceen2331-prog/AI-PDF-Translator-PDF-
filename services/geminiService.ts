// services/translationService.ts
// Calls the backend proxy to protect API keys

export const translateText = async (text: string, systemPrompt?: string): Promise<string> => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Translation failed');
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation Failed:', error);
    throw error;
  }
};

// Legacy export name for backward compatibility
export const translateTextWithGemini = translateText;
