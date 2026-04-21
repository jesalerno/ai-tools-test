// Log-density normalization for IFS / flame / strange-attractor renderers.
// Per FCG-SPECv3 §5.3: linear density mapping produces mostly-black output.
// Required: t = log(density + 1) / log(maxDensity + 1), gamma ≤ 0.5.
// Also: banned `Math.max(...largeArray)` — find max via explicit loop (§3.4).

export const findMaxDensity = (buffer: Float32Array | Uint32Array): number => {
  let max = 0;
  for (let i = 0; i < buffer.length; i++) {
    const v = buffer[i] ?? 0;
    if (v > max) max = v;
  }
  return max;
};

export const logDensityNormalize = (
  density: number,
  maxDensity: number,
  gamma: number,
): number => {
  if (maxDensity <= 0) return 0;
  const t = Math.log(density + 1) / Math.log(maxDensity + 1);
  return Math.pow(t, gamma);
};
