import { GoogleGenAI } from "@google/genai";

function cleanMarkdownBlocks(text: string): string {
  return text
    .replace(/```json/gi, "") // Elimina ```json
    .replace(/```/g, "")      // Elimina ```
    .trim();                  // Elimina espacios
}

export type ParsedIntent =
  | { type: "premium_by_request_id"; requestId: string }
  | { type: "premium_by_email"; email: string }
  | { type: "vehicle_factor_by_request_id"; requestId: string }
  | { type: "unknown" };

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ ...(apiKey ? { apiKey } : {}) });

const MODEL_NAME = "gemini-2.5-flash";

export async function decideIntentWithGemini(
  question: string
): Promise<ParsedIntent> {
  // 🔥 PROMPT MÁS DIRECTO Y ROBUSTO
  const contents = `
Eres un sistema de orquestación de seguros de autos.
Debes analizar la pregunta y devolver **SOLO** un JSON válido con una de estas estructuras:

### Para calcular prima por ID de solicitud ###
{
  "type": "premium_by_request_id",
  "requestId": "34234"
}

### Para calcular prima por correo ###
{
  "type": "premium_by_email",
  "email": "foo@gmail.com"
}

### Para factor del vehículo ###
{
  "type": "vehicle_factor_by_request_id",
  "requestId": "34234"
}

### Si no entiendes ###
{
  "type": "unknown"
}

👉 **IMPORTANTE**: Responde SOLO el JSON. NO EXPLIQUES NADA MÁS.

Pregunta del usuario:
${question}
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents
    });

    // Distintos formatos de respuesta posibles (dependiendo del SDK)
    const rawText =
      (response as any).text ??
      (response as any).response?.text ??
      (response as any).candidates?.[0]?.content?.parts?.[0]?.text ??
      "";

      const text = cleanMarkdownBlocks(rawText);

    // Intentamos parsear JSON
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.type === "string") {
        return parsed as ParsedIntent;
      }
    } catch {
      console.log("Respuesta no válida, ignorada.");
      /* no válido, ignoramos */
    }

    return { type: "unknown" };
  } catch (err) {
    console.error("[Gemini] Error llamando al modelo:", err);
    return { type: "unknown" };
  }
}
