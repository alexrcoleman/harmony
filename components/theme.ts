import { createTheme } from "@mui/material";

export default createTheme({

    palette: {
        mode: 'dark',
        action: {
            hover: '#202225',
        },
        primary: { main: '#5865f2', contrastText: '#d2ddde' },
        secondary: { main: '#b9bbbe' },
        background: {
            default: '#202225',
            paper: '#36393f',
        }
    },
    components: {
        MuiFilledInput: {
            defaultProps: {
                disableUnderline: true,
                fullWidth: true,
            },
            styleOverrides: {
                root: {
                    color: '#cbcccd',
                    backgroundColor: '#202225',
                    borderRadius: '4px',
                    '&:hover': {
                        backgroundColor: '#182022',
                    },
                    '&.Mui-focused': {
                        backgroundColor: '#182022',
                    }
                },
            },
        },
        MuiSvgIcon: {
            styleOverrides: {
                fontSizeSmall: {
                    fontSize: '18px',
                }
            }
        },
        MuiPopover: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#18191c',
                    backgroundImage: 'none',
                },
            },
        },
        MuiButton: {
            defaultProps: {
                fullWidth: true,
                disableElevation: true,
            }
        },

        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    color: 'white',
                }
            }
        }
    },
    typography: {
        fontFamily: 'Uni Sans',
        h1: {
            color: '#d2ddde',
        },
        h2: {
            color: '#96989d',
        },
        body1: {
            color: 'var(--light-text)',
        },
        body2: {
            color: '#bebdc0',
        },
        button: {
            color: '#bebdc0',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 15
        },
        subtitle1: {
            color: 'red',
        },
        subtitle2: {
            color: 'blue',
        },
        caption: {
            color: 'pink',
        },
        h3: {
            color: 'orange',
        },
        h4: {
            color: 'green',
        },
        allVariants: {
            color: '#bebdc0'
        }
    }
});