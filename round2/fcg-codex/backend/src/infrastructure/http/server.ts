import { createApp } from './app.js';
import { loadEnv } from '../utils/env.js';

const config = loadEnv();
const app = createApp({
  bodySizeLimitMb: config.BODY_SIZE_LIMIT_MB,
  corsOrigins: config.CORS_ORIGINS.split(',').map((item) => item.trim()),
  rateLimitWindowMs: config.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: config.RATE_LIMIT_MAX,
});

app.listen(config.PORT, () => {
  console.info(JSON.stringify({ event: 'server_started', port: config.PORT }));
});
