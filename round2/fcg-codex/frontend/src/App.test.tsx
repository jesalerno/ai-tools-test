import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('renders controls and idle preview state', () => {
    render(<App />);
    expect(screen.getByText('Fractal Card Back Generator')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Surprise Me' })).toBeInTheDocument();
  });
});
