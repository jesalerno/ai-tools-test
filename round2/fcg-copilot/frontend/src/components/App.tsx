/**
 * Main application component.
 * Orchestrates the fractal card generator UI per spec §2.2 (MD3 via MUI v6).
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import type { FractalMethod } from '../shared/types';
import { useGenerate } from '../hooks/useGenerate';
import { MethodSelector } from './MethodSelector';
import { CardDisplay } from './CardDisplay';
import { ErrorBoundary } from './ErrorBoundary';

/** Default method shown in the dropdown on initial load. */
const DEFAULT_METHOD: FractalMethod = 'mandelbrot';

/** Root application component. */
function AppContent() {
  const { isLoading, result, errorMessage, selectedMethod, generate, clearError } = useGenerate();
  const [dropdownMethod, setDropdownMethod] = useState<FractalMethod>(DEFAULT_METHOD);

  const handleMethodChange = (method: FractalMethod) => {
    setDropdownMethod(method);
    clearError();
  };

  const handleGo = async () => {
    await generate(dropdownMethod);
  };

  const handleSurpriseMe = async () => {
    await generate(null);
  };

  // Sync dropdown when Surprise Me updates the selected method
  if (selectedMethod !== null && dropdownMethod !== selectedMethod && !isLoading) {
    setDropdownMethod(selectedMethod);
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box component="header" sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" color="primary" fontWeight={700}>
          Fractal Card Generator
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
          Generate a unique playing card back using fractal algorithms.
        </Typography>
      </Box>

      <Paper
        component="section"
        aria-label="Generation controls"
        elevation={1}
        sx={{ p: 3, borderRadius: 4, backgroundColor: 'rgba(103,80,164,0.05)' }}
      >
        <Stack spacing={2}>
          <MethodSelector
            value={dropdownMethod}
            onChange={handleMethodChange}
            isDisabled={isLoading}
          />
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => { void handleGo(); }}
              disabled={isLoading}
              aria-label="Generate card with selected method"
            >
              {isLoading ? 'Generating…' : 'Go'}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => { void handleSurpriseMe(); }}
              disabled={isLoading}
              aria-label="Generate card with random fractal method"
            >
              Surprise Me
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {errorMessage && (
        <Alert
          severity="error"
          onClose={clearError}
          sx={{ mt: 2 }}
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </Alert>
      )}

      <Box component="section" aria-label="Generated card" sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <CardDisplay isLoading={isLoading} result={result} />
      </Box>
    </Container>
  );
}

/** App wrapped in error boundary per spec §2.2 / §8. */
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
