import { useState, useCallback } from 'react';
import { FractalMethod, FractalConfig, FractalResponse } from '../shared/types';
import { generateFractal } from '../services/api';

const CARD_WIDTH = 750;
const CARD_HEIGHT = 1050;

interface UseFractalGenerationResult {
    imageSrc: string | undefined;
    loading: boolean;
    error: string | undefined;
    generate: (method: FractalMethod) => Promise<void>;
    surpriseMe: () => void;
}

export const useFractalGeneration = (initialMethod: FractalMethod = FractalMethod.Mandelbrot): UseFractalGenerationResult => {
    const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const generate = useCallback(async (method: FractalMethod) => {
        setLoading(true);
        setError(undefined);

        const config: FractalConfig = {
            method,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            seed: Math.floor(Math.random() * 1000000),
        };

        try {
            const response = await generateFractal(config);
            if (response.success && (response as FractalResponse).imageBase64) {
                setImageSrc((response as FractalResponse).imageBase64);
            } else {
                setError((response as any).error || 'Failed to generate image');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    }, []);

    const surpriseMe = useCallback(() => {
        const methods = Object.values(FractalMethod);
        const randomMethod = methods[Math.floor(Math.random() * methods.length)];
        generate(randomMethod);
    }, [generate]);

    return { imageSrc, loading, error, generate, surpriseMe };
};
