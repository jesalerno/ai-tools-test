import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const ThrowError = () => {
    throw new Error('Test boundary error');
};

test('error boundary catches error', () => {
    // Suppress console.error in this specific test purely because we intentionally trigger one
    const consoleSpy = vi.spyOn(console, 'error');
    consoleSpy.mockImplementation(() => {});

    render(
        <ErrorBoundary>
            <ThrowError />
        </ErrorBoundary>
    );
    expect(screen.getByText(/Something went wrong/i)).toBeDefined();
    
    consoleSpy.mockRestore();
});
