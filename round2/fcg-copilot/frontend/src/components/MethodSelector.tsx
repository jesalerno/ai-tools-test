/**
 * Method selector dropdown for the 11 fractal methods.
 */

import type { FractalMethod } from '../shared/types';
import { FRACTAL_METHODS, FRACTAL_METHOD_LABELS } from '../shared/types';

interface MethodSelectorProps {
  value: FractalMethod | null;
  onChange: (method: FractalMethod | null) => void;
  isDisabled: boolean;
}

/**
 * Dropdown for selecting a fractal method.
 * Shows all 11 methods plus a "Random" option.
 */
export function MethodSelector({ value, onChange, isDisabled }: MethodSelectorProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const v = event.target.value;
    onChange(v === '' ? null : (v as FractalMethod));
  };

  return (
    <div className="method-selector">
      <label htmlFor="fractal-method" className="label">
        Fractal Method
      </label>
      <select
        id="fractal-method"
        className="select"
        value={value ?? ''}
        onChange={handleChange}
        disabled={isDisabled}
        aria-label="Select fractal method"
      >
        <option value="">— Random (Surprise Me) —</option>
        {FRACTAL_METHODS.map((method) => (
          <option key={method} value={method}>
            {FRACTAL_METHOD_LABELS[method]}
          </option>
        ))}
      </select>
    </div>
  );
}
