// Global theme configuration for the application
// Single source of truth for all colors, fonts, and UI variables
export const theme = {
  colors: {
    // Primary brand colors
    primary: '#1d4ed8', // Blue brand color
    primaryDark: '#1e40af', // Darker blue for hover states

    // Secondary colors
    secondary: '#1e40af', // Blue secondary
    secondaryDark: '#1d4ed8', // Darker blue

    // Accent colors
    accent: '#f07b7b', // Red accent
    accentDark: '#e11d48', // Darker red

    // Background colors
    lightBg: '#f8f4eb', // Light cream background
    lighterBg: '#fffdf9', // Even lighter background

    // Neutral colors
    white: '#ffffff',
    black: '#000000',

    // Gray scale
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },

    // Additional colors
    teal: '#8cc5c0',
    pink: '#dca8b6',
    purple: '#b7b3d0',
    yellow: '#f1b74a',
  },

  fonts: {
    serif: 'font-serif',
    sans: 'font-sans',
  },

  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },

  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  },
};


// Logo colors array for TinyFashion (using blue variants)
export const logoColors = [
  '#3b82f6', // T - primary blue
  '#1e40af', // I - secondary blue
  '#2563eb', // N - blue-600
  '#1d4ed8', // Y - blue-700
  '#1e40af', // F - secondary blue
  '#3b82f6', // A - primary blue
  '#2563eb', // S - blue-600
  '#1d4ed8', // H - blue-700
  '#1e40af', // I - secondary blue
  '#3b82f6', // O - primary blue
  '#2563eb', // N - blue-600
];



