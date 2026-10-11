import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { Alert, Button, CircularProgress, Stack } from '@mui/material';
import Link from 'next/link';
import { useMutation, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import toast from 'react-hot-toast';
import { getJwtToken } from '../../libs/auth';
import withLayoutMyPage from '../../libs/components/layout/LayoutMyPage';
import MyTravelPackages from '../../libs/components/mypage/MyTravelPackages';
import AddTravelPackage from '../../libs/components/mypage/AddTravelPackage';
import FavoriteTravelPackages from '../../libs/components/mypage/FavoriteTravelPackages';
import VisitedTravelPackages from '../../libs/components/mypage/VisitedTravelPackages';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyArticles from '../../libs/components/mypage/MyArticles';
import MyMenu from '../../libs/components/mypage/MyMenu';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MemberConnections from '../../libs/components/member/MemberConnections';
import { userVar } from '../../apollo/store';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Member } from '../../libs/types/member/member';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'], {
			...require('../../next-i18next.config'),
			reloadOnPrerender: process.env.NODE_ENV === 'development',
		})),
	},
});
const aliases: Record<string, string> = {
	myProperties: 'myTravelPackages',
	addProperty: 'addTravelPackage',
	myFavorites: 'favoriteTravelPackages',
	recentlyVisited: 'visitedTravelPackages',
};
const MyPage: NextPage = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const raw = typeof router.query.category === 'string' ? router.query.category : 'myProfile';
	const section = aliases[raw] ?? raw;
	const category = [
		'myProfile',
		'myTravelPackages',
		'addTravelPackage',
		'favoriteTravelPackages',
		'visitedTravelPackages',
		'followers',
		'followings',
		'myArticles',
		'writeArticle',
	].includes(section)
		? section
		: 'myProfile';
	const [busy, setBusy] = useState(false);
	const [mounted, setMounted] = useState(false);
	useEffect(() => { setMounted(true); }, []);
	useEffect(() => {
		if (router.isReady && aliases[raw])
			void router.replace({ pathname: '/mypage', query: { ...router.query, category } }, undefined, { shallow: true });
	}, [router.isReady, raw]);
	const [subscribe] = useMutation(SUBSCRIBE, { context: { suppressErrorAlert: true } });
	const [unsubscribe] = useMutation(UNSUBSCRIBE, { context: { suppressErrorAlert: true } });
	const [like] = useMutation(LIKE_TARGET_MEMBER, { context: { suppressErrorAlert: true } });
	const follow = async (member: Member, followed: boolean, refresh: () => Promise<unknown>) => {
		if (!user._id || busy || member._id === user._id) return;
		setBusy(true);
		try {
			await (followed ? unsubscribe : subscribe)({ variables: { input: member._id } });
			await refresh();
			toast.success(t(followed ? 'agents.unfollowed' : 'agents.followed'));
		} catch {
			toast.error(t('myPage.actionError'));
		} finally {
			setBusy(false);
		}
	};
	const likeMember = async (id: string, refresh: () => Promise<unknown>) => {
		if (!user._id || busy) return;
		setBusy(true);
		try {
			await like({ variables: { input: id } });
			await refresh();
		} catch {
			toast.error(t('myPage.actionError'));
		} finally {
			setBusy(false);
		}
	};
	if (!mounted || !router.isReady || (!user._id && getJwtToken()))
		return (
			<Stack id="my-page" className="mypage-state" role="status">
				<CircularProgress size={28} />
				<p>{t('myPage.loading')}</p>
			</Stack>
		);
	if (!user._id)
		return (
			<Stack id="my-page" className="mypage-state">
				<Alert severity="info">{t('myPage.signIn')}</Alert>
				<Button component={Link} href="/account/join?referrer=%2Fmypage" variant="contained">
					{t('authPage.signIn')}
				</Button>
			</Stack>
		);
	return (
		<main id="my-page">
			<div className="mypage-container">
				<header className="mypage-heading">
					<p>{t('myPage.eyebrow')}</p>
					<h1>{t('myPage.title')}</h1>
				</header>
				<div className="mypage-layout">
					<aside>
						<MyMenu category={category} />
					</aside>
					<Stack className="mypage-content" key={`${user._id}:${category}:${router.query.id ?? ''}`}>
						{category === 'myProfile' && <MyProfile />}
						{category === 'myTravelPackages' && <MyTravelPackages />}
						{category === 'addTravelPackage' && <AddTravelPackage />}
						{category === 'favoriteTravelPackages' && <FavoriteTravelPackages />}
						{category === 'visitedTravelPackages' && <VisitedTravelPackages />}
						{category === 'myArticles' && <MyArticles />}
						{category === 'writeArticle' && <WriteArticle />}
						{(category === 'followers' || category === 'followings') && (
							<MemberConnections
								memberId={user._id}
								category={category}
								busy={busy}
								onFollow={follow}
								onLike={likeMember}
							/>
						)}
					</Stack>
				</div>
			</div>
		</main>
	);
};
export default withLayoutMyPage(MyPage);
