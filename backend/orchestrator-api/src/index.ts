import express, { Request, Response } from "express";
import { decideIntentWithGemini } from "./geminiIntent";
import {
  handlePremiumByEmail,
  handlePremiumByRequestId,
  handleVehicleFactorByRequestId
} from "./orchestrator";

const app = express();
app.use(express.json());

// Comentario en español: endpoint principal tipo "chat"
app.post("/chat", async (req: Request, res: Response) => {
  const { question } = req.body as { question: string };

  if (!question) {
    return res.status(400).json({ error: "Missing question" });
  }

  try {
    const intent = await decideIntentWithGemini(question);

    switch (intent.type) {
      case "premium_by_request_id": {
        const message = await handlePremiumByRequestId(intent.requestId);
        return res.json({ answer: message, intent });
      }
      case "premium_by_email": {
        const message = await handlePremiumByEmail(intent.email);
        return res.json({ answer: message, intent });
      }
      case "vehicle_factor_by_request_id": {
        const message = await handleVehicleFactorByRequestId(
          intent.requestId
        );
        return res.json({ answer: message, intent });
      }
      default:
        return res.json({
          answer:
            "Por ahora solo entiendo preguntas sobre prima o factor del vehículo indicando número de solicitud o correo.",
          intent
        });
      }
  } catch (error) {
    console.error("[Orchestrator API] Error en /chat:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Orchestrator API running on port ${PORT}`);
});
