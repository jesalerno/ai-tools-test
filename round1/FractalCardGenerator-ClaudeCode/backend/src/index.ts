/**
 * Main entry point for backend service
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from './infrastructure/api/routes';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Rate limiting to prevent DoS
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: { success: false, error: 'Too many requests, please try again later.' }
});

app.use('/api', limiter);

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    statusCode: 500
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export default app;
