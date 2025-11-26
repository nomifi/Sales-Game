
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT_TEMPLATE } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const submitFlowFeedback = async (status: 'Correct' | 'Incorrect', feedback: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Error: API Key missing. Unable to contact Sales Ops.";

  const filledPrompt = SYSTEM_PROMPT_TEMPLATE
    .replace("{status}", status)
    .replace("{feedback}", feedback || "No specific details provided.");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: filledPrompt,
      config: {
        maxOutputTokens: 150,
        temperature: 0.7,
      }
    });

    return response.text || "Feedback received. Updating the playbook.";
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return "Thanks for your feedback! Our sales enablement team will review it.";
  }
};
