import { NextPage } from 'next';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import PopularTravelPackages from '../libs/components/homepage/PopularTravelPackages';
import TopAgents from '../libs/components/homepage/TopAgents';
import Events from '../libs/components/homepage/Events';
import TrendingTravelPackages from '../libs/components/homepage/TrendingTravelPackages';
import TopTravelPackages from '../libs/components/homepage/TopTravelPackages';
import { Stack } from '@mui/material';
import Advertisement from '../libs/components/homepage/Advertisement';
import DestinationVideoBanner from '../libs/components/homepage/DestinationVideoBanner';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'], {
			...require('../next-i18next.config'),
			// The development server may have cached common before Home keys were added.
			reloadOnPrerender: process.env.NODE_ENV === 'development',
		})),
	},
});
const Home: NextPage = () => (
	<Stack className="home-page">
		<TrendingTravelPackages />
		<Events />
		<PopularTravelPackages />
		<DestinationVideoBanner />
		<Advertisement />
		<TopTravelPackages />
		<TopAgents />
		<CommunityBoards />
	</Stack>
);
export default withLayoutMain(Home);
