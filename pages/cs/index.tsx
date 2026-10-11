import React from 'react';
import { NextPage } from 'next';
import { Stack, Typography } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Faq from '../../libs/components/cs/Faq';
import withLayoutCS from '../../libs/components/layout/LayoutCS';

// Generic support contact; replace here when the production address is confirmed.
const SUPPORT_CONTACT = { email: 'support@tripora.com' };
export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'], {
			...require('../../next-i18next.config'),
			reloadOnPrerender: process.env.NODE_ENV === 'development',
		})),
	},
});
const CS: NextPage = () => {
	const { t } = useTranslation('common');
	return (
		<main id="cs-main" className="cs-page">
			<div className="cs-container">
				<header className="cs-heading">
					<p className="cs-eyebrow">{t('csPage.eyebrow')}</p>
					<Typography component="h1">{t('csPage.title')}</Typography>
					<p>{t('csPage.description')}</p>
				</header>
				<div className="cs-layout">
					<section className="cs-faq">
						<Typography component="h2">{t('csPage.faqTitle')}</Typography>
						<Faq />
					</section>
					<Stack component="aside" className="cs-contact">
						<span className="cs-contact-icon">
							<EmailOutlinedIcon />
						</span>
						<Typography component="h2">{t('csPage.contactTitle')}</Typography>
						<p>{t('csPage.contactDescription')}</p>
						<a href={`mailto:${SUPPORT_CONTACT.email}`}>{SUPPORT_CONTACT.email}</a>
						<p className="cs-contact-note">{t('csPage.agentHelp')}</p>
					</Stack>
				</div>
			</div>
		</main>
	);
};
export default withLayoutCS(CS);
