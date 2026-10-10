import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import Head from 'next/head';
import { Stack } from '@mui/material';
import { Toaster, toast } from 'react-hot-toast';
import HomeNavigation from '../homepage/HomeNavigation';
import HomeFooter from '../homepage/HomeFooter';
import HomeHeroBanner from '../homepage/HomeHeroBanner';
import TravelPackageHeaderFilter from '../homepage/TravelPackageHeaderFilter';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import 'swiper/css';
import 'swiper/css/navigation';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const { t, i18n } = useTranslation('common');
		useEffect(() => {
			document.documentElement.lang = i18n.language === 'kr' ? 'ko' : i18n.language;
		}, [i18n.language]);
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) {
				try {
					updateUserInfo(jwt);
				} catch {
					toast.error(t('home.feedback.sessionError'));
				}
			}
		}, []);
		return (
			<>
				<Head>
					<title>{t('home.seo.title')}</title>
					<meta name="description" content={t('home.seo.description')} />
				</Head>
				<Stack id="pc-wrap" className="tripora-home-shell" lang={i18n.language === 'kr' ? 'ko' : i18n.language}>
					<a className="home-skip-link" href="#home-main">
						{t('home.seo.skip')}
					</a>
					<HomeNavigation />
					<HomeHeroBanner videoEnabled={true}>
						<TravelPackageHeaderFilter />
					</HomeHeroBanner>
					<Stack component="main" id="home-main">
						<Component {...props} />
					</Stack>
					<Chat
						onFeedback={(message) => toast.error(message)}
						labels={{
							title: t('home.chat.title'),
							welcome: t('home.chat.welcome'),
							placeholder: t('home.chat.placeholder'),
							input: t('home.chat.input'),
							open: t('home.chat.open'),
							close: t('home.chat.close'),
							send: t('home.chat.send'),
							empty: t('home.chat.empty'),
							unavailable: t('home.chat.unavailable'),
							user: t('home.chat.user'),
						}}
					/>
					<HomeFooter />
				</Stack>
				<Toaster
					position="top-center"
					toastOptions={{ duration: 3500, style: { borderRadius: '12px', fontSize: '14px' } }}
				/>
			</>
		);
	};
};
export default withLayoutMain;
