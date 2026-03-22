export interface HealthPayload {
  status: "ok";
  timestamp: string;
}

export function healthStatus(): HealthPayload {
  return { status: "ok", timestamp: new Date().toISOString() };
}
