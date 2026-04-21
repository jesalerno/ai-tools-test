/**
 * MUI v6 theme configured with Material Design 3 tokens.
 * Colors sourced from the FCG spec §2.2 MD3 palette.
 */

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary:    { main: '#6750A4', contrastText: '#FFFFFF' },
    secondary:  { main: '#625B71', contrastText: '#FFFFFF' },
    error:      { main: '#B3261E' },
    background: { default: '#FFFBFE', paper: '#FFFBFE' },
    text:       { primary: '#1C1B1F', secondary: '#625B71' },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Roboto, system-ui, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        // MD3 uses full-pill shape for filled/tonal/outlined buttons
        root: { textTransform: 'none', borderRadius: 100, fontWeight: 600 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

export default theme;
