import { FractalConfig, FractalResponse, ErrorResponse } from '../shared/types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const generateFractal = async (config: FractalConfig): Promise<FractalResponse | ErrorResponse> => {
    try {
        const response = await fetch(`${API_URL}/fractal/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
        });

        const data = await response.json();
        if (!response.ok) {
            return {
                success: false,
                error: data.message || data.error || 'An error occurred',
            } as ErrorResponse;
        }
        return data as FractalResponse;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
};
