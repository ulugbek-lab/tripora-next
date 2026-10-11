import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { Alert, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { OrdinaryInquiry } from '../../types/travel-package/travel-package.input';
import { TravelPackages } from '../../types/travel-package/travel-package';
import TravelPackageCard from '../travelPackage/TravelPackageCard';
import { GET_VISITED_TRAVEL_PACKAGES } from '../../../apollo/user/query';

const VisitedTravelPackages = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [inquiry, setInquiry] = useState<OrdinaryInquiry>({ page: 1, limit: 6 });
	const { data, loading, error, refetch } = useQuery<{ getVisitedTravelPackages: TravelPackages }>(
		GET_VISITED_TRAVEL_PACKAGES,
		{
			context: { suppressErrorAlert: true },
			variables: { input: inquiry },
			skip: !user._id,
			fetchPolicy: 'network-only',
			notifyOnNetworkStatusChange: true,
		},
	);
	const list = data?.getVisitedTravelPackages.list ?? [],
		total = data?.getVisitedTravelPackages.metaCounter?.[0]?.total ?? 0;
	return (
		<Stack className="travel-package-collection">
			<Typography component="h1" className="main-title">
				{t('myPage.visitedTravelPackages')}
			</Typography>
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
							<TravelPackageCard key={item._id} travelPackage={item} marketplace hideEngagement liking={false} />
						))
					) : (
						<Typography>{t('myPage.noVisited')}</Typography>
					)}
				</Stack>
			)}
			{!loading && !error && total > 0 && (
				<Stack className="pagination-config">
					<Pagination
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
export default VisitedTravelPackages;
