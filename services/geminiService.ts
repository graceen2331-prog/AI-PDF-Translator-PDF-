import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const translateTextWithGemini = async (text: string): Promise<string> => {
  if (!text.trim()) return "";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional translator. Translate the following English text to Simplified Chinese (Zh-CN).
      
      Requirements:
      1. **Format**: Output in clean Markdown.
      2. **Layout**: Preserve the original structure (headers, lists, paragraphs). 
         - Use Markdown headers (#, ##) for titles/headings.
         - Use Markdown lists (-, 1.) for bullet points.
      3. **Style**: Use professional, natural, and accurate phrasing for documents.
      4. **Content**: Translate everything. Do not add notes, preambles, or "Here is the translation".
      
      Text to translate:
      """
      ${text}
      """`,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    throw new Error("Failed to translate text section.");
  }
};
