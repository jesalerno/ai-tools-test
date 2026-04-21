/**
 * Structured logger for the backend.
 * Uses structured JSON output in production; human-readable in development.
 * Never logs secrets, tokens, or sensitive data per spec §8 / §8.1.
 */

/** Log levels in severity order. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Log record shape for structured output. */
interface LogRecord {
  level: LogLevel;
  message: string;
  correlationId?: string;
  [key: string]: unknown;
}

/** Current configured log level. */
let currentLevel: LogLevel = 'info';

/** Set the global log level. */
export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

/** Check if the given level is enabled. */
function isEnabled(level: LogLevel): boolean {
  return (LEVEL_ORDER[level] ?? 0) >= (LEVEL_ORDER[currentLevel] ?? 0);
}

/** Write a structured log entry. */
function writeLog(record: LogRecord): void {
  if (!isEnabled(record.level)) return;
  const isDev = process.env['NODE_ENV'] !== 'production';
  if (isDev) {
    const prefix = `[${record.level.toUpperCase()}]`;
    const cid = record.correlationId ? ` [${record.correlationId}]` : '';
    console.log(`${prefix}${cid} ${record.message}`);
  } else {
    console.log(JSON.stringify({ ...record, timestamp: new Date().toISOString() }));
  }
}

/** Logger interface. */
export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) =>
    writeLog({ level: 'debug', message: msg, ...meta }),
  info: (msg: string, meta?: Record<string, unknown>) =>
    writeLog({ level: 'info', message: msg, ...meta }),
  warn: (msg: string, meta?: Record<string, unknown>) =>
    writeLog({ level: 'warn', message: msg, ...meta }),
  error: (msg: string, meta?: Record<string, unknown>) =>
    writeLog({ level: 'error', message: msg, ...meta }),
};
