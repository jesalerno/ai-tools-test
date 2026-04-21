/**
 * Request correlation ID middleware.
 * Attaches a unique ID to every request for log tracing per spec §7.
 */

import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

/** Attach a correlation ID to every request. */
export function correlationMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  req.correlationId = (req.headers['x-correlation-id'] as string | undefined) ?? uuidv4();
  next();
}
