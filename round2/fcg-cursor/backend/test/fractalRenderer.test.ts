import { createCanvas, loadImage } from "@napi-rs/canvas";
import { renderFractalCard } from "../src/domain/fractalRenderer.js";
import { FRACTAL_METHODS } from "../src/shared/types.js";

const decodeDataUriToImage = async (dataUri: string) => {
  const base64 = dataUri.split(",")[1] ?? "";
  const buffer = Buffer.from(base64, "base64");
  return loadImage(buffer);
};

const sampleRgbVariance = async (dataUri: string) => {
  const image = await decodeDataUriToImage(dataUri);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const step = 6;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let sumR2 = 0;
  let sumG2 = 0;
  let sumB2 = 0;
  let count = 0;
  for (let y = Math.floor(height * 0.12); y < Math.floor(height * 0.88); y += step) {
    for (let x = Math.floor(width * 0.12); x < Math.floor(width * 0.88); x += step) {
      const offset = (y * width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      sumR += r;
      sumG += g;
      sumB += b;
      sumR2 += r * r;
      sumG2 += g * g;
      sumB2 += b * b;
      count += 1;
    }
  }
  const variance = (sum: number, sumSq: number) => Math.max(0, sumSq / count - (sum / count) * (sum / count));
  return { vr: variance(sumR, sumR2), vg: variance(sumG, sumG2), vb: variance(sumB, sumB2), count };
};

const sampleNeighborVolatility = async (dataUri: string) => {
  const image = await decodeDataUriToImage(dataUri);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const step = 5;
  let diffSum = 0;
  let count = 0;
  for (let y = Math.floor(height * 0.15); y < Math.floor(height * 0.85); y += step) {
    for (let x = Math.floor(width * 0.15); x < Math.floor(width * 0.85); x += step) {
      const a = (y * width + x) * 4;
      const b = (y * width + Math.min(width - 1, x + 1)) * 4;
      const dr = Math.abs(data[a] - data[b]);
      const dg = Math.abs(data[a + 1] - data[b + 1]);
      const db = Math.abs(data[a + 2] - data[b + 2]);
      diffSum += (dr + dg + db) / 3;
      count += 1;
    }
  }
  return diffSum / Math.max(1, count);
};

const sampleBrightnessStats = async (dataUri: string) => {
  const image = await decodeDataUriToImage(dataUri);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let sum = 0;
  let bright = 0;
  let count = 0;
  const step = 4;
  for (let y = Math.floor(height * 0.1); y < Math.floor(height * 0.9); y += step) {
    for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.9); x += step) {
      const o = (y * width + x) * 4;
      const luma = 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];
      sum += luma;
      if (luma > 230) bright += 1;
      count += 1;
    }
  }
  return { meanLuma: sum / Math.max(1, count), brightRatio: bright / Math.max(1, count) };
};

describe("fractal renderers", () => {
  it("renders all methods", () => {
    for (const method of FRACTAL_METHODS) {
      const result = renderFractalCard(method, `seed-${method}`);
      expect(result.imageDataUri.startsWith("data:image/jpeg;base64,")).toBe(true);
      expect(result.coverage).toBeGreaterThan(0);
    }
  });

  it("does not produce flat solid-color cards for key methods", async () => {
    const cases = [
      { method: "MANDELBROT" as const, seed: "flat-check-mandelbrot" },
      { method: "NEWTON" as const, seed: "flat-check-newton" },
      { method: "HEIGHTMAP" as const, seed: "flat-check-heightmap" }
    ];
    for (const item of cases) {
      const result = renderFractalCard(item.method, item.seed);
      const { vr, vg, vb } = await sampleRgbVariance(result.imageDataUri);
      const minChannelVariance = Math.min(vr, vg, vb);
      expect(minChannelVariance).toBeGreaterThan(180);
    }
  }, 20000);

  it("keeps noisy texture methods below volatility threshold", async () => {
    const cases = [
      { method: "FLAME" as const, seed: "noise-check-flame" },
      { method: "L_SYSTEM" as const, seed: "noise-check-lsystem" },
      { method: "IFS" as const, seed: "noise-check-ifs" },
      { method: "STRANGE_ATTRACTOR" as const, seed: "noise-check-strange" }
    ];
    for (const item of cases) {
      const result = renderFractalCard(item.method, item.seed);
      const volatility = await sampleNeighborVolatility(result.imageDataUri);
      expect(volatility).toBeLessThan(42);
    }
  }, 20000);

  it("keeps reference style for phase plot and ifs", async () => {
    const phase = renderFractalCard("PHASE_PLOT", "style-phase-soft");
    const phaseVolatility = await sampleNeighborVolatility(phase.imageDataUri);
    const phaseBrightness = await sampleBrightnessStats(phase.imageDataUri);
    expect(phaseVolatility).toBeLessThan(26);
    expect(phaseBrightness.meanLuma).toBeGreaterThan(175);

    const ifs = renderFractalCard("IFS", "style-ifs-fern");
    const ifsBrightness = await sampleBrightnessStats(ifs.imageDataUri);
    expect(ifs.coverage).toBeLessThan(0.5);
    expect(ifsBrightness.brightRatio).toBeGreaterThan(0.55);
  }, 25000);
});
