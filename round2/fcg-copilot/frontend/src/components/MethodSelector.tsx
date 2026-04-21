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
  value: FractalMethod;
  onChange: (method: FractalMethod) => void;
  isDisabled: boolean;
}

/**
 * Dropdown for selecting one of the 11 fractal methods.
 * Random selection is handled by the "Surprise Me" button, not this control.
 */
export function MethodSelector({ value, onChange, isDisabled }: MethodSelectorProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as FractalMethod);
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
        value={value}
        onChange={handleChange}
        disabled={isDisabled}
        sx={{ mt: 1 }}
      >
        {FRACTAL_METHODS.map((method) => (
          <option key={method} value={method}>
            {FRACTAL_METHOD_LABELS[method]}
          </option>
        ))}
      </NativeSelect>
    </FormControl>
  );
}
