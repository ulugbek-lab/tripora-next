import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
	Alert,
	AppBar,
	Avatar,
	Button,
	CircularProgress,
	Drawer,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	TextField,
	Toolbar,
	Typography,
	useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Toaster, toast } from 'react-hot-toast';
import { userVar } from '../../../apollo/store';
import { getJwtToken, logOut, updateUserInfo } from '../../auth';
import { MemberType } from '../../enums/member.enum';
import { packageImageUrl } from '../travelPackage/TravelPackageCard';
import AdminMenuList from '../admin/AdminMenuList';

const withAdminLayout = (Component: React.ComponentType<any>) => {
	return function AdminLayout(props: any) {
		const { t } = useTranslation('common');
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const [ready, setReady] = useState(false);
		const [drawerOpen, setDrawerOpen] = useState(false);
		const [account, setAccount] = useState<HTMLElement | null>(null);
		const mobile = useMediaQuery('(max-width:900px)');
		useEffect(() => {
			const token = getJwtToken();
			if (token) {
				try {
					updateUserInfo(token);
				} catch {
					void logOut();
				}
			}
			setReady(true);
		}, []);
		const navigation = (
			<>
				<Link href="/" className="admin-brand">
					<FlightTakeoffIcon />
					Tripora
				</Link>
				<Typography className="admin-label">{t('adminPage.admin')}</Typography>
				<AdminMenuList onNavigate={() => setDrawerOpen(false)} />
			</>
		);
		return (
			<>
				<Head>
					<title>{t('adminPage.seoTitle')}</title>
				</Head>
				<main id="pc-wrap" className="tripora-admin-shell" lang={router.locale === 'kr' ? 'ko' : router.locale}>
					{!ready ? (
						<Stack className="admin-state" role="status">
							<CircularProgress size={28} />
							<p>{t('adminPage.loading')}</p>
						</Stack>
					) : user.memberType !== MemberType.ADMIN || user.memberStatus !== 'ACTIVE' ? (
						<Stack className="admin-state">
							<Alert severity="info">{t('adminPage.accessDenied')}</Alert>
							<Button component={Link} href={user._id ? '/' : `/account/join?referrer=${encodeURIComponent(router.asPath)}`}>
								{t(user._id ? 'adminPage.home' : 'authPage.signIn')}
							</Button>
						</Stack>
					) : (
						<>
							<AppBar position="fixed" className="admin-bar">
								<Toolbar>
									<IconButton
										className="admin-menu-toggle"
										aria-label={t('adminPage.navigation')}
										onClick={() => setDrawerOpen(true)}
									>
										<MenuIcon />
									</IconButton>
									<Typography component="h1">{t('adminPage.admin')}</Typography>
									<div className="admin-bar-actions">
										<TextField
											select
											size="small"
											label={t('adminPage.language')}
											value={router.locale ?? 'en'}
											onChange={(event) =>
												void router
													.push(router.asPath, router.asPath, { locale: event.target.value })
													.catch(() => toast.error(t('adminPage.actionError')))
											}
										>
											{[
												['en', 'English'],
												['kr', '한국어'],
												['ru', 'Русский'],
												['ja', '日本語'],
												['zh', '中文'],
											].map(([code, name]) => (
												<MenuItem key={code} value={code}>
													{name}
												</MenuItem>
											))}
										</TextField>
										<IconButton
											aria-label={t('adminPage.account')}
											onClick={(event) => setAccount(event.currentTarget)}
										>
											<Avatar
												src={user.memberImage ? packageImageUrl(user.memberImage) : undefined}
												alt={user.memberNick}
											>
												{user.memberNick.charAt(0)}
											</Avatar>
										</IconButton>
									</div>
								</Toolbar>
							</AppBar>
							<Drawer
								variant={mobile ? 'temporary' : 'permanent'}
								open={mobile ? drawerOpen : true}
								onClose={() => setDrawerOpen(false)}
								PaperProps={{ className: 'tripora-admin-drawer' }}
							>
								{navigation}
							</Drawer>
							<Menu anchorEl={account} open={Boolean(account)} onClose={() => setAccount(null)}>
								<MenuItem
									onClick={async () => {
										setAccount(null);
										await logOut();
										await router.push('/');
									}}
								>
									{t('adminPage.logout')}
								</MenuItem>
							</Menu>
							<div id="bunker" className="admin-content">
								<Component {...props} />
							</div>
						</>
					)}
				</main>
				<Toaster position="top-center" toastOptions={{ duration: 3500 }} />
			</>
		);
	};
};
export default withAdminLayout;
