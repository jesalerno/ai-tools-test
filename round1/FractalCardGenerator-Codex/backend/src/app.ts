import cors, {type CorsOptions} from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';

import type {CardRendererPort} from './application/services/cardRendererPort';
import {CardGenerationService} from './application/services/cardGenerationService';
import {readEnvironment} from './application/dto/environment';
import {createCardController} from './controllers/cardController';
import {CanvasCardRenderer} from './infrastructure/canvas/cardRenderer';
import {errorHandler} from './middleware/errorHandler';
import {notFound} from './middleware/notFound';
import {requestId} from './middleware/requestId';
import {createCardRouter} from './routes/cards';
import {healthRouter} from './routes/health';

export interface AppDependencies {
  renderer?: CardRendererPort;
}

function buildCorsConfig(nodeEnv: string, allowedOrigin: string): CorsOptions {
  if (nodeEnv === 'production') {
    return {origin: false};
  }

  return {
    origin: [allowedOrigin, 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  };
}

export function createApp(dependencies: AppDependencies = {}): express.Express {
  const environment = readEnvironment();
  const app = express();
  const renderer = dependencies.renderer ?? new CanvasCardRenderer();
  const service = new CardGenerationService(renderer);
  const controller = createCardController(service);

  app.disable('x-powered-by');

  app.use(requestId);
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 60,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
  app.use(cors(buildCorsConfig(environment.nodeEnv, environment.allowedOrigin)));
  app.use(express.json({limit: `${environment.bodyLimitMb}mb`}));

  app.get('/api', (_req, res) => {
    res.status(200).json({name: 'fractal-card-generator-api', status: 'ok'});
  });

  app.use('/api/health', healthRouter);
  app.use('/api/cards', createCardRouter(controller));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
