import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { generateCard } from "../application/generateCardUseCase.js";
import { validateGenerateRequest } from "../application/validation.js";
import { env } from "./env.js";

const openapi = {
  openapi: "3.0.3",
  info: { title: "Fractal Card Generator API", version: "1.0.0" },
  paths: {
    "/api/health": { get: { responses: { "200": { description: "Service healthy" } } } },
    "/api/cards/generate": { post: { responses: { "200": { description: "Generated card" } } } }
  }
};

export const buildApp = () => {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: `${env.bodySizeLimitMb}mb` }));
  app.use(
    cors({
      origin: [env.frontendOrigin]
    })
  );
  app.use(
    rateLimit({
      windowMs: env.rateLimitWindowMs,
      max: env.rateLimitMax
    })
  );

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/openapi.json", (_req, res) => {
    res.json(openapi);
  });

  app.post("/api/cards/generate", async (req, res, next) => {
    try {
      const validated = validateGenerateRequest(req.body ?? {});
      if (!validated.ok) {
        res.status(400).json({ error: "VALIDATION_ERROR", message: validated.message });
        return;
      }
      const result = await Promise.race([
        Promise.resolve(generateCard(validated.value)),
        new Promise<never>((_resolve, reject) =>
          setTimeout(() => reject(new Error("Generation timeout exceeded.")), env.maxGenerationMs)
        )
      ]);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "NOT_FOUND", message: "Requested endpoint does not exist." });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    res.status(500).json({ error: "INTERNAL_ERROR", message });
  });

  return app;
};
