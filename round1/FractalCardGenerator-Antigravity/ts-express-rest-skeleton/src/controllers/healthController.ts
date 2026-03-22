import type { Request, Response } from "express";

import { healthStatus } from "../services/healthService.js";

export function getHealth(_req: Request, res: Response): void {
  const payload = healthStatus();
  res.status(200).json(payload);
}
