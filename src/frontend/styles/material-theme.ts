export const theme = {
  colors: {
    primary: '#6200ea',
    secondary: '#03dac6',
    background: '#f5f5f5',
    surface: '#ffffff',
    error: '#b00020',
    text: {
      primary: '#000000',
      secondary: '#ffffff',
      disabled: '#9e9e9e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  spacing: (factor) => `${0.25 * factor}rem`,
  borderRadius: '8px',
  shadows: {
    elevation1: '0 1px 3px rgba(0, 0, 0, 0.2)',
    elevation2: '0 3px 6px rgba(0, 0, 0, 0.16)',
  },
};