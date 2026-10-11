import React, { useState } from 'react';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import toast from 'react-hot-toast';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { AdminPagination, AdminSearch, AdminSelect, AdminState } from '../../../libs/components/admin/AdminControls';
import { GET_ALL_TRAVEL_PACKAGES_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_TRAVEL_PACKAGE_BY_ADMIN, REMOVE_TRAVEL_PACKAGE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { TravelPackages, TravelPackage } from '../../../libs/types/travel-package/travel-package';
import { AllTravelPackagesInquiry } from '../../../libs/types/travel-package/travel-package.input';
import { TravelPackageStatus } from '../../../libs/enums/travel-package.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { packageImageUrl } from '../../../libs/components/travelPackage/TravelPackageCard';
export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'], {
			...require('../../../next-i18next.config'),
			reloadOnPrerender: process.env.NODE_ENV === 'development',
		})),
	},
});
const AdminPackages = () => {
	const { t, i18n } = useTranslation('common');
	const locale =
		({ en: 'en-US', kr: 'ko-KR', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN' } as Record<string, string>)[i18n.language] ??
		'en-US';
	const [inquiry, setInquiry] = useState<AllTravelPackagesInquiry>({
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	});
	const [country, setCountry] = useState('');
	const [editing, setEditing] = useState<TravelPackage | null>(null);
	const [removing, setRemoving] = useState<TravelPackage | null>(null);
	const [busy, setBusy] = useState(false);
	const { data, loading, error, refetch } = useQuery<{ getAllTravelPackagesByAdmin: TravelPackages }>(
		GET_ALL_TRAVEL_PACKAGES_BY_ADMIN,
		{
			variables: { input: inquiry },
			fetchPolicy: 'network-only',
			notifyOnNetworkStatusChange: true,
			context: { suppressErrorAlert: true },
		},
	);
	const list = data?.getAllTravelPackagesByAdmin?.list ?? [];
	const total = data?.getAllTravelPackagesByAdmin?.metaCounter?.[0]?.total ?? 0;
	const [update] = useMutation(UPDATE_TRAVEL_PACKAGE_BY_ADMIN, { context: { suppressErrorAlert: true } });
	const [remove] = useMutation(REMOVE_TRAVEL_PACKAGE_BY_ADMIN, { context: { suppressErrorAlert: true } });
	const filterCountry = (value: string) => {
		const search = { ...inquiry.search };
		const values = value
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
		if (values.length) search.countryList = values;
		else delete search.countryList;
		setInquiry({ ...inquiry, page: 1, search });
	};
	const refresh = async () => {
		const result = await refetch();
		const last = Math.max(
			1,
			Math.ceil((result.data.getAllTravelPackagesByAdmin.metaCounter?.[0]?.total ?? 0) / inquiry.limit),
		);
		if (inquiry.page > last) setInquiry({ ...inquiry, page: last });
	};
	const save = async () => {
		if (!editing || busy) return;
		if (
			editing.packageTitle.trim().length < 5 ||
			editing.packageTitle.trim().length > 120 ||
			!Number.isFinite(editing.packagePrice) ||
			editing.packagePrice < 0 ||
			!Number.isInteger(editing.packageMaxTravellers) ||
			editing.packageMaxTravellers < 1 ||
			!Number.isInteger(editing.packageAvailableSlots) ||
			editing.packageAvailableSlots < 0 ||
			editing.packageAvailableSlots > editing.packageMaxTravellers
		) {
			toast.error(t('adminPage.validation'));
			return;
		}
		setBusy(true);
		try {
			await update({
				variables: {
					input: {
						_id: editing._id,
						packageTitle: editing.packageTitle.trim(),
						packagePrice: editing.packagePrice,
						packageMaxTravellers: editing.packageMaxTravellers,
						packageAvailableSlots: editing.packageAvailableSlots,
						packageStatus: editing.packageStatus,
					},
				},
			});
			setEditing(null);
			toast.success(t('adminPage.saved'));
			await refresh();
		} catch {
			toast.error(t('adminPage.actionError'));
		} finally {
			setBusy(false);
		}
	};
	const removePackage = async () => {
		if (!removing || removing.packageStatus !== TravelPackageStatus.DELETE || busy) return;
		setBusy(true);
		try {
			await remove({ variables: { input: removing._id } });
			setRemoving(null);
			toast.success(t('adminPage.removed'));
			await refresh();
		} catch {
			toast.error(t('adminPage.actionError'));
		} finally {
			setBusy(false);
		}
	};
	return (
		<section className="admin-section">
			<h2>{t('adminPage.packages')}</h2>
			<Stack className="admin-filters">
				<AdminSearch
					disabled={busy}
					label="country"
					value={country}
					onChange={setCountry}
					onApply={() => filterCountry(country)}
					onClear={() => {
						setCountry('');
						filterCountry('');
					}}
				/>
				<AdminSelect
					disabled={busy}
					label="status"
					value={inquiry.search.packageStatus ?? 'ALL'}
					options={['ALL', ...Object.values(TravelPackageStatus)]}
					onChange={(value) => {
						const search = { ...inquiry.search };
						if (value === 'ALL') delete search.packageStatus;
						else search.packageStatus = value as TravelPackageStatus;
						setInquiry({ ...inquiry, page: 1, search });
					}}
				/>
				<AdminSelect
					disabled={busy}
					label="sort"
					value={inquiry.sort ?? 'createdAt'}
					options={['createdAt', 'updatedAt', 'packageViews', 'packageLikes', 'packageRank', 'packageStartDate']}
					onChange={(sort) => setInquiry({ ...inquiry, page: 1, sort })}
				/>
			</Stack>
			<AdminState
				loading={loading}
				error={Boolean(error)}
				empty={!list.length}
				retry={() => void refetch().catch(() => toast.error(t('adminPage.loadError')))}
			/>
			{!loading && !error && list.length > 0 && (
				<TableContainer>
					<Table size="small">
						<TableHead>
							<TableRow>
								{['package', 'tripDetails', 'price', 'owner', 'status', 'created', 'actions'].map((key) => (
									<TableCell key={key}>{t(`adminPage.${key}`)}</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{list.map((item) => (
								<TableRow key={item._id}>
									<TableCell>
										<div className="admin-package">
											<img
												src={
													item.packageImages?.[0]
														? packageImageUrl(item.packageImages[0])
														: '/img/travel/package-placeholder.svg'
												}
												alt=""
												onError={(event) => {
													event.currentTarget.onerror = null;
													event.currentTarget.src = '/img/travel/package-placeholder.svg';
												}}
											/>
											<div>
												<strong>{item.packageTitle}</strong>
												<small>
													{item.packageCity}, {item.packageCountry}
												</small>
												<small>{t(`home.packageTypes.${item.packageType}`)}</small>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div className="admin-trip-facts">
											<span>{t('marketplace.card.days', { count: item.packageDurationDays })}</span>
											<span>{new Date(item.packageStartDate).toISOString().slice(0, 10)} · UTC</span>
											<span>{t('marketplace.card.capacity', { count: item.packageMaxTravellers })}</span>
											<span>{t('marketplace.card.slots', { count: item.packageAvailableSlots })}</span>
										</div>
									</TableCell>
									<TableCell>
										{item.packageCurrency}{' '}
										{item.packagePrice.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
									</TableCell>
									<TableCell>{item.memberData?.memberNick || item.memberId}</TableCell>
									<TableCell>
										<span className={`admin-status status-${item.packageStatus}`}>
											{t(`adminPage.values.${item.packageStatus}`)}
										</span>
									</TableCell>
									<TableCell>{new Date(item.createdAt).toISOString().slice(0, 10)}</TableCell>
									<TableCell>
										{item.packageStatus !== TravelPackageStatus.DELETE ? (
											<Button disabled={busy} onClick={() => setEditing({ ...item })}>
												{t('adminPage.edit')}
											</Button>
										) : (
											<Button disabled={busy} onClick={() => setRemoving(item)}>
												{t('adminPage.remove')}
											</Button>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}
			{!loading && !error && total > 0 && (
				<AdminPagination
					disabled={busy}
					total={total}
					page={inquiry.page}
					limit={inquiry.limit}
					onChange={(page, limit) => setInquiry({ ...inquiry, page, limit })}
				/>
			)}
			<Dialog
				className="admin-dialog"
				open={Boolean(editing)}
				onClose={() => !busy && setEditing(null)}
				aria-labelledby="package-edit-title"
			>
				<DialogTitle id="package-edit-title">{t('adminPage.editPackage')}</DialogTitle>
				<DialogContent>
					<Stack className="admin-edit-fields">
						<TextField
							label={t('myPage.packageTitle')}
							value={editing?.packageTitle ?? ''}
							disabled={busy}
							onChange={(event) => editing && setEditing({ ...editing, packageTitle: event.target.value })}
						/>
						{(['packagePrice', 'packageMaxTravellers', 'packageAvailableSlots'] as const).map((field) => (
							<TextField
								key={field}
								type="number"
								label={t(`adminPage.${field}`)}
								value={editing?.[field] ?? ''}
								disabled={busy}
								onChange={(event) => editing && setEditing({ ...editing, [field]: Number(event.target.value) })}
							/>
						))}
						<AdminSelect
							disabled={busy}
							label="status"
							value={editing?.packageStatus ?? 'ACTIVE'}
							options={Object.values(TravelPackageStatus)}
							onChange={(value) => editing && setEditing({ ...editing, packageStatus: value as TravelPackageStatus })}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button disabled={busy} onClick={() => setEditing(null)}>
						{t('adminPage.cancel')}
					</Button>
					<Button disabled={busy} variant="contained" onClick={() => void save()}>
						{t('adminPage.save')}
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog
				className="admin-dialog"
				open={Boolean(removing)}
				onClose={() => !busy && setRemoving(null)}
				aria-labelledby="package-remove-title"
			>
				<DialogTitle id="package-remove-title">{t('adminPage.confirm')}</DialogTitle>
				<DialogContent>{t('adminPage.removeConfirm')}</DialogContent>
				<DialogActions>
					<Button disabled={busy} onClick={() => setRemoving(null)}>
						{t('adminPage.cancel')}
					</Button>
					<Button disabled={busy} variant="contained" onClick={() => void removePackage()}>
						{t('adminPage.remove')}
					</Button>
				</DialogActions>
			</Dialog>
		</section>
	);
};
export default withAdminLayout(AdminPackages);
