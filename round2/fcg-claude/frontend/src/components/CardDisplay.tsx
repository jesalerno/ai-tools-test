// Card display area. Shows either a placeholder, a loading shimmer, or
// the generated JPEG. Replaces prior result in place (FCG-SPECv3 §2.1).
import type { JSX } from 'react';
import type { GenerateCardResponse } from '../shared/types';
import { FRACTAL_METHOD_LABELS } from '../shared/types';

interface CardDisplayProps {
  readonly loading: boolean;
  readonly card: GenerateCardResponse | null;
}

export const CardDisplay = ({ loading, card }: CardDisplayProps): JSX.Element => (
  <section
    aria-label="Generated card"
    data-testid="card-display"
    className="relative flex aspect-[2.5/3.5] w-full max-w-[340px] items-center justify-center overflow-hidden rounded-2xl bg-white/5 p-2 shadow-2xl shadow-black/60 ring-1 ring-white/10 sm:max-w-sm"
  >
    {card ? (
      <img
        src={card.image}
        alt={`Fractal card back — ${FRACTAL_METHOD_LABELS[card.method]}, seed ${card.seed}`}
        data-testid="card-image"
        className="h-full w-full rounded-xl object-contain"
      />
    ) : (
      <div className="flex flex-col items-center gap-2 text-center text-white/60">
        <span className="text-3xl" aria-hidden>◆</span>
        <p className="max-w-[70%] text-sm leading-relaxed">
          Pick a fractal method and press <strong className="text-white">Go</strong>, or let the
          server pick with <strong className="text-white">Surprise Me</strong>.
        </p>
      </div>
    )}
    {loading && (
      <div
        data-testid="card-loading"
        aria-live="polite"
        className="card-shimmer pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl bg-black/35 backdrop-blur-[1px]"
      >
        <span className="rounded-full bg-black/60 px-3 py-1 text-xs uppercase tracking-widest text-white/80">
          generating…
        </span>
      </div>
    )}
  </section>
);
