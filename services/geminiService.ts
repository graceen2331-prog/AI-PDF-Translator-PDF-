// services/geminiService.ts (实际上换成了 DeepSeek)

export const streamGeminiResponse = async (
  prompt: string,
  onChunk: (chunk: string) => void
) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // 这里我们在 Vercel 里填 DeepSeek 的 Key 即可
  
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat", // DeepSeek V3 模型
        messages: [
          {
            role: "system",
            content: "You are an expert frontend developer. You generate complete, runnable HTML/JS code using Tailwind CSS. Do not include markdown backticks (```). Just output the raw code. Ensure the code works in a standalone environment."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        stream: true, // 开启流式输出
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API Error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("No reader available");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || "";
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            console.error("Error parsing stream:", e);
          }
        }
      }
    }
  } catch (error) {
    console.error("DeepSeek Request Failed:", error);
    throw error;
  }
};
