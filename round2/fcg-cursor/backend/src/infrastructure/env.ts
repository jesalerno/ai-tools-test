const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: toInt(process.env.PORT, 8090),
  bodySizeLimitMb: toInt(process.env.BODY_SIZE_LIMIT_MB, 2),
  maxGenerationMs: toInt(process.env.MAX_GENERATION_MS, 15000),
  maxCanvasMemoryBytes: toInt(process.env.MAX_CANVAS_MEMORY_BYTES, 128 * 1024 * 1024),
  rateLimitWindowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 60000),
  rateLimitMax: toInt(process.env.RATE_LIMIT_MAX, 60),
  nodeEnv: process.env.NODE_ENV ?? "development",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3090"
};
