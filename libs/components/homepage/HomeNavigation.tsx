import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useApolloClient, useReactiveVar } from '@apollo/client';
import { Avatar, Button, Divider, IconButton, Menu, MenuItem, Popover, Stack, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import LanguageIcon from '@mui/icons-material/Language';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import toast from 'react-hot-toast';
import { userVar } from '../../../apollo/store';
import { packageImageUrl } from '../travelPackage/TravelPackageCard';
import { logOut } from '../../auth';

const languages = [
	{ code: 'en', name: 'English', short: 'EN' },
	{ code: 'kr', name: '한국어', short: 'KO' },
	{ code: 'ru', name: 'Русский', short: 'RU' },
	{ code: 'ja', name: '日本語', short: 'JA' },
	{ code: 'zh', name: '中文', short: 'ZH' },
];
const HomeNavigation = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const client = useApolloClient();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const [account, setAccount] = useState<HTMLElement | null>(null);
	const [language, setLanguage] = useState<HTMLElement | null>(null);
	const [notification, setNotification] = useState<HTMLElement | null>(null);
	const [switching, setSwitching] = useState(false);
	const currentLanguage = languages.find((item) => item.code === router.locale) ?? languages[0];
	const links = [
		['/', 'home.nav.homeLink'],
		['/travel-package', 'home.nav.packages'],
		['/agent', 'home.nav.agents'],
		['/community?articleCategory=TRAVEL_STORY', 'home.nav.community'],
		['/cs', 'home.nav.cs'],
	];
	useEffect(() => {
		if (router.isReady) localStorage.setItem('locale', router.locale ?? 'en');
	}, [router.locale, router.isReady]);
	const changeLanguage = async (code: string) => {
		setLanguage(null);
		setAnchor(null);
		if (switching || code === router.locale) return;
		setSwitching(true);
		try {
			// Same Pages Router locale transition used by the existing shared Top: preserve path/query/hash.
			const changed = await router.push(router.asPath, router.asPath, { locale: code });
			if (changed) localStorage.setItem('locale', code);
		} catch {
			toast.error(t('home.feedback.languageError'));
		} finally {
			setSwitching(false);
		}
	};
	const signOut = async () => {
		setAccount(null);
		logOut();
		await client.resetStore().catch(() => toast.error(t('home.feedback.refreshError')));
		toast.success(t('home.feedback.signedOut'));
	};
	return (
		<Stack component="nav" aria-label={t('home.nav.main')} className="home-navigation">
			<div className="home-brand-group">
				<Link href="/" className="home-brand" aria-label={t('home.nav.home')} aria-current="page">
					<FlightTakeoffIcon />
					<span>
						tripora<span className="brand-dot">.</span>
					</span>
				</Link>
				<Button
					component={Link}
					href="/trip-planner"
					className="home-ai-entry"
					startIcon={<AutoAwesomeIcon />}
					aria-current={router.pathname === '/trip-planner' ? 'page' : undefined}
				>
					{t('tripPlanner.aiEntry')}
				</Button>
			</div>
			<Stack className="home-nav-links">
				{links.map(([href, key]) => (
					<Link key={href} href={href} aria-current={router.pathname === href.split('?')[0] ? 'page' : undefined}>
						{t(key)}
					</Link>
				))}
			</Stack>
			<Stack className="home-nav-actions">
				<Button
					className="home-language-control"
					startIcon={<LanguageIcon />}
					aria-label={t('home.nav.chooseLanguage')}
					aria-haspopup="menu"
					aria-expanded={Boolean(language)}
					disabled={switching}
					onClick={(event) => setLanguage(event.currentTarget)}
				>
					{currentLanguage.short}
				</Button>
				<Menu
					anchorEl={language}
					open={Boolean(language)}
					onClose={() => setLanguage(null)}
					MenuListProps={{ 'aria-label': t('home.nav.language') }}
				>
					{languages.map((item) => (
						<MenuItem
							key={item.code}
							selected={item.code === router.locale}
							onClick={() => void changeLanguage(item.code)}
						>
							{item.name}
						</MenuItem>
					))}
				</Menu>
				<IconButton
					className="home-notification-control"
					aria-label={t('home.nav.notifications')}
					aria-haspopup="dialog"
					aria-expanded={Boolean(notification)}
					aria-controls={notification ? 'home-notifications' : undefined}
					onClick={(event) => setNotification(notification ? null : event.currentTarget)}
				>
					<NotificationsOutlinedIcon />
				</IconButton>
				<Popover
					id="home-notifications"
					open={Boolean(notification)}
					anchorEl={notification}
					onClose={() => setNotification(null)}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					transformOrigin={{ vertical: 'top', horizontal: 'right' }}
					PaperProps={{
						className: 'home-notification-popover',
						role: 'dialog',
						'aria-labelledby': 'home-notifications-title',
					}}
				>
					<Stack className="home-notification-heading">
						<Typography id="home-notifications-title" component="h2">
							{t('home.nav.notifications')}
						</Typography>
						<IconButton aria-label={t('home.nav.closeNotifications')} onClick={() => setNotification(null)}>
							<CloseIcon />
						</IconButton>
					</Stack>
					<Typography variant="body2">{t('home.nav.emptyNotifications')}</Typography>
				</Popover>
				{user._id ? (
					<>
						<Button
							className="home-account"
							aria-label={t('home.nav.account')}
							title={user.memberNick}
							onClick={(event) => setAccount(event.currentTarget)}
							aria-haspopup="menu"
							aria-expanded={Boolean(account)}
							startIcon={
								<Avatar
									src={
										user.memberImage
											? user.memberImage.startsWith('/img/')
												? user.memberImage
												: packageImageUrl(user.memberImage)
											: undefined
									}
									alt={user.memberNick}
									sx={{ width: 28, height: 28 }}
								>
									{user.memberNick?.charAt(0).toUpperCase()}
								</Avatar>
							}
						>
							<span className="home-account-name">{user.memberNick}</span>
						</Button>
						<Menu anchorEl={account} open={Boolean(account)} onClose={() => setAccount(null)}>
							<MenuItem component={Link} href="/mypage" onClick={() => setAccount(null)}>
								{t('home.nav.myPage')}
							</MenuItem>
							<MenuItem
								component={Link}
								href="/mypage?category=favoriteTravelPackages"
								onClick={() => setAccount(null)}
							>
								{t('home.nav.saved')}
							</MenuItem>
							<MenuItem onClick={() => void signOut()}>{t('home.nav.signOut')}</MenuItem>
						</Menu>
					</>
				) : (
					<>
						<Button className="home-signin" component={Link} href="/account/join" variant="outlined">
							{t('home.nav.signIn')}
						</Button>
						<IconButton
							className="home-signin-mobile"
							component={Link}
							href="/account/join"
							aria-label={t('home.nav.signIn')}
						>
							<AccountCircleOutlinedIcon />
						</IconButton>
					</>
				)}
				<IconButton
					className="home-mobile-menu"
					aria-label={t('home.nav.open')}
					aria-haspopup="menu"
					aria-expanded={Boolean(anchor)}
					onClick={(event) => setAnchor(event.currentTarget)}
				>
					<MenuIcon />
				</IconButton>
				<Menu
					anchorEl={anchor}
					open={Boolean(anchor)}
					onClose={() => setAnchor(null)}
					MenuListProps={{ 'aria-label': t('home.nav.main') }}
				>
					{links.map(([href, key]) => (
						<MenuItem key={href} component={Link} href={href} onClick={() => setAnchor(null)}>
							{t(key)}
						</MenuItem>
					))}
					<Divider />
					<MenuItem disabled className="home-mobile-language-heading">
						<LanguageIcon sx={{ mr: 1, fontSize: 18 }} />
						{t('home.nav.language')}
					</MenuItem>
					{languages.map((item) => (
						<MenuItem
							key={item.code}
							selected={item.code === router.locale}
							disabled={switching}
							onClick={() => void changeLanguage(item.code)}
						>
							{item.name}
						</MenuItem>
					))}
				</Menu>
			</Stack>
		</Stack>
	);
};
export default HomeNavigation;
