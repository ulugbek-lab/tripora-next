import React, { useState } from 'react';
import { Alert, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_TRAVEL_PACKAGES } from '../../../apollo/user/query';
import { TravelPackages } from '../../types/travel-package/travel-package';
import { Direction } from '../../enums/common.enum';
import TravelPackageCard from '../mypage/TravelPackageCard';
import MarketplaceCard from '../travelPackage/TravelPackageCard';
import { LIKE_TARGET_TRAVEL_PACKAGE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';

const MemberTravelPackages = ({
	memberId,
	limit = 5,
	publicProfile = false,
}: {
	memberId?: string;
	limit?: number;
	publicProfile?: boolean;
}) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [liking, setLiking] = useState('');
	const [like] = useMutation(LIKE_TARGET_TRAVEL_PACKAGE, { context: { suppressErrorAlert: true } });
	const raw = memberId ?? router.query.memberId;
	const owner = typeof raw === 'string' && /^[a-f\d]{24}$/i.test(raw) ? raw : '';
	const [pageState, setPageState] = useState({ owner: '', page: 1 });
	const inquiry = {
		page: pageState.owner === owner ? pageState.page : 1,
		limit,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { memberId: owner },
	};
	const { data, loading, error, refetch } = useQuery<{ getTravelPackages: TravelPackages }>(GET_TRAVEL_PACKAGES, {
		context: { suppressErrorAlert: true },
		variables: { input: inquiry },
		skip: !owner,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const list = data?.getTravelPackages.list ?? [],
		total = data?.getTravelPackages.metaCounter?.[0]?.total ?? 0;
	const likePackage = async (id: string) => {
		if (!user._id) {
			toast.error(t('agents.signIn'));
			return;
		}
		if (liking) return;
		setLiking(id);
		try {
			await like({ variables: { input: id } });
			await refetch();
		} catch {
			toast.error(t('agents.actionError'));
		} finally {
			setLiking('');
		}
	};
	if (!owner) return <Alert severity="info">{t('agents.notFound')}</Alert>;
	return (
		<Stack className={publicProfile ? 'member-packages profile-section' : 'member-travel-packages'}>
			<Typography component="h2" className="main-title">
				{t('agents.travelPackages')}
			</Typography>
			{loading ? (
				<Stack role="status">
					<CircularProgress />
					<Typography>{t('agents.loading')}</Typography>
				</Stack>
			) : error ? (
				<Alert
					severity="error"
					action={
						<Button onClick={() => void refetch().catch(() => toast.error(t('agents.packagesError')))}>
							{t('agents.retry')}
						</Button>
					}
				>
					{t('agents.packagesError')}
				</Alert>
			) : (
				<Stack className="list-box">
					{list.length ? (
						list.map((item) =>
							publicProfile ? (
								<MarketplaceCard
									key={item._id}
									travelPackage={item}
									marketplace
									liking={Boolean(liking)}
									likePackageHandler={likePackage}
								/>
							) : (
								<TravelPackageCard key={item._id} travelPackage={item} />
							),
						)
					) : (
						<Typography>{t('agents.noPackages')}</Typography>
					)}
				</Stack>
			)}
			{!loading && !error && total > 0 && (
				<Stack className="pagination-config">
					<Pagination
						page={inquiry.page}
						count={Math.ceil(total / limit)}
						onChange={(_, page) => setPageState({ owner, page })}
						shape="rounded"
						getItemAriaLabel={(type, number, selected) =>
							type === 'page'
								? t(selected ? 'marketplace.pagination.current' : 'marketplace.pagination.page', { page: number })
								: t(`marketplace.pagination.${type}`)
						}
						color="primary"
					/>
					<Typography>{t('agents.packageCount', { count: total })}</Typography>
				</Stack>
			)}
		</Stack>
	);
};
export default MemberTravelPackages;
