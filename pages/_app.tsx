import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useState } from 'react';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import { Poppins } from 'next/font/google';
// Next.js 14 Pages Router requires explicitly loading client instrumentation.

import '../instrumentation-client';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const poppins = Poppins({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	style: ['normal'],
	variable: '--font-poppins',
});

const App = ({ Component, pageProps }: AppProps) => {
	// @ts-ignore
	const [theme, setTheme] = useState(
		createTheme({
			...light,
			typography: {
				...light.typography,
				fontFamily: poppins.style.fontFamily,
			},
		}),
	);
	const client = useApollo(pageProps.initialApolloState);

	return (
		//useQuery, useMutation
		<div className={`${poppins.variable} ${poppins.className}`}>
			<ApolloProvider client={client}>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<Component {...pageProps} />
				</ThemeProvider>
			</ApolloProvider>
		</div>
	);
};

export default appWithTranslation(App);

// FRONEND => GraphQl  =>  BACKEND

//1. HOOKS: useQuery & useMutation 98%   (tsx REACT file components)
//2. CLIENT: 1%     (ts TYPESCRIPT)
//3. AXIOS:  1%.     (file and img uploads)

// REACT CACHE:
// - useState vs useMemo*(saves info to cache)
// Handler vs useCallback*(save function to cache)
