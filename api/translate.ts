// Vercel Serverless Function - API Proxy for DeepSeek
// This keeps the API key secure on the server side

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is not configured in environment variables');
    return res.status(500).json({ error: 'Translation service is not configured' });
  }

  const { text, systemPrompt } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const defaultSystemPrompt = 
    'You are a professional translator. Translate the following text into Simplified Chinese. Maintain the original formatting and tone.';

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt || defaultSystemPrompt },
          { role: 'user', content: text },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API Error:', errorData);
      return res.status(response.status).json({
        error: errorData.error?.message || 'Translation service error',
      });
    }

    const data = await response.json();
    return res.status(200).json({
      translatedText: data.choices[0].message.content,
    });
  } catch (error: any) {
    console.error('Translation proxy error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}
