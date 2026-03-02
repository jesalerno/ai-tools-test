export class TimeBudgetExceededError extends Error {
  constructor() {
    super('Generation exceeded maximum allowed time.');
    this.name = 'TimeBudgetExceededError';
  }
}

export interface TimeBudget {
  deadlineMs: number;
  assertWithinBudget: () => void;
}

export function createTimeBudget(timeoutMs: number): TimeBudget {
  const deadlineMs = Date.now() + timeoutMs;

  const assertWithinBudget = (): void => {
    if (Date.now() > deadlineMs) {
      throw new TimeBudgetExceededError();
    }
  };

  return {deadlineMs, assertWithinBudget};
}
