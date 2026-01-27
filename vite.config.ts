import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Proxy API requests to Vercel dev server in local development
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
        },
      },
      plugins: [
        react(),
        // Local API middleware for development without Vercel CLI
        {
          name: 'api-middleware',
          configureServer(server) {
            server.middlewares.use('/api/translate', async (req, res, next) => {
              if (req.method !== 'POST') {
                return next();
              }
              
              const apiKey = env.DEEPSEEK_API_KEY;
              if (!apiKey) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'DEEPSEEK_API_KEY not configured in .env' }));
                return;
              }

              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const { text, systemPrompt } = JSON.parse(body);
                  const defaultPrompt = 'You are a professional translator. Translate the following text into Simplified Chinese. Maintain the original formatting and tone.';
                  
                  const response = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                      model: 'deepseek-chat',
                      messages: [
                        { role: 'system', content: systemPrompt || defaultPrompt },
                        { role: 'user', content: text },
                      ],
                      stream: false,
                    }),
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    res.statusCode = response.status;
                    res.end(JSON.stringify({ error: errorData.error?.message || 'API error' }));
                    return;
                  }

                  const data = await response.json();
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ translatedText: data.choices[0].message.content }));
                } catch (err: any) {
                  console.error('API middleware error:', err);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
            });
          },
        },
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
