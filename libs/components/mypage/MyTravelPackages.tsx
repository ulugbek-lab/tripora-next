import React, { useState } from 'react';
import { Alert, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';
import { Direction } from '../../enums/common.enum';
import { TravelPackageStatus } from '../../enums/travel-package.enum';
import { AgentTravelPackagesInquiry } from '../../types/travel-package/travel-package.input';
import { TravelPackages } from '../../types/travel-package/travel-package';
import { GET_AGENT_TRAVEL_PACKAGES } from '../../../apollo/user/query';
import { UPDATE_TRAVEL_PACKAGE } from '../../../apollo/user/mutation';
import { sweetConfirmAlert } from '../../sweetAlert';
import TravelPackageCard from './TravelPackageCard';

const MyTravelPackages = () => {
	const user = useReactiveVar(userVar);
	const [inquiry, setInquiry] = useState<AgentTravelPackagesInquiry>({
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	});
	const [busy, setBusy] = useState(false);
	const [actionError, setActionError] = useState('');
	const { data, loading, error, refetch } = useQuery<{ getAgentTravelPackages: TravelPackages }>(
		GET_AGENT_TRAVEL_PACKAGES,
		{
			context: { suppressErrorAlert: true },
			variables: { input: inquiry },
			skip: !user._id || user.memberType !== MemberType.AGENT,
			fetchPolicy: 'network-only',
			notifyOnNetworkStatusChange: true,
		},
	);
	const [updatePackage] = useMutation(UPDATE_TRAVEL_PACKAGE, { context: { suppressErrorAlert: true } });
	const list = data?.getAgentTravelPackages.list ?? [],
		total = data?.getAgentTravelPackages.metaCounter?.[0]?.total ?? 0;
	const updateStatus = async (id: string, status: TravelPackageStatus) => {
		if (
			busy ||
			user.memberType !== MemberType.AGENT ||
			!list.some((item) => item._id === id && item.memberId === user._id)
		)
			return;
		if (
			!(await sweetConfirmAlert(
				status === TravelPackageStatus.DELETE
					? 'Delete this travel package? It will no longer be accessible.'
					: `Change this package to ${status === TravelPackageStatus.ACTIVE ? 'active' : 'sold out'}?`,
			))
		)
			return;
		setBusy(true);
		setActionError('');
		try {
			await updatePackage({ variables: { input: { _id: id, packageStatus: status } } });
			const result = await refetch({ input: inquiry });
			const last = Math.max(
				1,
				Math.ceil((result.data.getAgentTravelPackages.metaCounter?.[0]?.total ?? 0) / inquiry.limit),
			);
			if (inquiry.page > last) setInquiry({ ...inquiry, page: last });
		} catch {
			setActionError('Unable to update this package. Check that you own it and try again.');
		} finally {
			setBusy(false);
		}
	};
	if (user.memberType !== MemberType.AGENT)
		return <Alert severity="info">Only agents can manage travel packages.</Alert>;
	return (
		<Stack className="travel-package-management">
			<Typography component="h1" className="main-title">
				My Travel Packages
			</Typography>
			<Stack className="tab-name-box">
				{[
					['All', undefined],
					['Active', TravelPackageStatus.ACTIVE],
					['Sold out', TravelPackageStatus.SOLD_OUT],
				].map(([label, status]) => (
					<Button
						key={label}
						disabled={busy}
						className={inquiry.search.packageStatus === status ? 'active-tab-name' : 'tab-name'}
						onClick={() =>
							setInquiry({
								...inquiry,
								page: 1,
								search: status ? { packageStatus: status as TravelPackageStatus } : {},
							})
						}
					>
						{label}
					</Button>
				))}
			</Stack>
			{actionError && <Alert severity="error">{actionError}</Alert>}
			{loading ? (
				<Stack role="status">
					<CircularProgress />
					<Typography>Loading owned travel packages…</Typography>
				</Stack>
			) : error ? (
				<Alert severity="error" action={<Button onClick={() => void refetch()}>Retry packages</Button>}>
					Unable to load your packages. Please sign in as an agent and try again.
				</Alert>
			) : (
				<Stack className="list-box">
					{list.length ? (
						list.map((item) => (
							<TravelPackageCard
								key={item._id}
								travelPackage={item}
								managed
								busy={busy}
								onStatus={updateStatus}
								onDelete={(id) => updateStatus(id, TravelPackageStatus.DELETE)}
							/>
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
					<Typography>{total} travel packages</Typography>
				</Stack>
			)}
		</Stack>
	);
};
export default MyTravelPackages;
