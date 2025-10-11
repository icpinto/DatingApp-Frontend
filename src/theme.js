import { createTheme } from '@mui/material/styles';

// Generate light or dark theme with accessible contrast
// and a richer design system.
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        light: mode === 'light' ? '#4d4d4d' : '#f5f5f5',
        main: mode === 'light' ? '#000000' : '#ffffff',
        dark: mode === 'light' ? '#000000' : '#d9d9d9',
        contrastText: mode === 'light' ? '#ffffff' : '#000000',
      },
      secondary: {
        light: mode === 'light' ? '#7a7a7a' : '#d9d9d9',
        main: mode === 'light' ? '#1f1f1f' : '#e6e6e6',
        dark: mode === 'light' ? '#0d0d0d' : '#bfbfbf',
        contrastText: mode === 'light' ? '#ffffff' : '#000000',
      },
      error: {
        main: mode === 'light' ? '#333333' : '#cccccc',
      },
      warning: {
        main: mode === 'light' ? '#4d4d4d' : '#d1d1d1',
      },
      info: {
        main: mode === 'light' ? '#262626' : '#e0e0e0',
      },
      success: {
        main: mode === 'light' ? '#3d3d3d' : '#d9d9d9',
      },
      background: {
        default: mode === 'light' ? '#ffffff' : '#000000',
        paper: mode === 'light' ? '#f2f2f2' : '#111111',
      },
      text: {
        primary: mode === 'light' ? '#000000' : '#f5f5f5',
        secondary: mode === 'light' ? '#4d4d4d' : '#bfbfbf',
      },
      divider: mode === 'light' ? '#d0d0d0' : '#333333',
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
