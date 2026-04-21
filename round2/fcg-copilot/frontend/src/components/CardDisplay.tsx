/**
 * Card display area — shows loading state, generated image, or placeholder.
 */

import type { GenerateResponse } from '../shared/types';
import { FRACTAL_METHOD_LABELS } from '../shared/types';

interface CardDisplayProps {
  isLoading: boolean;
  result: GenerateResponse | null;
}

/** Display area for the generated fractal card image. */
export function CardDisplay({ isLoading, result }: CardDisplayProps) {
  if (isLoading) {
    return (
      <div className="card-display card-display--loading" role="status" aria-label="Generating card">
        <div className="spinner" aria-hidden="true" />
        <p className="loading-text">Generating your fractal card…</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card-display card-display--placeholder" aria-label="Card display area">
        <p className="placeholder-text">Your fractal card will appear here.</p>
      </div>
    );
  }

  const methodLabel = FRACTAL_METHOD_LABELS[result.method];

  return (
    <div className="card-display card-display--result">
      <img
        src={result.image}
        alt={`Generated ${methodLabel} fractal playing card back`}
        className="card-image"
        width={375}
        height={525}
      />
      <div className="card-meta" aria-label="Generation details">
        <span className="meta-method">{methodLabel}</span>
        <span className="meta-time">{result.metadata.durationMs}ms</span>
        {result.metadata.warnings.length > 0 && (
          <span className="meta-warning" role="note">
            ⚠ {result.metadata.warnings[0]}
          </span>
        )}
      </div>
    </div>
  );
}
