import React, { useRef, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import toast from 'react-hot-toast';
import withLayoutAgents from '../../libs/components/layout/LayoutAgents';
import MemberMenu from '../../libs/components/member/MemberMenu';
import MemberTravelPackages from '../../libs/components/member/MemberTravelPackages';
import MemberConnections from '../../libs/components/member/MemberConnections';
import MemberArticles from '../../libs/components/member/MemberArticles';
import { Member } from '../../libs/types/member/member';
import { GET_TRAVEL_MEMBER } from '../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE, LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'], {
			...require('../../next-i18next.config'),
			reloadOnPrerender: process.env.NODE_ENV === 'development',
		})),
	},
});

const MemberPage: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const memberId =
		typeof router.query.memberId === 'string' && /^[a-f\d]{24}$/i.test(router.query.memberId)
			? router.query.memberId
			: '';
	const category = ['followers', 'followings', 'articles'].includes(String(router.query.category))
		? String(router.query.category)
		: 'travelPackages';
	const currentId = useRef(memberId);
	currentId.current = memberId;
	const [busy, setBusy] = useState('');
	const { data, loading, error, refetch } = useQuery<{ getMember: Member | null }>(GET_TRAVEL_MEMBER, {
		variables: { input: memberId },
		skip: !router.isReady || !memberId,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		context: { suppressErrorAlert: true },
	});
	const member = data?.getMember?._id === memberId ? data.getMember : null;
	const notFound = !memberId || error?.graphQLErrors.some((item) => item.message === 'No data found!');
	const [subscribe] = useMutation(SUBSCRIBE, { context: { suppressErrorAlert: true } });
	const [unsubscribe] = useMutation(UNSUBSCRIBE, { context: { suppressErrorAlert: true } });
	const [like] = useMutation(LIKE_TARGET_MEMBER, { context: { suppressErrorAlert: true } });
	const toggleFollow = async (target: Member, followed: boolean, refresh: () => Promise<unknown>) => {
		if (!user._id) {
			toast.error(t('agents.signIn'));
			return;
		}
		if (busy || target._id === user._id) return;
		setBusy(target._id);
		try {
			await (followed ? unsubscribe : subscribe)({ variables: { input: target._id } });
			if (currentId.current === memberId) {
				await refresh();
				if (target._id !== memberId) await refetch();
			}
			toast.success(t(followed ? 'agents.unfollowed' : 'agents.followed'));
		} catch {
			toast.error(t('agents.actionError'));
		} finally {
			setBusy('');
		}
	};
	const likeMember = async (id: string, refresh: () => Promise<unknown>) => {
		if (!user._id) {
			toast.error(t('agents.signIn'));
			return;
		}
		if (busy) return;
		setBusy(id);
		try {
			await like({ variables: { input: id } });
			if (currentId.current === memberId) await refresh();
		} catch {
			toast.error(t('agents.actionError'));
		} finally {
			setBusy('');
		}
	};
	return (
		<main id="agents-main" className="agents-area">
			<div className="agents-container">
				<Link href="/agent" className="agents-back">
					<ArrowBackIcon fontSize="small" />
					{t('agents.back')}
				</Link>
				{loading || !router.isReady ? (
					<Stack className="agents-state" role="status">
						<CircularProgress size={28} />
						<p>{t('agents.loading')}</p>
					</Stack>
				) : !memberId || !member ? (
					<Stack className="agents-state">
						<Typography component="h1">{t(error && !notFound ? 'agents.profileError' : 'agents.notFound')}</Typography>
						{error && !notFound && (
							<Button onClick={() => void refetch().catch(() => toast.error(t('agents.profileError')))}>
								{t('agents.retry')}
							</Button>
						)}
					</Stack>
				) : (
					<>
						<MemberMenu
							member={member}
							busy={Boolean(busy)}
							onFollow={() => void toggleFollow(member, Boolean(member.meFollowed?.[0]?.myFollowing), () => refetch())}
						/>
						<nav className="profile-tabs" aria-label={t('agents.profileSections')}>
							{['travelPackages', 'followers', 'followings', 'articles'].map((key) => (
								<Link
									key={key}
									href={{ pathname: '/member', query: { memberId, category: key } }}
									scroll={false}
									aria-current={category === key ? 'page' : undefined}
								>
									{t(`agents.${key}`)}
								</Link>
							))}
						</nav>
						{category === 'travelPackages' && <MemberTravelPackages memberId={memberId} limit={6} publicProfile />}
						{(category === 'followers' || category === 'followings') && (
							<MemberConnections
								key={`${memberId}:${category}`}
								memberId={memberId}
								category={category}
								busy={Boolean(busy)}
								onFollow={toggleFollow}
								onLike={likeMember}
							/>
						)}
						{category === 'articles' && <MemberArticles key={memberId} memberId={memberId} />}
					</>
				)}
			</div>
		</main>
	);
};
export default withLayoutAgents(MemberPage);
