import type { NextFunction, Request, Response } from 'express';

export function requestIdMiddleware(request: Request, response: Response, next: NextFunction): void {
  const requestId = request.header('x-request-id') ?? `req-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  response.setHeader('x-request-id', requestId);
  response.locals.requestId = requestId;
  next();
}
