import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { errorMiddleware, notFoundMiddleware } from '../middleware/error-middleware.js';
import { requestIdMiddleware } from '../middleware/request-id.js';
import { createRouter } from './routes.js';

export interface AppConfig {
  bodySizeLimitMb: number;
  corsOrigins: string[];
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

export function createApp(config: AppConfig): ReturnType<typeof express> {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestIdMiddleware);
  app.use(helmet({
    frameguard: { action: 'sameorigin' },
    noSniff: true,
    hsts: true,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'frame-ancestors': ["'self'"],
      },
    },
  }));

  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: `${config.bodySizeLimitMb}mb` }));
  app.use(rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
  }));

  app.use(createRouter());
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
