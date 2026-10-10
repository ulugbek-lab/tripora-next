import React, { useState } from 'react';
import { Alert, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { OrdinaryInquiry } from '../../types/travel-package/travel-package.input';
import { TravelPackages } from '../../types/travel-package/travel-package';
import TravelPackageCard from '../travelPackage/TravelPackageCard';
import { GET_VISITED_TRAVEL_PACKAGES } from '../../../apollo/user/query';

const VisitedTravelPackages = () => {
	const user = useReactiveVar(userVar);
	const [inquiry, setInquiry] = useState<OrdinaryInquiry>({ page: 1, limit: 6 });
	const [busy, setBusy] = useState(false);
	const [actionError, setActionError] = useState('');
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
				Recently Visited Travel Packages
			</Typography>
			{actionError && <Alert severity="error">{actionError}</Alert>}
			{loading ? (
				<Stack role="status">
					<CircularProgress />
					<Typography>Loading travel packages…</Typography>
				</Stack>
			) : error ? (
				<Alert severity="error" action={<Button onClick={() => void refetch()}>Retry packages</Button>}>
					Unable to load this list. Please sign in and try again.
				</Alert>
			) : (
				<Stack className="collection-list">
					{list.length ? (
						list.map((item) => (
							<TravelPackageCard key={item._id} travelPackage={item} hideEngagement liking={false} />
						))
					) : (
						<Typography>No travel packages found.</Typography>
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
						shape="circular"
						color="primary"
					/>
					<Typography>Total {total} travel packages</Typography>
				</Stack>
			)}
		</Stack>
	);
};
export default VisitedTravelPackages;
