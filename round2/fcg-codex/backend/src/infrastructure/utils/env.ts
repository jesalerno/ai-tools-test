import AjvImport from 'ajv';

import { AppError } from './errors.js';

interface EnvConfig {
  PORT: number;
  BODY_SIZE_LIMIT_MB: number;
  MAX_GENERATION_MS: number;
  MAX_CANVAS_MEMORY_BYTES: number;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
  NODE_ENV: string;
  CORS_ORIGINS: string;
}

type AjvInstance = {
  compile: (schema: object) => (data: unknown) => boolean;
};

type AjvCtor = new (options: { allErrors: boolean }) => AjvInstance;
const Ajv = AjvImport as unknown as AjvCtor;

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile({
  type: 'object',
  properties: {
    PORT: { type: 'integer', minimum: 1 },
    BODY_SIZE_LIMIT_MB: { type: 'integer', minimum: 1 },
    MAX_GENERATION_MS: { type: 'integer', minimum: 1000 },
    MAX_CANVAS_MEMORY_BYTES: { type: 'integer', minimum: 1024 },
    RATE_LIMIT_WINDOW_MS: { type: 'integer', minimum: 1000 },
    RATE_LIMIT_MAX: { type: 'integer', minimum: 1 },
    NODE_ENV: { type: 'string' },
    CORS_ORIGINS: { type: 'string' }
  },
  required: ['PORT', 'BODY_SIZE_LIMIT_MB', 'MAX_GENERATION_MS', 'MAX_CANVAS_MEMORY_BYTES', 'RATE_LIMIT_WINDOW_MS', 'RATE_LIMIT_MAX', 'NODE_ENV', 'CORS_ORIGINS'],
  additionalProperties: true
});

export function loadEnv(): EnvConfig {
  const config: EnvConfig = {
    PORT: Number(process.env.PORT ?? '8085'),
    BODY_SIZE_LIMIT_MB: Number(process.env.BODY_SIZE_LIMIT_MB ?? '2'),
    MAX_GENERATION_MS: Number(process.env.MAX_GENERATION_MS ?? '15000'),
    MAX_CANVAS_MEMORY_BYTES: Number(process.env.MAX_CANVAS_MEMORY_BYTES ?? '134217728'),
    RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS ?? '60000'),
    RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX ?? '60'),
    NODE_ENV: process.env.NODE_ENV ?? 'production',
    CORS_ORIGINS: process.env.CORS_ORIGINS ?? 'http://localhost:3035',
  };

  if (!validate(config)) {
    throw new AppError('INVALID_ENV', 'Environment validation failed', 500);
  }

  return config;
}
