import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	Button,
	CircularProgress,
	IconButton,
	InputAdornment,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ApolloError } from '@apollo/client';
import toast from 'react-hot-toast';
import withLayoutAuth from '../../libs/components/layout/LayoutAuth';
import { logIn, signUp } from '../../libs/auth';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'], {
			...require('../../next-i18next.config'),
			reloadOnPrerender: process.env.NODE_ENV === 'development',
		})),
	},
});

const Join: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [busy, setBusy] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const nickInvalid = input.nick.trim().length < 3 || input.nick.trim().length > 12;
	const passwordInvalid = input.password.length < 5 || input.password.length > 12;
	const phoneInvalid = !input.phone.trim();
	const handleInput = (name: keyof typeof input, value: string) =>
		setInput((previous) => ({ ...previous, [name]: value }));
	const switchView = () => {
		setLoginView(!loginView);
		setSubmitted(false);
		setShowPassword(false);
	};
	const submit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (busy) return;
		setSubmitted(true);
		if (nickInvalid || passwordInvalid || (!loginView && phoneInvalid)) return;
		setBusy(true);
		try {
			if (loginView) await logIn(input.nick.trim(), input.password);
			else await signUp(input.nick.trim(), input.password, input.phone.trim(), input.type);
			toast.success(t(loginView ? 'authPage.signedIn' : 'authPage.accountCreated'));
		} catch (error) {
			const message = error instanceof ApolloError ? error.graphQLErrors[0]?.message : '';
			const errorKeys: Record<string, string> = {
				'No member with that member nick!': 'credentials',
				'Wrong password, try again!': 'credentials',
				'You have been blocked!': 'blocked',
				'Already used member nick or phone!': 'duplicate',
				'Not Allowed Request!': 'notAllowed',
				'Definer: login and password do not match': 'credentials',
				'Definer: user has been blocked!': 'blocked',
			};
			toast.error(t(`authPage.errors.${errorKeys[message ?? ''] ?? (loginView ? 'login' : 'signup')}`));
			setBusy(false);
			return;
		}
		const referrer = router.query.referrer;
		const destination =
			typeof referrer === 'string' && referrer.startsWith('/') && !referrer.startsWith('//') && !referrer.includes('\\')
				? referrer
				: '/';
		try {
			await router.push(destination);
		} catch {
			toast.error(t('authPage.errors.redirect'));
		} finally {
			setBusy(false);
		}
	};
	return (
		<main id="auth-main" className="tripora-join-page">
			<Stack className="auth-card">
				<header className="auth-heading">
					<span className="auth-travel-icon">
						<FlightTakeoffOutlinedIcon />
					</span>
					<p className="auth-eyebrow">{t('authPage.eyebrow')}</p>
					<Typography component="h1">{t(loginView ? 'authPage.signIn' : 'authPage.signUp')}</Typography>
					<p>{t(loginView ? 'authPage.loginDescription' : 'authPage.signupDescription')}</p>
				</header>
				<Stack component="form" className="auth-form" onSubmit={submit} noValidate aria-busy={busy}>
					<TextField
						id="auth-username"
						label={t('authPage.username')}
						placeholder={t('authPage.usernamePlaceholder')}
						autoComplete="username"
						required
						value={input.nick}
						disabled={busy}
						onChange={(event) => handleInput('nick', event.target.value)}
						error={submitted && nickInvalid}
						helperText={submitted && nickInvalid ? t('authPage.validation.username') : undefined}
						inputProps={{ maxLength: 12 }}
					/>
					<TextField
						id="auth-password"
						label={t('authPage.password')}
						placeholder={t('authPage.passwordPlaceholder')}
						type={showPassword ? 'text' : 'password'}
						autoComplete={loginView ? 'current-password' : 'new-password'}
						required
						value={input.password}
						disabled={busy}
						onChange={(event) => handleInput('password', event.target.value)}
						error={submitted && passwordInvalid}
						helperText={submitted && passwordInvalid ? t('authPage.validation.password') : undefined}
						inputProps={{ maxLength: 12 }}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										type="button"
										aria-label={t(showPassword ? 'authPage.hidePassword' : 'authPage.showPassword')}
										aria-pressed={showPassword}
										disabled={busy}
										onClick={() => setShowPassword(!showPassword)}
										edge="end"
									>
										{showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
					{!loginView && (
						<>
							<TextField
								id="auth-phone"
								label={t('authPage.phone')}
								placeholder={t('authPage.phonePlaceholder')}
								type="tel"
								autoComplete="tel"
								required
								value={input.phone}
								disabled={busy}
								onChange={(event) => handleInput('phone', event.target.value)}
								error={submitted && phoneInvalid}
								helperText={submitted && phoneInvalid ? t('authPage.validation.phone') : undefined}
							/>
							<TextField
								id="auth-member-type"
								select
								label={t('authPage.memberType')}
								value={input.type}
								disabled={busy}
								onChange={(event) => handleInput('type', event.target.value)}
							>
								<MenuItem value="USER">{t('authPage.traveller')}</MenuItem>
								<MenuItem value="AGENT">{t('authPage.agent')}</MenuItem>
							</TextField>
						</>
					)}
					<Button
						type="submit"
						variant="contained"
						disabled={busy}
						startIcon={busy ? <CircularProgress size={18} color="inherit" /> : undefined}
					>
						{t(
							busy
								? loginView
									? 'authPage.signingIn'
									: 'authPage.creatingAccount'
								: loginView
								? 'authPage.signIn'
								: 'authPage.createAccount',
						)}
					</Button>
				</Stack>
				<div className="auth-switch">
					<p>{t(loginView ? 'authPage.noAccount' : 'authPage.haveAccount')}</p>
					<Button type="button" variant="text" disabled={busy} onClick={switchView}>
						{t(loginView ? 'authPage.signUpHere' : 'authPage.signInHere')}
					</Button>
				</div>
			</Stack>
		</main>
	);
};
export default withLayoutAuth(Join);
