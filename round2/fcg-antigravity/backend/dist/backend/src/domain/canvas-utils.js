import { HarmonyMode } from '../../../shared/types.js';
export function HSVtoRGB(h, s, v) {
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        case 5:
            r = v, g = p, b = q;
            break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
export function generatePalette(seed, mode, size = 256) {
    let s_seed = seed;
    const rand = () => { s_seed = (s_seed * 16807) % 2147483647; return s_seed / 2147483647; };
    const baseHue = rand();
    const palette = [];
    const hues = [baseHue];
    if (mode === HarmonyMode.COMPLEMENTARY)
        hues.push((baseHue + 0.5) % 1);
    if (mode === HarmonyMode.ANALOGOUS)
        hues.push((baseHue + 0.08) % 1, (baseHue - 0.08 + 1) % 1);
    if (mode === HarmonyMode.TRIAD)
        hues.push((baseHue + 0.33) % 1, (baseHue + 0.66) % 1);
    if (mode === HarmonyMode.TETRADIC || mode === HarmonyMode.SQUARE)
        hues.push((baseHue + 0.25) % 1, (baseHue + 0.5) % 1, (baseHue + 0.75) % 1);
    for (let i = 0; i < size; i++) {
        const t = i / (size - 1);
        const hue = hues[Math.floor(t * 0.999 * hues.length)];
        // ensure brightness isn't near 0 so it doesn't violate solid-black rule
        const s = 0.7 + rand() * 0.3;
        const v = 0.4 + (i / size) * 0.6;
        palette.push(HSVtoRGB(hue, s, v));
    }
    return palette;
}
