/**
 * Server entry point.
 * Loads config, creates app, starts listening.
 */

import { loadConfig } from './config/env.js';
import { createApp } from './app.js';
import { logger } from './config/logger.js';
import { napiCanvasAdapter } from './canvas/adapter.js';

/** Start the HTTP server. */
function start(): void {
  try {
    const config = loadConfig();
    const app = createApp(config, napiCanvasAdapter);

    app.listen(config.port, () => {
      logger.info(`Server started on port ${config.port}`, {
        nodeEnv: config.nodeEnv,
        port: config.port,
      });
    });
  } catch (err) {
    logger.error('Failed to start server', { error: String(err) });
    process.exit(1);
  }
}

start();
