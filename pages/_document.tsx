import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />

				{/* SEO */}
				<meta name="keyword" content={'Tripora, travel packages, destinations, travel community'} />
				<meta
					name={'description'}
					content="Discover travel packages, meet travel agents, and explore destinations with Tripora."
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
