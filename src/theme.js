import { createTheme } from '@mui/material/styles';

// Generate light or dark theme with accessible contrast
// and a richer design system.
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        light: mode === 'light' ? '#5eead4' : '#34d399',
        main: mode === 'light' ? '#0f766e' : '#2dd4bf',
        dark: mode === 'light' ? '#0b504a' : '#0f766e',
        contrastText: '#f0fdfa',
      },
      secondary: {
        light: mode === 'light' ? '#fbbf75' : '#fb923c',
        main: mode === 'light' ? '#f97316' : '#fda769',
        dark: mode === 'light' ? '#c2410c' : '#ea580c',
        contrastText: '#1f1300',
      },
      error: {
        main: mode === 'light' ? '#dc2626' : '#f87171',
      },
      warning: {
        main: mode === 'light' ? '#facc15' : '#fbbf24',
      },
      info: {
        main: mode === 'light' ? '#0ea5e9' : '#38bdf8',
      },
      success: {
        main: mode === 'light' ? '#16a34a' : '#4ade80',
      },
      background: {
        default: mode === 'light' ? '#ecfdf5' : '#041615',
        paper: mode === 'light' ? '#ffffff' : '#0b1f1d',
      },
      text: {
        primary: mode === 'light' ? '#07211f' : '#f0fdfa',
        secondary: mode === 'light' ? '#3a4d4a' : '#94c6bd',
      },
    },
    typography: {
      fontFamily:
        "'Noto Sans Sinhala', 'Noto Sans Tamil', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: { fontSize: '2.25rem', fontWeight: 700 },
      h2: { fontSize: '1.875rem', fontWeight: 700 },
      h3: { fontSize: '1.5rem', fontWeight: 600 },
      h4: { fontSize: '1.25rem', fontWeight: 600 },
      h5: { fontSize: '1.125rem', fontWeight: 500 },
      h6: { fontSize: '1rem', fontWeight: 500 },
      body1: { fontSize: '1rem', lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', lineHeight: 1.6 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    spacing: 4,
    contrastThreshold: 4.5,
  });

export default getTheme;
