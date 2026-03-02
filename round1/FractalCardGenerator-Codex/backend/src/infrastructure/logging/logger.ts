export interface Logger {
  info: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
}

function format(message: string, meta?: Record<string, unknown>): string {
  if (!meta) {
    return message;
  }

  return `${message} ${JSON.stringify(meta)}`;
}

export const logger: Logger = {
  info(message, meta) {
    console.log(format(message, meta));
  },
  error(message, meta) {
    console.error(format(message, meta));
  },
};
