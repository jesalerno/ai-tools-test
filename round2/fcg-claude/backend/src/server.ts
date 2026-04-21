// Entry point. Load config, build app, start listening.
import { loadConfig } from './infrastructure/config/env.js';
import { createApp } from './infrastructure/http/app.js';
import { logger } from './infrastructure/logging/logger.js';

const config = loadConfig();
const app = createApp(config);

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.nodeEnv }, 'fcg-claude backend listening');
});

const shutdown = (signal: string): void => {
  logger.info({ signal }, 'Shutting down');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
