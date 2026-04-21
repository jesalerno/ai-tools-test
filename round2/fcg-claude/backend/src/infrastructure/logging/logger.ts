// Minimal structured JSON logger. Never logs raw secrets, tokens, or PII.
// Emits one JSON object per event to stdout (errors/warnings to stderr).
// Replaces pino to avoid CJS/ESM interop friction under NodeNext.

export interface LogFields {
  readonly [key: string]: unknown;
}

const REDACT_KEYS = new Set([
  'authorization',
  'cookie',
  'password',
  'token',
  'secret',
  'api_key',
]);

const redact = (fields: LogFields): LogFields => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] = REDACT_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : v;
  }
  return out;
};

const emit = (level: 'info' | 'warn' | 'error', fields: LogFields, msg?: string): void => {
  const entry = {
    level,
    time: new Date().toISOString(),
    service: 'fcg-claude-backend',
    ...redact(fields),
    ...(msg ? { msg } : {}),
  };
  const line = JSON.stringify(entry);
  if (level === 'info') {
    // eslint-disable-next-line no-console
    process.stdout.write(`${line}\n`);
  } else {
    process.stderr.write(`${line}\n`);
  }
};

export const logger = {
  info: (fields: LogFields, msg?: string): void => emit('info', fields, msg),
  warn: (fields: LogFields, msg?: string): void => emit('warn', fields, msg),
  error: (fields: LogFields, msg?: string): void => emit('error', fields, msg),
};
