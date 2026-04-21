// Radix Select wrapper for the fractal method dropdown.
// Controlled component — the parent owns the value so "Surprise Me" can
// sync back the server's chosen method (FCG-SPECv3 §2.1).

import * as Select from '@radix-ui/react-select';
import type { JSX } from 'react';
import type { FractalMethod } from '../shared/types';
import { FRACTAL_METHODS, FRACTAL_METHOD_LABELS } from '../shared/types';

interface MethodSelectProps {
  readonly value: FractalMethod;
  readonly onChange: (next: FractalMethod) => void;
  readonly disabled: boolean;
}

export const MethodSelect = ({ value, onChange, disabled }: MethodSelectProps): JSX.Element => (
  <Select.Root
    value={value}
    onValueChange={(v) => onChange(v as FractalMethod)}
    disabled={disabled}
  >
    <Select.Trigger
      aria-label="Fractal method"
      data-testid="method-select-trigger"
      className="flex w-full items-center justify-between gap-2 rounded-md border border-white/15 bg-black/30 px-4 py-3 text-left text-white shadow-inner ring-offset-black transition hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
    >
      <Select.Value aria-label={FRACTAL_METHOD_LABELS[value]}>
        {FRACTAL_METHOD_LABELS[value]}
      </Select.Value>
      <Select.Icon className="text-white/70">▾</Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content
        position="popper"
        sideOffset={4}
        className="z-50 overflow-hidden rounded-md border border-white/10 bg-[#1a1a2e] text-white shadow-xl"
      >
        <Select.Viewport className="p-1">
          {FRACTAL_METHODS.map((m) => (
            <Select.Item
              key={m}
              value={m}
              data-testid={`method-option-${m}`}
              className="relative flex cursor-pointer select-none items-center rounded px-8 py-2 text-sm outline-none data-[highlighted]:bg-accent data-[state=checked]:text-accent"
            >
              <Select.ItemText>{FRACTAL_METHOD_LABELS[m]}</Select.ItemText>
              <Select.ItemIndicator className="absolute left-2">●</Select.ItemIndicator>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);
