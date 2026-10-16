import { common } from '@mui/material/colors';
import shadow from './shadow';
import typography from './typography';

/**
 * LIGHT THEME (DEFAULT)
 */
export const light = {
	palette: {
		type: 'light',
		background: {
			default: '#f6f7f8',
			paper: common.white,
		},
		primary: {
			contrastText: '#ffffff',
			main: '#d9511e',
			dark: '#b94318',
		},
		secondary: {
			main: '#444444',
		},
		text: {
			primary: '#212121',
			secondary: '#616161',
			dark: common.black,
		},
	},
	components: {
		MuiTypography: {
			styleOverrides: {
				root: {
					letterSpacing: '0',
				},
			},
			defaultProps: {
				variantMapping: {
					h1: 'h1',
					h2: 'h2',
					h3: 'h3',
					h4: 'h4',
					h5: 'h5',
					h6: 'h6',
					subtitle1: 'p',
					subtitle2: 'p',
					subtitle3: 'p',
					body1: 'p',
					body2: 'p',
				},
			},
		},
		MuiLink: {
			styleOverrides: {
				root: {
					color: '#757575',
					textDecoration: 'none',
				},
			},
		},
		MuiDivider: {
			styleOverrides: {
				root: {
					borderColor: '#e3e5e8',
				},
			},
		},
		MuiBox: {
			styleOverrides: {
				root: {
					padding: '0',
				},
			},
			makeStyles: {
				root: {
					padding: 0,
				},
			},
			sx: {
				'&.MuiBox-root': {
					component: 'div',
				},
			},
		},
		MuiContainer: {
			styleOverrides: {
				root: {
					maxWidth: 'inherit',
					padding: '0',
					'@media (min-width: 600px)': {
						paddingLeft: 0,
						paddingRight: 0,
					},
				},
			},
		},
		MuiCssBaseline: {
			styleOverrides: {
				html: { height: '100%' },
				body: { background: '#f6f7f8', height: '100%', minHeight: '100%' },
				p: {
					margin: '0',
				},
			},
		},
		MuiAvatar: {
			styleOverrides: {
				root: {
					marginLeft: '0',
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					color: '#212121',
					minWidth: 'auto',
					lineHeight: '1.2',
					boxShadow: 'none',
					borderRadius: '10px',
					minHeight: '40px',
					padding: '9px 16px',
					textTransform: 'none' as const,
					fontWeight: 600,
					transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease',
					'&:focus-visible': { outline: '2px solid #b94318', outlineOffset: '3px' },
				},
				sizeSmall: { minHeight: '32px', padding: '6px 10px' },
				sizeLarge: { minHeight: '48px', padding: '12px 20px' },
				text: { minHeight: '36px', padding: '6px 10px' },
				containedPrimary: {
					backgroundColor: '#d9511e', color: '#fff', boxShadow: 'none',
					'&:hover': { backgroundColor: '#b94318', boxShadow: 'none' },
					'&.Mui-disabled': { backgroundColor: '#e8e8e8', color: '#666666' },
				},
				outlinedPrimary: {
					backgroundColor: '#fff', borderColor: '#e3e5e8', color: '#1f1f1f',
					'&:hover': { backgroundColor: '#f2f2f2', borderColor: '#bdbdbd' },
				},
				textPrimary: {
					color: '#1f1f1f',
					'&:hover': { backgroundColor: '#f2f2f2' },
				},
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: {},
			},
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					padding: '0',
				},
			},
		},
		MuiList: {
			styleOverrides: {
				root: {
					padding: '0',
				},
			},
		},
		MuiListItem: {
			styleOverrides: {
				root: {
					MuiSelect: {
						backgroundColor: '#fafafa',
					},
					padding: '0',
				},
			},
		},
		MuiFormControl: {
			styleOverrides: {
				root: {
					width: '100%',
				},
			},
		},
		MuiFormControlLabel: {
			styleOverrides: {
				root: {
					marginRight: '0',
				},
			},
		},
		MuiSelect: {
			styleOverrides: {
				root: {},
				select: {
					textAlign: 'left',
				},
			},
		},
		MuiInputBase: {
			styleOverrides: {
				input: { lineHeight: 1.5, '&::placeholder': { color: '#758076', opacity: 1 } },
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: { color: '#666666', '&.Mui-focused': { color: '#984019' } },
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					height: '44px',
					width: '100%',
					backgroundColor: '#fff',
					color: '#1f1f1f',
					borderRadius: '10px',
					'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#bdbdbd' },
					'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#d9511e' },
					'&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: '#b3261e' },
					'&.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: '#e3e5e8' },
					'&.MuiInputBase-multiline': { height: 'auto', alignItems: 'flex-start' },
				},
				notchedOutline: {
					padding: '0 8px',
					top: '-5px',
					borderColor: '#e3e5e8',
					transition: 'border-color 160ms ease',
				},
			},
		},
		MuiFormHelperText: {
			styleOverrides: {
				root: {
					margin: '5px 0 0 2px',
					lineHeight: '1.2',
				},
			},
		},
		MuiStepper: {
			styleOverrides: {
				root: {
					alignItems: 'center',
				},
			},
		},
		MuiTabPanel: {
			styleOverrides: {
				root: {
					padding: '0',
				},
			},
		},
		MuiSvgIcon: {
			styleOverrides: {
				root: {},
			},
		},
		MuiStepIcon: {
			styleOverrides: {
				root: {
					color: '#fff',
					borderRadius: '50%',
					border: '1px solid #eee',
				},
				text: {
					fill: '#bdbdbd',
				},
			},
		},
		MuiStepConnector: {
			styleOverrides: {
				line: {
					borderColor: '#eee',
				},
			},
		},
		MuiStepLabel: {
			styleOverrides: {
				label: {
					fontSize: '14px',
				},
			},
		},
		MuiCheckbox: {
			styleOverrides: {
				root: {
					'&.Mui-checked': {
						color: '#d9511e',
					},
				},
			},
		},
		MuiFab: {
			styleOverrides: {
				root: {
					width: '40px',
					height: '40px',
					background: '#fff',
					color: '#212121',
				},
				hover: {
					background: '#fff',
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					MuiMenu: {
						boxShadow: 'rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) -20px 20px 40px -4px',
					},
				},
			},
		},
		MuiMenu: {
			styleOverrides: {
				paper: { border: '1px solid #e3e5e8', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' },
				list: { padding: '6px' },
			},
		},
		MuiMenuItem: {
			styleOverrides: {
				root: {
					minHeight: '36px', padding: '7px 12px', borderRadius: '10px',
					transition: 'background-color 160ms ease, color 160ms ease',
					'&:hover, &.Mui-focusVisible': { backgroundColor: '#f2f2f2' },
					'&.Mui-selected': { backgroundColor: '#fff1e8', color: '#b94318' },
					'&.Mui-selected:hover': { backgroundColor: '#f2f2f2' },
				},
			},
		},
		MuiAlert: {
			styleOverrides: {
				root: {
					boxShadow: 'none',
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					border: '1px solid #e3e5e8',
					color: '#212121',
				},
			},
		},
	},
	shadow,
	typography,
} as const;
