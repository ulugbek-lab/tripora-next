import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import React, { useState } from 'react';
import {
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	CircularProgress,
	Pagination,
	Stack,
	Typography,
} from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';
import { Direction } from '../../enums/common.enum';
import { TravelPackageStatus } from '../../enums/travel-package.enum';
import { AgentTravelPackagesInquiry } from '../../types/travel-package/travel-package.input';
import { TravelPackages } from '../../types/travel-package/travel-package';
import { GET_AGENT_TRAVEL_PACKAGES } from '../../../apollo/user/query';
import { UPDATE_TRAVEL_PACKAGE } from '../../../apollo/user/mutation';
import TravelPackageCard from './TravelPackageCard';

const MyTravelPackages = () => {
	const { t } = useTranslation('common');
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
	const [confirmation, setConfirmation] = useState<{ id: string; status: TravelPackageStatus } | null>(null);
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
		setConfirmation({ id, status });
	};
	const commitStatus = async () => {
		if (!confirmation || busy) return;
		const { id, status } = confirmation;
		if (!list.some((item) => item._id === id && item.memberId === user._id) || user.memberType !== MemberType.AGENT)
			return;
		setConfirmation(null);
		setBusy(true);
		setActionError('');
		try {
			await updatePackage({ variables: { input: { _id: id, packageStatus: status } } });
			toast.success(t('myPage.saved'));
			const result = await refetch({ input: inquiry });
			const last = Math.max(
				1,
				Math.ceil((result.data.getAgentTravelPackages.metaCounter?.[0]?.total ?? 0) / inquiry.limit),
			);
			if (inquiry.page > last) setInquiry({ ...inquiry, page: last });
		} catch {
			setActionError(t('myPage.actionError'));
			toast.error(t('myPage.actionError'));
		} finally {
			setBusy(false);
		}
	};
	if (user.memberType !== MemberType.AGENT) return <Alert severity="info">{t('myPage.agentOnly')}</Alert>;
	return (
		<Stack className="travel-package-management">
			<Typography component="h1" className="main-title">
				{t('myPage.myTravelPackages')}
			</Typography>
			<Stack className="tab-name-box">
				{[
					['all', undefined],
					['active', TravelPackageStatus.ACTIVE],
					['soldOut', TravelPackageStatus.SOLD_OUT],
				].map(([label, status]) => (
					<Button
						key={t(`myPage.${label}`)}
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
						{t(`myPage.${label}`)}
					</Button>
				))}
			</Stack>
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
						<Typography>{t('myPage.noPackages')}</Typography>
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
			<Dialog
				className="mypage-confirm-dialog"
				open={Boolean(confirmation)}
				onClose={() => !busy && setConfirmation(null)}
				aria-labelledby="package-confirm-title"
			>
				<DialogTitle id="package-confirm-title">{t('myPage.confirmTitle')}</DialogTitle>
				<DialogContent>
					{t(confirmation?.status === TravelPackageStatus.DELETE ? 'myPage.deleteConfirm' : 'myPage.statusConfirm')}
				</DialogContent>
				<DialogActions>
					<Button disabled={busy} onClick={() => setConfirmation(null)}>
						{t('myPage.cancel')}
					</Button>
					<Button variant="contained" disabled={busy} onClick={() => void commitStatus()}>
						{t('myPage.confirm')}
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
};
export default MyTravelPackages;
