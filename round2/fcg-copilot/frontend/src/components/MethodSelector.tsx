/**
 * Method selector dropdown for the 11 fractal methods.
 * Uses MUI NativeSelect for full accessibility and native combobox semantics.
 */

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import NativeSelect from '@mui/material/NativeSelect';
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
    <FormControl fullWidth variant="outlined">
      <InputLabel htmlFor="fractal-method" shrink>
        Fractal Method
      </InputLabel>
      <NativeSelect
        inputProps={{
          id: 'fractal-method',
          'aria-label': 'Select fractal method',
        }}
        value={value ?? ''}
        onChange={handleChange}
        disabled={isDisabled}
        sx={{ mt: 1 }}
      >
        <option value="">— Random (Surprise Me) —</option>
        {FRACTAL_METHODS.map((method) => (
          <option key={method} value={method}>
            {FRACTAL_METHOD_LABELS[method]}
          </option>
        ))}
      </NativeSelect>
    </FormControl>
  );
}
