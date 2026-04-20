// Express server entry point
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { generateHandler } from './routes/generate.js';
import { healthHandler } from './routes/health.js';
import { errorMiddleware } from './errorMiddleware.js';
import { logger } from './logger.js';
const PORT = parseInt(process.env['PORT'] ?? '8080', 10);
const BODY_LIMIT_MB = parseInt(process.env['BODY_SIZE_LIMIT_MB'] ?? '2', 10);
const CORS_ORIGIN = process.env['CORS_ORIGIN'] ?? 'http://localhost:3000';
const RATE_WINDOW_MS = parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '60000', 10);
const RATE_MAX = parseInt(process.env['RATE_LIMIT_MAX'] ?? '60', 10);
const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: `${BODY_LIMIT_MB}mb` }));
// Prevent all API responses from being cached
app.use('/api/', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});
const limiter = rateLimit({
    windowMs: RATE_WINDOW_MS,
    max: RATE_MAX,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
app.post('/api/cards/generate', (req, res, next) => { void generateHandler(req, res, next); });
app.get('/api/health', healthHandler);
app.use((_req, res) => {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Route not found.' });
});
app.use(errorMiddleware);
app.listen(PORT, () => {
    logger.info('server', `FCG backend started on port ${PORT}`);
});
export { app };
//# sourceMappingURL=server.js.map