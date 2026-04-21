/**
 * Environment configuration module.
 * Loads and validates all environment variables at startup.
 * Per spec §8.1 and §14 for required env vars.
 */

/** Application configuration loaded from environment. */
export interface AppConfig {
  port: number;
  bodySizeLimitMb: number;
  maxGenerationMs: number;
  maxCanvasMemoryBytes: number;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  nodeEnv: string;
  corsOrigins: string[];
}

/** Parse a positive integer env var; throw on invalid. */
function requirePositiveInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error(`Invalid environment variable ${name}: must be a positive integer, got "${raw}"`);
  }
  return parsed;
}

/** Parse a positive float env var; throw on invalid. */
function requirePositiveFloat(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = parseFloat(raw);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error(`Invalid environment variable ${name}: must be a positive number, got "${raw}"`);
  }
  return parsed;
}

/**
 * Load and validate application configuration from environment variables.
 * Throws if any required variable is invalid.
 */
export function loadConfig(): AppConfig {
  const port = requirePositiveInt('PORT', 8080);
  const bodySizeLimitMb = requirePositiveFloat('BODY_SIZE_LIMIT_MB', 2);
  const maxGenerationMs = requirePositiveInt('MAX_GENERATION_MS', 15000);
  const maxCanvasMemoryBytes = requirePositiveInt('MAX_CANVAS_MEMORY_BYTES', 134217728);
  const rateLimitWindowMs = requirePositiveInt('RATE_LIMIT_WINDOW_MS', 60000);
  const rateLimitMax = requirePositiveInt('RATE_LIMIT_MAX', 60);
  const nodeEnv = process.env['NODE_ENV'] ?? 'development';

  // CORS: explicit allowlist; no wildcard per spec §8
  const rawOrigins = process.env['CORS_ORIGINS'] ?? 'http://localhost:3000';
  const corsOrigins = rawOrigins.split(',').map((s) => s.trim()).filter(Boolean);

  return {
    port,
    bodySizeLimitMb,
    maxGenerationMs,
    maxCanvasMemoryBytes,
    rateLimitWindowMs,
    rateLimitMax,
    nodeEnv,
    corsOrigins,
  };
}
