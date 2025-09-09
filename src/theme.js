import { createTheme } from '@mui/material/styles';

// Generate light or dark theme with accessible contrast
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#c2185b' : '#ff4081',
        contrastText: '#ffffff',
      },
      secondary: {
        main: mode === 'light' ? '#9c27b0' : '#ba68c8',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'light' ? '#fff0f6' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    contrastThreshold: 4.5,
  });

export default getTheme;
