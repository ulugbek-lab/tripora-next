import React, { useState } from 'react';
import { Alert, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_TRAVEL_PACKAGES } from '../../../apollo/user/query';
import { TravelPackages } from '../../types/travel-package/travel-package';
import { Direction } from '../../enums/common.enum';
import TravelPackageCard from '../mypage/TravelPackageCard';

const MemberTravelPackages = ({ memberId, limit = 5 }: { memberId?: string; limit?: number }) => {
	const router = useRouter();
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
	if (!owner) return <Alert severity="info">Select a valid member to view travel packages.</Alert>;
	return (
		<Stack className="member-travel-packages">
			<Typography component="h2" className="main-title">
				Travel Packages
			</Typography>
			{loading ? (
				<Stack role="status">
					<CircularProgress />
					<Typography>Loading travel packages…</Typography>
				</Stack>
			) : error ? (
				<Alert severity="error" action={<Button onClick={() => void refetch()}>Retry packages</Button>}>
					Unable to load this member's travel packages.
				</Alert>
			) : (
				<Stack className="list-box">
					{list.length ? (
						list.map((item) => <TravelPackageCard key={item._id} travelPackage={item} />)
					) : (
						<Typography>No travel packages found.</Typography>
					)}
				</Stack>
			)}
			{!loading && !error && total > 0 && (
				<Stack className="pagination-config">
					<Pagination
						page={inquiry.page}
						count={Math.ceil(total / limit)}
						onChange={(_, page) => setPageState({ owner, page })}
						shape="circular"
						color="primary"
					/>
					<Typography>{total} travel packages available</Typography>
				</Stack>
			)}
		</Stack>
	);
};
export default MemberTravelPackages;
