import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#14b8a6',
      light: '#2dd4bf',
      dark: '#0d9488',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0a0a',
      paper: '#18181b',
    },
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#fafafa',
      '@media (min-width:600px)': {
        fontSize: '3rem',
      },
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      color: '#a1a1aa',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#27272a #18181b',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#18181b',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#27272a',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '8px 20px',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          background: 'linear-gradient(45deg, #6366f1, #818cf8)',
          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)',
          '&:hover': {
            background: 'linear-gradient(45deg, #4f46e5, #6366f1)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: '#27272a',
          '&:hover': {
            borderColor: '#6366f1',
            background: 'rgba(99, 102, 241, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(180deg, #27272a 0%, #18181b 100%)',
          borderRadius: '16px',
          border: '1px solid #27272a',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            borderColor: '#3f3f46',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#18181b',
          borderRadius: '16px',
          border: '1px solid #27272a',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #27272a',
        },
        indicator: {
          height: '3px',
          borderRadius: '3px 3px 0 0',
          background: 'linear-gradient(45deg, #6366f1, #818cf8)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: '48px',
          '&.Mui-selected': {
            color: '#fafafa',
          },
        },
      },
    },
  },
});