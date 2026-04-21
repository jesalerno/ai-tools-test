import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders headline', () => {
    render(<App />);
    expect(screen.getByText(/Fractal Card Generator/i)).toBeDefined();
});
