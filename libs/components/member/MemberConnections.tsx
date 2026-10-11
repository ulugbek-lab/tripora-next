import React, { useState } from 'react';
import { Alert, Button, CircularProgress, Pagination, Stack } from '@mui/material';
import { useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { GET_PUBLIC_MEMBER_FOLLOWERS, GET_PUBLIC_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { Followers, Followings } from '../../types/follow/follow';
import { Member } from '../../types/member/member';
import { userVar } from '../../../apollo/store';
import AgentCard from '../common/AgentCard';

interface Props {
	memberId: string;
	category: string;
	busy: boolean;
	onFollow: (member: Member, following: boolean, refresh: () => Promise<unknown>) => Promise<void>;
	onLike: (id: string, refresh: () => Promise<unknown>) => Promise<void>;
}
const MemberConnections = ({ memberId, category, busy, onFollow, onLike }: Props) => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const followers = category === 'followers';
	const input = { page, limit: 6, search: followers ? { followingId: memberId } : { followerId: memberId } };
	const { data, loading, error, refetch } = useQuery<{
		getMemberFollowers?: Followers;
		getMemberFollowings?: Followings;
	}>(followers ? GET_PUBLIC_MEMBER_FOLLOWERS : GET_PUBLIC_MEMBER_FOLLOWINGS, {
		variables: { input },
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		context: { suppressErrorAlert: true },
	});
	const records = followers ? data?.getMemberFollowers : data?.getMemberFollowings;
	const total = records?.metaCounter?.[0]?.total ?? 0;
	return (
		<section className="profile-section">
			<h2>{t(`agents.${category}`)}</h2>
			{loading ? (
				<Stack className="agents-state" role="status">
					<CircularProgress size={28} />
					<p>{t('agents.loading')}</p>
				</Stack>
			) : error ? (
				<Alert
					severity="error"
					action={
						<Button onClick={() => void refetch().catch(() => toast.error(t('agents.connectionsError')))}>
							{t('agents.retry')}
						</Button>
					}
				>
					{t('agents.connectionsError')}
				</Alert>
			) : (
				<>
					{records?.list.length ? (
						<div className="agents-grid">
							{records.list.map((record) => {
								const target =
									'followerData' in record
										? record.followerData
										: 'followingData' in record
										? record.followingData
										: undefined;
								if (!target) return null;
								return (
									<AgentCard
										key={record._id}
										agent={{ ...target, meLiked: record.meLiked }}
										busy={busy}
										liking={busy}
										following={Boolean(record.meFollowed?.[0]?.myFollowing)}
										onFollow={
											target._id !== user._id
												? () => void onFollow(target, Boolean(record.meFollowed?.[0]?.myFollowing), () => refetch())
												: undefined
										}
										onLike={(id) => onLike(id, () => refetch())}
									/>
								);
							})}
						</div>
					) : (
						<p className="agents-state">{t('agents.noConnections')}</p>
					)}
					{total > 6 && (
						<Pagination
							page={page}
							count={Math.ceil(total / 6)}
							onChange={(_, next) => setPage(next)}
							shape="rounded"
							getItemAriaLabel={(type, number, selected) =>
								type === 'page'
									? t(selected ? 'marketplace.pagination.current' : 'marketplace.pagination.page', { page: number })
									: t(`marketplace.pagination.${type}`)
							}
						/>
					)}
				</>
			)}
		</section>
	);
};
export default MemberConnections;
