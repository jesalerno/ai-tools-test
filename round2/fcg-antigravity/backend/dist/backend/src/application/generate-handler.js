import Ajv from 'ajv';
import { FractalMethod, HarmonyMode } from '../../../shared/types.js';
import { generateFractalQuadrant, mirrorToFullCard } from '../domain/fractal-registry.js';
import { createCanvas, ImageData } from '@napi-rs/canvas';
const ajv = new Ajv.default();
const requestSchema = {
    type: 'object',
    properties: {
        method: { type: 'string', enum: Object.values(FractalMethod) },
        seed: { type: 'number' }
    },
    additionalProperties: false
};
const validate = ajv.compile(requestSchema);
export async function handleGenerate(reqBody) {
    if (typeof reqBody !== 'object' || reqBody === null) {
        throw new Error('Invalid JSON body');
    }
    if (!validate(reqBody)) {
        throw new Error('Validation Error: ' + ajv.errorsText(validate.errors));
    }
    const body = reqBody;
    const methods = Object.values(FractalMethod);
    const selectedMethod = body.method || methods[Math.floor(Math.random() * methods.length)];
    const seed = body.seed ?? Math.floor(Math.random() * 2147483647);
    const harmonies = Object.values(HarmonyMode);
    const selectedHarmony = harmonies[Math.floor(Math.random() * harmonies.length)];
    // Card Size: 750 x 1050 px -> Quadrant: 375 x 525 px
    const quadrantW = 375;
    const quadrantH = 525;
    const requiredBytes = 750 * 1050 * 4;
    if (requiredBytes > 134217728)
        throw new Error('Memory cap exceeded');
    const start = Date.now();
    const quadrantPixels = generateFractalQuadrant(selectedMethod, quadrantW, quadrantH, seed, selectedHarmony);
    const fullPixels = mirrorToFullCard(quadrantPixels, quadrantW, quadrantH);
    const canvas = createCanvas(750, 1050);
    const ctx = canvas.getContext('2d');
    const imgData = new ImageData(fullPixels, 750, 1050);
    ctx.putImageData(imgData, 0, 0);
    // 3mm white border -> ~35px at 300dpi
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 35;
    ctx.strokeRect(17.5, 17.5, 750 - 35, 1050 - 35);
    const durationMs = Date.now() - start;
    if (durationMs > 15000) {
        console.warn('Generation took > 15 seconds');
    }
    return {
        buffer: await canvas.encode('jpeg'),
        method: selectedMethod,
        seed
    };
}
