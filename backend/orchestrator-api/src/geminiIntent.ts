import { GoogleGenAI } from "@google/genai";

export type ParsedIntent =
  | { type: "premium_by_request_id"; requestId: string }
  | { type: "premium_by_email"; email: string }
  | { type: "vehicle_factor_by_request_id"; requestId: string }
  | { type: "unknown" };

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("[Gemini] GEMINI_API_KEY no está definida, el orquestador no podrá llamar a Gemini.");
}

const ai = new GoogleGenAI({ apiKey });
const MODEL_NAME = "gemini-2.5-flash";

export async function decideIntentWithGemini(question: string): Promise<ParsedIntent> {
  const systemPrompt = `
Eres un orquestador para un sistema de seguros de autos.
Tu única tarea es LEER la pregunta del usuario y devolver exclusivamente un JSON válido con una intención.
`;
  if (!apiKey) return { type:"unknown" };

  const contents = `${systemPrompt}

PREGUNTA DEL USUARIO:
${question}
`;

  const response = await ai.models.generateContent({ model: MODEL_NAME, contents });
  const text = (response as any).text ?? (response as any).response?.text;
  try { return JSON.parse(text) as ParsedIntent; } catch { return {type:"unknown"}; }
}
