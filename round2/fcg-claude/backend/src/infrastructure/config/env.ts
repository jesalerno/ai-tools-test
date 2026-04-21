// Environment configuration: parse once at boot, expose a typed object.
// Per FCG-SPECv3 §14 and ENVIRONMENT_SETUP.md §3.

import 'dotenv/config';

export interface AppConfig {
  readonly port: number;
  readonly nodeEnv: 'production' | 'development' | 'test';
  readonly bodySizeLimitMb: number;
  readonly maxGenerationMs: number;
  readonly maxCanvasMemoryBytes: number;
  readonly rateLimitWindowMs: number;
  readonly rateLimitMax: number;
  readonly corsOrigins: readonly string[];
}

const parseInt10 = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const parseOrigins = (value: string | undefined): readonly string[] => {
  if (!value) return ['http://localhost:3040'];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const parseNodeEnv = (value: string | undefined): AppConfig['nodeEnv'] => {
  if (value === 'production' || value === 'development' || value === 'test') return value;
  return 'production';
};

export const loadConfig = (): AppConfig => ({
  port: parseInt10(process.env['PORT'], 8040),
  nodeEnv: parseNodeEnv(process.env['NODE_ENV']),
  bodySizeLimitMb: parseInt10(process.env['BODY_SIZE_LIMIT_MB'], 2),
  maxGenerationMs: parseInt10(process.env['MAX_GENERATION_MS'], 15_000),
  maxCanvasMemoryBytes: parseInt10(process.env['MAX_CANVAS_MEMORY_BYTES'], 134_217_728),
  rateLimitWindowMs: parseInt10(process.env['RATE_LIMIT_WINDOW_MS'], 60_000),
  rateLimitMax: parseInt10(process.env['RATE_LIMIT_MAX'], 60),
  corsOrigins: parseOrigins(process.env['CORS_ORIGIN']),
});
