import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ErrorBoundary } from './ErrorBoundary';

function BrokenComponent(): JSX.Element {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders fallback for render errors', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Rendering Error');
  });
});
