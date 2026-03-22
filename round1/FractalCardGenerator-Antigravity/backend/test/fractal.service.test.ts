import { FractalService } from '../src/services/fractal.service';
import { FractalMethod } from '../src/shared/types';
import * as FractalEngine from '../src/core/fractal-engine';

jest.mock('../src/core/fractal-engine');

describe('FractalService', () => {
    let service: FractalService;

    beforeEach(() => {
        service = new FractalService();
        jest.clearAllMocks();
    });

    it('should generate a fractal image', async () => {
        const mockBase64 = 'data:image/png;base64,mocked';
        (FractalEngine.generateFractalImage as jest.Mock).mockResolvedValue(mockBase64);

        const config = {
            method: FractalMethod.Mandelbrot,
            width: 100,
            height: 100,
        };

        const result = await service.generate(config);

        expect(result).toBe(mockBase64);
        expect(FractalEngine.generateFractalImage).toHaveBeenCalledWith(
            expect.objectContaining({
                method: FractalMethod.Mandelbrot,
                width: 100,
                height: 100,
            })
        );
    });
});
