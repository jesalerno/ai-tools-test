import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders fractal card generator header', () => {
    render(<App />);
    const linkElement = screen.getByText(/Fractal Card Generator/i);
    expect(linkElement).toBeInTheDocument();
});
