import type {NextFunction, Request, Response} from 'express';

export function requestId(_req: Request, res: Response, next: NextFunction): void {
  const random = Math.random().toString(16).slice(2, 10);
  const id = `${Date.now().toString(36)}-${random}`;
  res.setHeader('x-request-id', id);
  next();
}
