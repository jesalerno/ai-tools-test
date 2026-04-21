import type { FractalMethod, GenerateCardRequest, GenerateCardResponse } from "../shared/types.js";
import { FRACTAL_METHODS } from "../shared/types.js";
import { renderFractalCard } from "../domain/fractalRenderer.js";

const randomMethod = (seed: string): FractalMethod => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 33 + seed.charCodeAt(i)) | 0;
  return FRACTAL_METHODS[Math.abs(hash) % FRACTAL_METHODS.length];
};

export const generateCard = (request: GenerateCardRequest): GenerateCardResponse => {
  const seed = request.seed ?? crypto.randomUUID();
  const selectedMethod = request.method ?? randomMethod(seed);
  const start = performance.now();
  const render = renderFractalCard(selectedMethod, seed);
  const durationMs = Math.round(performance.now() - start);
  const warnings: string[] = [];
  if (render.coverage < 0.8) warnings.push("Coverage below 80% threshold after best-effort pass.");
  return {
    imageDataUri: render.imageDataUri,
    selectedMethod,
    seed,
    metadata: {
      durationMs,
      retries: 0,
      warnings,
      coverage: render.coverage,
      harmonyMode: render.harmonyMode
    }
  };
};
