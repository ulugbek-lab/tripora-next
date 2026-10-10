import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { IconButton, Stack, Typography } from '@mui/material';
import { SiInstagram, SiKakaotalk, SiWhatsapp, SiYoutube } from 'react-icons/si';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { userVar } from '../../../apollo/store';
const socialIcons = [
	{ label: 'Instagram', Icon: SiInstagram },
	{ label: 'KakaoTalk', Icon: SiKakaotalk },
	{ label: 'WhatsApp', Icon: SiWhatsapp },
	{ label: 'YouTube', Icon: SiYoutube },
];
const HomeFooter = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	return (
		<Stack component="footer" className="home-footer">
			<Stack className="home-footer-inner">
				<Stack className="home-footer-brand">
					<Link href="/" className="home-brand" aria-label={t('home.nav.home')}>
						<FlightTakeoffIcon />
						<span>tripora.</span>
					</Link>
					<p>
						{t('home.footer.taglineFirst')}
						<br />
						{t('home.footer.taglineSecond')}
					</p>
					{/* Placeholder buttons: add real hrefs here only when the social URLs are provided. */}
					<Stack className="home-footer-social" role="group" aria-label={t('home.footer.socialLabel')}>
						{socialIcons.map(({ label, Icon }) => (
							<IconButton
								key={label}
								type="button"
								aria-label={label}
								title={t('home.footer.socialPlaceholder', { brand: label })}
							>
								<Icon aria-hidden="true" focusable="false" />
							</IconButton>
						))}
					</Stack>
				</Stack>
				<Stack className="home-footer-columns">
					<Stack component="nav" aria-label={t('home.footer.explore')}>
						<Typography component="h3">{t('home.footer.explore')}</Typography>
						<Link href="/travel-package">{t('home.footer.packages')}</Link>
						<a href="#home-destinations-title">{t('home.footer.destinations')}</a>
						<Link href="/community?articleCategory=TRAVEL_STORY">{t('home.footer.community')}</Link>
					</Stack>
					<Stack component="nav" aria-label={t('home.footer.tripora')}>
						<Typography component="h3">{t('home.footer.tripora')}</Typography>
						<Link href="/about">{t('home.footer.about')}</Link>
						<Link href="/agent">{t('home.footer.agents')}</Link>
					</Stack>
					<Stack component="nav" aria-label={t('home.footer.support')}>
						<Typography component="h3">{t('home.footer.support')}</Typography>
						<Link href="/cs">{t('home.footer.cs')}</Link>
						<Link href="/cs?tab=faq">{t('home.footer.faq')}</Link>
					</Stack>
					<Stack component="nav" aria-label={t('home.footer.account')}>
						<Typography component="h3">{t('home.footer.account')}</Typography>
						{user._id ? (
							<>
								<Link href="/mypage">{t('home.nav.myPage')}</Link>
								<Link href="/mypage?category=favoriteTravelPackages">{t('home.nav.saved')}</Link>
							</>
						) : (
							<Link href="/account/join">{t('home.nav.signIn')}</Link>
						)}
					</Stack>
				</Stack>
			</Stack>
			<Stack className="home-footer-bottom">
				<p>{t('home.footer.copyright', { year: new Date().getFullYear() })}</p>
				<p>{t('home.footer.note')}</p>
			</Stack>
		</Stack>
	);
};
export default HomeFooter;
