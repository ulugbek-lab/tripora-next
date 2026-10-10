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
			setActionError('Unable to update favorites. Please try again.');
		} finally {
			setBusy(false);
		}
	};
	return (
		<Stack className="travel-package-collection">
			<Typography component="h1" className="main-title">
				Favorite Travel Packages
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
							<TravelPackageCard key={item._id} travelPackage={item} isFavorite
								likePackageHandler={unlike} liking={busy} />
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
export default FavoriteTravelPackages;
