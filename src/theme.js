import { createTheme } from '@mui/material/styles';

// Generate light or dark theme with accessible contrast
// and a richer design system.
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        light: mode === 'light' ? '#ffffff' : '#cbd5f5',
        main: mode === 'light' ? '#ffffff' : '#1e293b',
        dark: mode === 'light' ? '#e2e8f0' : '#0f172a',
        contrastText: mode === 'light' ? '#0f172a' : '#f8fafc',
      },
      secondary: {
        light: mode === 'light' ? '#3b82f6' : '#38bdf8',
        main: mode === 'light' ? '#1d4ed8' : '#60a5fa',
        dark: mode === 'light' ? '#1e3a8a' : '#1d4ed8',
        contrastText: '#ffffff',
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
        default: mode === 'light' ? '#ffffff' : '#0f172a',
        paper: mode === 'light' ? '#ffffff' : '#111827',
      },
      text: {
        primary: mode === 'light' ? '#0f172a' : '#f8fafc',
        secondary: mode === 'light' ? '#475569' : '#94a3b8',
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
