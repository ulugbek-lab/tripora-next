import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Toaster, toast } from 'react-hot-toast';
import HomeNavigation from '../homepage/HomeNavigation';
import Chat from '../Chat';
import HomeFooter from '../homepage/HomeFooter';
import { getJwtToken, updateUserInfo } from '../../auth';

const withLayoutDetail = (Component: React.ComponentType<any>) => {
	return function DetailLayout(props: any) {
		const { t, i18n } = useTranslation('common');
		const router = useRouter();
		useEffect(() => {
			const token = getJwtToken();
			if (token) {
				try {
					updateUserInfo(token);
				} catch {
					toast.error(t('home.feedback.sessionError'));
				}
			}
		}, []);
		return (
			<>
				<Head>
					<title>{t('detail.seoTitle')}</title>
					<meta name="description" content={t('detail.seoDescription')} />
				</Head>
				<Stack
					id="pc-wrap"
					className="tripora-home-shell tripora-detail-shell"
					lang={i18n.language === 'kr' ? 'ko' : i18n.language}
				>
					<a className="home-skip-link" href="#travel-package-detail-page">
						{t('detail.skip')}
					</a>
					<HomeNavigation />
					<Component {...props} />
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
					<div
						onClickCapture={(event) => {
							const target = event.target as HTMLElement;
							if (target.closest('a')?.getAttribute('href') === '#home-destinations-title') {
								event.preventDefault();
								void router.push('/#home-destinations-title');
							}
						}}
					>
						<HomeFooter />
					</div>
				</Stack>
				<Toaster
					position="top-center"
					toastOptions={{ duration: 3500, style: { borderRadius: '12px', fontSize: '14px' } }}
				/>
			</>
		);
	};
};
export default withLayoutDetail;
