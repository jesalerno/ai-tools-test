export class HttpError extends Error {
  readonly statusCode: number;
  readonly expose: boolean;

  constructor(statusCode: number, message: string, expose = true) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.expose = expose;
  }
}

export class ValidationError extends HttpError {
  constructor(message: string) {
    super(400, message, true);
    this.name = 'ValidationError';
  }
}

export class TimeoutError extends HttpError {
  constructor() {
    super(408, 'Fractal generation timed out. Try lower iterations or a different method.', true);
    this.name = 'TimeoutError';
  }
}

export class DependencyError extends HttpError {
  constructor(message = 'Required runtime dependency is missing.') {
    super(500, message, false);
    this.name = 'DependencyError';
  }
}
