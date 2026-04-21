import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { handleGenerate } from '../application/generate-handler.js';
const app = express();
app.disable('x-powered-by');
const limitMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
const limitMax = Number(process.env.RATE_LIMIT_MAX || 60);
app.use(cors());
app.use(express.json({ limit: process.env.BODY_SIZE_LIMIT_MB ? `${process.env.BODY_SIZE_LIMIT_MB}mb` : '2mb' }));
const generateLimiter = rateLimit({
    windowMs: limitMs,
    max: limitMax,
    message: { error: 'RATE_LIMIT', message: 'Too many requests' }
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.post('/api/cards/generate', generateLimiter, async (req, res) => {
    try {
        const start = Date.now();
        const result = await handleGenerate(req.body);
        const durationMs = Date.now() - start;
        const dataUri = `data:image/jpeg;base64,${result.buffer.toString('base64')}`;
        res.json({
            imageUri: dataUri,
            method: result.method,
            seed: result.seed,
            metadata: {
                durationMs,
                retries: 0,
                warnings: []
            }
        });
    }
    catch (err) {
        if (err.message.includes('Validation Error')) {
            res.status(400).json({ error: 'BAD_REQUEST', message: err.message });
        }
        else {
            console.error(err);
            res.status(500).json({ error: 'INTERNAL_ERROR', message: 'An internal error occurred during generation' });
        }
    }
});
app.use((req, res) => {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Route not found' });
});
const PORT = process.env.PORT || 8095;
app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
