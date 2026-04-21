// Card geometry and rendering budget constants.
// Card physical dims: 2.5" x 3.5" at 300 DPI → 750 x 1050 px (FCG-SPECv3 §3.1).
// Border: 3mm at 300 DPI ≈ 35 px (rounded). Quadrant = inner / 2.

export const DPI = 300;
export const CARD_WIDTH_PX = 750;
export const CARD_HEIGHT_PX = 1050;
export const BORDER_PX = 35;
export const CORNER_RADIUS_PX = 24;

export const INNER_WIDTH = CARD_WIDTH_PX - 2 * BORDER_PX;
export const INNER_HEIGHT = CARD_HEIGHT_PX - 2 * BORDER_PX;
export const QUADRANT_WIDTH = INNER_WIDTH / 2;
export const QUADRANT_HEIGHT = INNER_HEIGHT / 2;

// Iteration and coverage budgets (FCG-SPECv3 §5.1, §3.3).
export const MIN_ITERATIONS = 500;
export const MAX_ITERATIONS = 2000;
export const DEFAULT_ITERATIONS = 1200;
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 4.0;
export const DEFAULT_ZOOM = 1.6;
export const COVERAGE_THRESHOLD = 0.8;
export const MAX_COVERAGE_RETRIES = 2;

// Method-specific safety caps (FCG-SPECv3 §3.4, §5.3).
export const FLAME_WARMUP_ITER = 40;
export const IFS_CHAOS_ITER_PER_PIXEL = 60;
export const L_SYSTEM_MAX_DEPTH = 10;
export const ATTRACTOR_ITER_PER_PIXEL = 40;

// JPEG output quality (@napi-rs/canvas takes 0–100 for JPEG).
export const JPEG_QUALITY = 92;
