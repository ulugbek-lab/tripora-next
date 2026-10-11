import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Toaster, toast } from 'react-hot-toast';
import HomeNavigation from '../homepage/HomeNavigation';
import HomeFooter from '../homepage/HomeFooter';
import { getJwtToken, updateUserInfo, logOut } from '../../auth';

const withLayoutMyPage = (Component: React.ComponentType<any>) => {
	return function MyPageLayout(props: any) {
		const { t, i18n } = useTranslation('common');
		const router = useRouter();
		useEffect(() => {
			const token = getJwtToken();
			if (token) {
				try {
					updateUserInfo(token);
				} catch {
					void logOut();
					toast.error(t('myPage.actionError'));
				}
			}
		}, []);
		return (
			<>
				<Head>
					<title>{t('myPage.seoTitle')}</title>
				</Head>
				<Stack
					id="pc-wrap"
					className="tripora-home-shell tripora-mypage-shell"
					lang={i18n.language === 'kr' ? 'ko' : i18n.language}
				>
					<a className="home-skip-link" href="#my-page">
						{t('myPage.skip')}
					</a>
					<HomeNavigation />
					<Component {...props} />
					<div
						onClickCapture={(event) => {
							if ((event.target as HTMLElement).closest('a')?.getAttribute('href') === '#home-destinations-title') {
								event.preventDefault();
								void router.push('/#home-destinations-title');
							}
						}}
					>
						<HomeFooter />
					</div>
				</Stack>
				<Toaster position="top-center" toastOptions={{ duration: 3500, style: { borderRadius: '12px' } }} />
			</>
		);
	};
};
export default withLayoutMyPage;
