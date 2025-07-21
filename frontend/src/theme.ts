import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#0050b3', // Deep blue
            contrastText: '#fff',
        },
        secondary: {
            main: '#00b386', // Teal
            contrastText: '#fff',
        },
        background: {
            default: '#f4f8fb',
            paper: '#fff',
        },
        error: {
            main: '#e53935',
        },
        success: {
            main: '#43a047',
        },
        warning: {
            main: '#ffa726',
        },
        info: {
            main: '#1976d2',
        },
    },
    shape: {
        borderRadius: 16,
    },
    typography: {
        fontFamily: [
            'Inter',
            'Roboto',
            '"Segoe UI"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 500 },
        h6: { fontWeight: 500 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,80,179,0.08)',
                    fontWeight: 600,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 24px rgba(0,80,179,0.10)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    background: '#f9fbfd',
                    borderRadius: 8,
                },
            },
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,80,179,0.06)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 700,
                    background: '#f0f4f8',
                },
                root: {
                    fontSize: 15,
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
    },
});

export default theme;