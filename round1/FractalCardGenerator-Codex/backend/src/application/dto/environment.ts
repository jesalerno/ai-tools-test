export interface EnvironmentConfig {
  port: number;
  nodeEnv: string;
  bodyLimitMb: number;
  allowedOrigin: string;
}

function parsePort(raw: string | undefined): number {
  const fallback = 8080;
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 65535) {
    return fallback;
  }

  return Math.floor(parsed);
}

function parseBodyLimit(raw: string | undefined): number {
  if (!raw) {
    return 1;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.max(1, Math.min(2, parsed));
}

export function readEnvironment(): EnvironmentConfig {
  return {
    port: parsePort(process.env.PORT),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    bodyLimitMb: parseBodyLimit(process.env.BODY_LIMIT_MB),
    allowedOrigin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000',
  };
}
