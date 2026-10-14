import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useState } from 'react';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
// Next.js 14 Pages Router requires explicitly loading client instrumentation.
import '../instrumentation-client';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	// @ts-ignore
	const [theme, setTheme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);

	return (
		//useQuery, useMutation
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		</ApolloProvider>
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
