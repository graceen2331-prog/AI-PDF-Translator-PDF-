// services/geminiService.ts

export const translateTextWithGemini = async (text: string, prompt?: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
  
  if (!apiKey) {
    console.error("API Key is missing!"); 
    throw new Error("API Key is missing");
  }

  // 这里的 prompt 可以根据需要调整
  const systemPrompt = "You are a professional translator. Translate the following text into Simplified Chinese. Maintain the original formatting and tone.";

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("Translation Failed:", error);
    throw error;
  }
};
