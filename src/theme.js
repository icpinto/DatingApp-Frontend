import { createTheme } from '@mui/material/styles';

// Custom theme tailored for the dating application
const theme = createTheme({
  palette: {
    primary: {
      main: '#e91e63', // Romantic pink
    },
    secondary: {
      main: '#9c27b0', // Complementary purple
    },
    background: {
      default: '#fff0f6', // Soft background color
    },
  },
});

export default theme;

