import { createTheme } from '@mui/material/styles';

// Generate light or dark theme with accessible contrast
// and a richer design system.
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        light: '#f48fb1',
        main: mode === 'light' ? '#c2185b' : '#ff4081',
        dark: '#8c0032',
        contrastText: '#ffffff',
      },
      secondary: {
        light: '#e1bee7',
        main: mode === 'light' ? '#9c27b0' : '#ba68c8',
        dark: '#6a0080',
        contrastText: '#ffffff',
      },
      error: {
        main: mode === 'light' ? '#d32f2f' : '#ef5350',
      },
      warning: {
        main: mode === 'light' ? '#ed6c02' : '#ffb74d',
      },
      info: {
        main: mode === 'light' ? '#0288d1' : '#4fc3f7',
      },
      success: {
        main: mode === 'light' ? '#2e7d32' : '#81c784',
      },
      background: {
        default: mode === 'light' ? '#fff0f6' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#1e1e1e' : '#ffffff',
        secondary: mode === 'light' ? '#555555' : '#bbbbbb',
      },
    },
    typography: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: { fontSize: '2.25rem', fontWeight: 700 },
      h2: { fontSize: '1.875rem', fontWeight: 700 },
      h3: { fontSize: '1.5rem', fontWeight: 600 },
      h4: { fontSize: '1.25rem', fontWeight: 600 },
      h5: { fontSize: '1.125rem', fontWeight: 500 },
      h6: { fontSize: '1rem', fontWeight: 500 },
      body1: { fontSize: '1rem' },
      body2: { fontSize: '0.875rem' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    spacing: 4,
    contrastThreshold: 4.5,
  });

export default getTheme;
