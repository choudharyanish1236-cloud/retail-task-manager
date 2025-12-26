
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSmartSuggestions(query: string, shopType: string = "General Retail") {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest product names and their typical HSN codes for a ${shopType} shop starting with or related to: "${query}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              hsn: { type: Type.STRING },
              category: { type: Type.STRING },
              estimatedRate: { type: Type.NUMBER }
            },
            required: ["name", "hsn"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return [];
  }
}

export async function parseVoiceCommand(transcript: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse this retail stock voice command: "${transcript}". Extract product details.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, description: "e.g. ADD_STOCK or REDUCE_STOCK" },
            productName: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
            rate: { type: Type.NUMBER }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Voice Parse Error:", error);
    return null;
  }
}
