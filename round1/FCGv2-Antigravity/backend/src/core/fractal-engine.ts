import { FractalConfig, FractalMethod } from '../shared/types';
import { CanvasRenderer } from './canvas-renderer';
import { CanvasRenderingContext2D } from 'canvas';

// --- Types & Interfaces ---

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

type PixelCalculator = (
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
  maxIter: number
) => RGBA;

// --- Helper Functions ---

function map(
  val: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((val - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// --- Core Rendering Engine (Strategy Pattern) ---

/**
 * Generic renderer for pixel-grid based fractals (Mandelbrot, Julia, etc.)
 * Eliminates the duplicated x/y loops and buffer management.
 */
async function renderPixelGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number,
  maxIter: number,
  calculator: PixelCalculator
) {
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const color = calculator(x, y, w, h, seed, maxIter);
      const cell = (x + y * w) * 4;
      data[cell] = color.r;
      data[cell + 1] = color.g;
      data[cell + 2] = color.b;
      data[cell + 3] = color.a;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

// --- Fractal Implementations ---

// 1. Mandelbrot
const calculateMandelbrot: PixelCalculator = (x, y, w, h, seed, maxIter) => {
  const zoom = 0.5 + (seed % 10) * 0.2;
  const panX = -0.5;
  const panY = 0;

  const cx = map(x, 0, w, -2.5 / zoom + panX, 1 / zoom + panX);
  const cy = map(y, 0, h, -1 / zoom + panY, 1 / zoom + panY);

  let zx = 0;
  let zy = 0;
  let iter = 0;

  while (zx * zx + zy * zy < 4 && iter < maxIter) {
    const tmp = zx * zx - zy * zy + cx;
    zy = 2 * zx * zy + cy;
    zx = tmp;
    iter++;
  }

  if (iter === maxIter) return { r: 0, g: 0, b: 0, a: 255 };
  const c = (iter * 10) % 255;
  return { r: c, g: (c * 2) % 255, b: (c * 5) % 255, a: 255 };
};

// 2. Julia
const calculateJulia: PixelCalculator = (x, y, w, h, seed, maxIter) => {
  const cx = Math.sin(seed / 100) * 0.7;
  const cy = Math.cos(seed / 100) * 0.7;

  let zx = map(x, 0, w, -1.5, 1.5);
  let zy = map(y, 0, h, -1.5, 1.5);
  let iter = 0;

  while (zx * zx + zy * zy < 4 && iter < maxIter) {
    const tmp = zx * zx - zy * zy + cx;
    zy = 2 * zx * zy + cy;
    zx = tmp;
    iter++;
  }

  if (iter === maxIter) return { r: 0, g: 0, b: 0, a: 255 };
  return {
    r: (iter * 8) % 255,
    g: (iter * 4) % 255,
    b: (iter * 12) % 255,
    a: 255,
  };
};

// 3. Burning Ship
const calculateBurningShip: PixelCalculator = (x, y, w, h, seed, maxIter) => {
  const cx = map(x, 0, w, -1.8, -1.7);
  const cy = map(y, 0, h, -0.08, 0.01);

  let zx = 0;
  let zy = 0;
  let iter = 0;

  while (zx * zx + zy * zy < 4 && iter < maxIter) {
    const tmp = zx * zx - zy * zy + cx;
    zy = Math.abs(2 * zx * zy) + cy;
    zx = Math.abs(tmp);
    iter++;
  }

  if (iter === maxIter) return { r: 0, g: 0, b: 0, a: 255 };
  return { r: 255, g: (iter * 10) % 255, b: 0, a: 255 }; // Fire colors
};

// 4. Newton
const calculateNewton: PixelCalculator = (x, y, w, h, seed, maxIter) => {
  const zoom = 0.5 + (seed % 10) * 0.1;
  let zx = map(x, 0, w, -2 / zoom, 2 / zoom);
  let zy = map(y, 0, h, -2 / zoom, 2 / zoom);
  let iter = 0;
  const tolerance = 0.000001;
  let root = 0;

  while (iter < maxIter) {
    const zx2 = zx * zx - zy * zy;
    const zy2 = 2 * zx * zy;
    const modSq = zx2 * zx2 + zy2 * zy2;

    if (modSq < tolerance) break;

    const invZ2x = zx2 / modSq;
    const invZ2y = -zy2 / modSq;

    const nextZx = (2 * zx + invZ2x) / 3;
    const nextZy = (2 * zy + invZ2y) / 3;

    const dx = nextZx - zx;
    const dy = nextZy - zy;

    if (dx * dx + dy * dy < tolerance) {
      if (Math.abs(nextZx - 1) < 0.1) root = 1;
      else if (Math.abs(nextZx + 0.5) < 0.1 && nextZy > 0) root = 2;
      else if (Math.abs(nextZx + 0.5) < 0.1 && nextZy < 0) root = 3;
      break;
    }

    zx = nextZx;
    zy = nextZy;
    iter++;
  }

  if (root === 1) return { r: 255, g: iter * 10, b: iter * 5, a: 255 };
  if (root === 2) return { r: iter * 5, g: 255, b: iter * 10, a: 255 };
  if (root === 3) return { r: iter * 10, g: iter * 5, b: 255, a: 255 };
  return { r: 0, g: 0, b: 0, a: 255 };
};

// 5. Lyapunov
const calculateLyapunov: PixelCalculator = (x, y, w, h, seed, maxIter) => {
  // Zupan Sequence cache could be optimized but minimal impact here
  const sequence: string[] = [];
  for (let i = 0; i < 6; i++) {
    sequence.push(Math.floor(seed / Math.pow(2, i)) % 2 === 0 ? 'A' : 'B');
  }

  const aVal = map(x, 0, w, 3.4, 4.0);
  const bVal = map(y, 0, h, 3.4, 4.0);

  let xn = 0.5;
  let sumLogDeriv = 0;

  // Warmup
  for (let i = 0; i < 20; i++) {
    const r = sequence[i % sequence.length] === 'A' ? aVal : bVal;
    xn = r * xn * (1 - xn);
  }

  const N = 50;
  for (let i = 0; i < N; i++) {
    const r = sequence[i % sequence.length] === 'A' ? aVal : bVal;
    const d = Math.abs(r * (1 - 2 * xn));
    if (d > 0) {
      sumLogDeriv += Math.log(d);
    }
    xn = r * xn * (1 - xn);
  }

  const lambda = sumLogDeriv / N;

  if (lambda > 0) {
    return {
      r: 0,
      g: 0,
      b: Math.max(0, 255 - Math.floor(lambda * 100)) % 255,
      a: 255,
    };
  } else {
    return {
      r: 255,
      g: (255 + Math.floor(lambda * 100)) % 255,
      b: 0,
      a: 255,
    };
  }
};

// 9. HeightMap
const calculateHeightMap: PixelCalculator = (x, y, w, h, seed) => {
  const freq = 0.02;
  const val =
    (Math.sin(x * freq + seed) +
      Math.cos(y * freq + seed * 0.5) +
      Math.sin((x + y) * freq * 2)) /
    3;
  const norm = (val + 1) / 2;

  if (norm < 0.3) return { r: 0, g: 0, b: 200, a: 255 };
  if (norm < 0.4) return { r: 240, g: 240, b: 100, a: 255 };
  if (norm < 0.7) return { r: 0, g: 150, b: 0, a: 255 };
  return { r: 255, g: 255, b: 255, a: 255 };
};

// 11. PhasePlot
const calculatePhasePlot: PixelCalculator = (x, y, w, h, seed) => {
  const phaseShift = seed / 100;
  const re = map(x, 0, w, -2, 2);
  const im = map(y, 0, h, -2, 2);

  const z2r = re * re - im * im;
  const z2i = 2 * re * im;

  const denR = z2r + re + 1;
  const denI = z2i + im;
  const denMag = denR * denR + denI * denI;

  if (denMag < 0.00001) return { r: 0, g: 0, b: 0, a: 0 }; // Skip/Transparent

  const numR = re - 1;
  const numI = im;

  const fr = (numR * denR + numI * denI) / denMag;
  const fi = (numI * denR - numR * denI) / denMag;

  const phase = Math.atan2(fi, fr) + phaseShift;
  const hue = ((phase / Math.PI) * 180 + 360) % 360;

  const c = 1; // Saturation/Value maxed
  const hp = hue / 60;
  const xVal = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0,
    g1 = 0,
    b1 = 0;

  if (hp >= 0 && hp < 1) {
    r1 = c;
    g1 = xVal;
  } else if (hp >= 1 && hp < 2) {
    r1 = xVal;
    g1 = c;
  } else if (hp >= 2 && hp < 3) {
    g1 = c;
    b1 = xVal;
  } else if (hp >= 3 && hp < 4) {
    g1 = xVal;
    b1 = c;
  } else if (hp >= 4 && hp < 5) {
    r1 = xVal;
    b1 = c;
  } else {
    r1 = c;
    b1 = xVal;
  }

  // Convert to 0-255
  return {
    r: Math.floor(r1 * 255),
    g: Math.floor(g1 * 255),
    b: Math.floor(b1 * 255),
    a: 255,
  };
};

// --- Point/Vector Based Implementations (Keep separate as they don't iterate pixels) ---

async function renderIFS(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number
) {
  const type = seed % 2;
  const imgData = ctx.getImageData(0, 0, w, h);

  // Clear buffer (opaque black)
  for (let i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i] = 0;
    imgData.data[i + 1] = 0;
    imgData.data[i + 2] = 0;
    imgData.data[i + 3] = 255;
  }

  let x = 0,
    y = 0;
  const points = 50000;

  for (let i = 0; i < points; i++) {
    let nextX = x,
      nextY = y;
    const r = Math.random();

    if (type === 0) {
      // Fern
      if (r < 0.01) {
        nextX = 0;
        nextY = 0.16 * y;
      } else if (r < 0.86) {
        nextX = 0.85 * x + 0.04 * y;
        nextY = -0.04 * x + 0.85 * y + 1.6;
      } else if (r < 0.93) {
        nextX = 0.2 * x - 0.26 * y;
        nextY = 0.23 * x + 0.22 * y + 1.6;
      } else {
        nextX = -0.15 * x + 0.28 * y;
        nextY = 0.26 * x + 0.24 * y + 0.44;
      }
    } else {
      // Sierpinski
      if (r < 0.33) {
        nextX = x / 2;
        nextY = y / 2;
      } else if (r < 0.66) {
        nextX = (x + 1) / 2;
        nextY = y / 2;
      } else {
        nextX = x / 2;
        nextY = (y + 1) / 2;
      }
    }

    x = nextX;
    y = nextY;

    let px = 0,
      py = 0;
    if (type === 0) {
      px = Math.floor(map(x, -2.5, 2.65, 0, w));
      py = Math.floor(map(y, 0, 10, h, 0));
    } else {
      px = Math.floor(map(x, 0, 1, 0, w));
      py = Math.floor(map(y, 0, 1, h, 0));
    }

    if (px >= 0 && px < w && py >= 0 && py < h) {
      const cell = (px + py * w) * 4;
      imgData.data[cell] = 0;
      imgData.data[cell + 1] = 255;
      imgData.data[cell + 2] = type === 0 ? 0 : 255;
      imgData.data[cell + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

async function renderLSystem(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number
) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = `hsl(${seed % 360}, 70%, 50%)`;
  ctx.lineWidth = 1;

  let current = 'FX';
  const iterations = 10 + (seed % 4);

  for (let i = 0; i < iterations; i++) {
    let next = '';
    for (const char of current) {
      if (char === 'X') next += 'X+YF+';
      else if (char === 'Y') next += '-FX-Y';
      else next += char;
    }
    current = next;
  }

  let x = w / 2;
  let y = h / 2;
  let angle = 0;
  const len = (Math.min(w, h) / Math.pow(1.4, iterations)) * 20;

  ctx.beginPath();
  ctx.moveTo(x, y);

  for (const char of current) {
    if (char === 'F') {
      x += len * Math.cos(angle);
      y += len * Math.sin(angle);
      ctx.lineTo(x, y);
    } else if (char === '+') {
      angle -= Math.PI / 2;
    } else if (char === '-') {
      angle += Math.PI / 2;
    }
  }
  ctx.stroke();
}

async function renderStrangeAttractor(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number
) {
  const a = map(seed % 100, 0, 100, -2, 2);
  const b = map((seed / 100) % 100, 0, 100, -2, 2);
  const c = map((seed / 10000) % 100, 0, 100, -2, 2);
  const d = map((seed / 1000000) % 100, 0, 100, -2, 2);

  const buffer = new Float32Array(w * h);
  let x = 0.1,
    y = 0.1;
  const points = 100000;

  for (let i = 0; i < points; i++) {
    const xn = Math.sin(a * y) + c * Math.cos(a * x);
    const yn = Math.sin(b * x) + d * Math.cos(b * y);
    x = xn;
    y = yn;

    const px = Math.floor(map(x, -2.5, 2.5, 0, w));
    const py = Math.floor(map(y, -2.5, 2.5, 0, h));

    if (px >= 0 && px < w && py >= 0 && py < h) {
      buffer[py * w + px] += 1;
    }
  }

  const imgData = ctx.createImageData(w, h);
  let maxVal = 0;
  for (let i = 0; i < buffer.length; i++)
    if (buffer[i] > maxVal) maxVal = buffer[i];
  if (maxVal === 0) maxVal = 1;

  for (let i = 0; i < buffer.length; i++) {
    const val = buffer[i];
    const intensity = Math.pow(val / maxVal, 0.5);
    const cell = i * 4;
    const colorVal = Math.floor(intensity * 255);

    imgData.data[cell] = colorVal;
    imgData.data[cell + 1] = Math.floor(colorVal * 0.5);
    imgData.data[cell + 2] = Math.floor(colorVal * 0.2);
    imgData.data[cell + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
}

async function renderFlame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number
) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, w, h);

  const buffer = new Float32Array(w * h);
  let x = 0.5,
    y = 0.5;

  const coeffs = [
    { a: 0.5, b: 0, c: 0, d: 0.5, e: 0, f: 0 },
    { a: 0.5, b: 0, c: 0, d: 0.5, e: 0.5, f: 0.5 },
    { a: 0.5, b: 0, c: 0, d: 0.5, e: 0.25, f: 0.25 },
  ];

  const points = 50000;

  for (let i = 0; i < points; i++) {
    const r = Math.floor(Math.random() * coeffs.length);
    const cf = coeffs[r];

    const xnm = cf.a * x + cf.b * y + cf.e;
    const ynm = cf.c * x + cf.d * y + cf.f;

    const xn = Math.sin(xnm);
    const yn = Math.sin(ynm);

    x = xn;
    y = yn;

    const px = Math.floor(map(x, -1.5, 1.5, 0, w));
    const py = Math.floor(map(y, -1.5, 1.5, 0, h));

    if (px >= 0 && px < w && py >= 0 && py < h) {
      buffer[py * w + px] += 1;
    }
  }

  const imgData = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < buffer.length; i++) {
    const val = buffer[i];
    const cell = i * 4;
    const c = Math.min(255, val * 20);
    imgData.data[cell] = c;
    imgData.data[cell + 1] = c / 2;
    imgData.data[cell + 2] = c / 4;
    imgData.data[cell + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
}

// --- Main Export & Border Logic ---

export async function generateFractalImage(
  config: FractalConfig
): Promise<string> {
  const { method, width, height, seed = 0 } = config;
  const renderer = new CanvasRenderer(width, height);
  const ctx = renderer.getContext();

  const qWidth = Math.ceil(width / 2);
  const qHeight = Math.ceil(height / 2);
  const maxIter = 1000;

  switch (method) {
    case FractalMethod.Mandelbrot:
      await renderPixelGrid(
        ctx,
        qWidth,
        qHeight,
        seed,
        maxIter,
        calculateMandelbrot
      );
      break;
    case FractalMethod.Julia:
      await renderPixelGrid(ctx, qWidth, qHeight, seed, maxIter, calculateJulia);
      break;
    case FractalMethod.BurningShip:
      await renderPixelGrid(
        ctx,
        qWidth,
        qHeight,
        seed,
        maxIter,
        calculateBurningShip
      );
      break;
    case FractalMethod.Newton:
      await renderPixelGrid(
        ctx,
        qWidth,
        qHeight,
        seed,
        maxIter,
        calculateNewton
      );
      break;
    case FractalMethod.Lyapunov:
      await renderPixelGrid(
        ctx,
        qWidth,
        qHeight,
        seed,
        maxIter,
        calculateLyapunov
      );
      break;
    case FractalMethod.HeightMap:
      await renderPixelGrid(
        ctx,
        qWidth,
        qHeight,
        seed,
        maxIter,
        calculateHeightMap
      );
      break;
    case FractalMethod.PhasePlot:
      await renderPixelGrid(
        ctx,
        qWidth,
        qHeight,
        seed,
        maxIter,
        calculatePhasePlot
      );
      break;
    case FractalMethod.IFS:
      await renderIFS(ctx, qWidth, qHeight, seed);
      break;
    case FractalMethod.LSystem:
      await renderLSystem(ctx, qWidth, qHeight, seed);
      break;
    case FractalMethod.StrangeAttractor:
      await renderStrangeAttractor(ctx, qWidth, qHeight, seed);
      break;
    case FractalMethod.Flame:
      await renderFlame(ctx, qWidth, qHeight, seed);
      break;
    default:
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, qWidth, qHeight);
      ctx.fillStyle = 'white';
      ctx.font = '20px sans-serif';
      ctx.fillText(method, 10, 50);
      break;
  }

  renderer.applySymmetry();
  addBorder(renderer.getContext(), width, height, Math.floor(width * 0.05));
  return renderer.toBase64();
}

function addBorder(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  size: number
) {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, w, size);
  ctx.fillRect(0, h - size, w, size);
  ctx.fillRect(0, 0, size, h);
  ctx.fillRect(w - size, 0, size, h);
}
