/**
 * Basic tests for App component
 */

import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Fractal Card Generator/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders Go button', () => {
    render(<App />);
    const goButton = screen.getByRole('button', { name: /^Go$/i });
    expect(goButton).toBeInTheDocument();
  });

  it('renders Surprise Me button', () => {
    render(<App />);
    const surpriseButton = screen.getByText(/Surprise Me/i);
    expect(surpriseButton).toBeInTheDocument();
  });

  it('renders fractal method dropdown', () => {
    render(<App />);
    const dropdown = screen.getByLabelText(/Fractal Method/i);
    expect(dropdown).toBeInTheDocument();
  });
});
