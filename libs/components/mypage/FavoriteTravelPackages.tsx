import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { Alert, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { OrdinaryInquiry } from '../../types/travel-package/travel-package.input';
import { TravelPackages } from '../../types/travel-package/travel-package';
import TravelPackageCard from '../travelPackage/TravelPackageCard';
import { GET_FAVORITE_TRAVEL_PACKAGES } from '../../../apollo/user/query';
import { LIKE_TARGET_TRAVEL_PACKAGE } from '../../../apollo/user/mutation';

const FavoriteTravelPackages = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [inquiry, setInquiry] = useState<OrdinaryInquiry>({ page: 1, limit: 6 });
	const [busy, setBusy] = useState(false);
	const [actionError, setActionError] = useState('');
	const { data, loading, error, refetch } = useQuery<{ getFavoriteTravelPackages: TravelPackages }>(
		GET_FAVORITE_TRAVEL_PACKAGES,
		{
			context: { suppressErrorAlert: true },
			variables: { input: inquiry },
			skip: !user._id,
			fetchPolicy: 'network-only',
			notifyOnNetworkStatusChange: true,
		},
	);
	const list = data?.getFavoriteTravelPackages.list ?? [],
		total = data?.getFavoriteTravelPackages.metaCounter?.[0]?.total ?? 0;
	const [likePackage] = useMutation(LIKE_TARGET_TRAVEL_PACKAGE, { context: { suppressErrorAlert: true } });
	const unlike = async (id: string) => {
		if (busy || !user._id) return;
		setBusy(true);
		setActionError('');
		try {
			await likePackage({ variables: { input: id } });
			const result = await refetch({ input: inquiry });
			const last = Math.max(
				1,
				Math.ceil((result.data.getFavoriteTravelPackages.metaCounter?.[0]?.total ?? 0) / inquiry.limit),
			);
			if (inquiry.page > last) setInquiry({ ...inquiry, page: last });
		} catch {
			setActionError(t('myPage.actionError'));
			toast.error(t('myPage.actionError'));
		} finally {
			setBusy(false);
		}
	};
	return (
		<Stack className="travel-package-collection">
			<Typography component="h1" className="main-title">
				{t('myPage.favoriteTravelPackages')}
			</Typography>
			{actionError && <Alert severity="error">{actionError}</Alert>}
			{loading ? (
				<Stack role="status">
					<CircularProgress />
					<Typography>{t('myPage.loading')}</Typography>
				</Stack>
			) : error ? (
				<Alert
					severity="error"
					action={
						<Button onClick={() => void refetch().catch(() => toast.error(t('myPage.loadError')))}>
							{t('myPage.retry')}
						</Button>
					}
				>
					{t('myPage.loadError')}
				</Alert>
			) : (
				<Stack className="collection-list">
					{list.length ? (
						list.map((item) => (
							<TravelPackageCard
								key={item._id}
								travelPackage={item}
								marketplace
								isFavorite
								likePackageHandler={unlike}
								liking={busy}
							/>
						))
					) : (
						<Typography>{t('myPage.noFavorites')}</Typography>
					)}
				</Stack>
			)}
			{!loading && !error && total > 0 && (
				<Stack className="pagination-config">
					<Pagination
						disabled={busy}
						page={inquiry.page}
						count={Math.ceil(total / inquiry.limit)}
						onChange={(_, page) => setInquiry({ ...inquiry, page })}
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
export default FavoriteTravelPackages;
