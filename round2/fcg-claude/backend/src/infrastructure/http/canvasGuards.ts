// Canvas memory pre-allocation guard (FCG-SPECv3 §8.1).
import type { AppConfig } from '../config/env.js';
import { ApiError } from './errors.js';

export { CARD_WIDTH_PX, CARD_HEIGHT_PX } from '../../domain/constants.js';

export const MAX_CANVAS_MEMORY_GUARD = (
  cfg: AppConfig,
  width: number,
  height: number,
): void => {
  const requiredBytes = width * height * 4;
  if (requiredBytes > cfg.maxCanvasMemoryBytes) {
    throw new ApiError(
      'CANVAS_MEMORY_EXCEEDED',
      413,
      `Canvas memory budget exceeded (${requiredBytes} > ${cfg.maxCanvasMemoryBytes})`,
    );
  }
};
