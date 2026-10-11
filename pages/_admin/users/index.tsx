import React, { useState } from 'react';
import {
	Avatar,
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
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import toast from 'react-hot-toast';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { AdminPagination, AdminSearch, AdminSelect, AdminState } from '../../../libs/components/admin/AdminControls';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { Members, Member } from '../../../libs/types/member/member';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { userVar } from '../../../apollo/store';
import { packageImageUrl } from '../../../libs/components/travelPackage/TravelPackageCard';
export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'], {
			...require('../../../next-i18next.config'),
			reloadOnPrerender: process.env.NODE_ENV === 'development',
		})),
	},
});
const AdminUsers = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [inquiry, setInquiry] = useState<MembersInquiry>({
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	});
	const [text, setText] = useState('');
	const [editing, setEditing] = useState<Member | null>(null);
	const [busy, setBusy] = useState(false);
	const { data, loading, error, refetch } = useQuery<{ getAllMembersByAdmin: Members }>(GET_ALL_MEMBERS_BY_ADMIN, {
		variables: { input: inquiry },
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		context: { suppressErrorAlert: true },
	});
	const [update] = useMutation(UPDATE_MEMBER_BY_ADMIN, { context: { suppressErrorAlert: true } });
	const list = data?.getAllMembersByAdmin?.list ?? [];
	const total = data?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0;
	const filter = (key: 'memberStatus' | 'memberType' | 'text', value: string) => {
		const search = { ...inquiry.search };
		if (!value || value === 'ALL') delete search[key];
		else Object.assign(search, { [key]: value });
		setInquiry({ ...inquiry, page: 1, search });
	};
	const save = async () => {
		if (!editing || busy) return;
		if (editing.memberNick.trim().length < 3 || editing.memberNick.trim().length > 12 || !editing.memberPhone.trim()) { toast.error(t('adminPage.validation')); return; }
		setBusy(true);
		try {
			const result = await update({
				variables: {
					input: {
						_id: editing._id,
						memberType: editing.memberType,
						memberStatus: editing.memberStatus,
						memberNick: editing.memberNick.trim(),
						memberPhone: editing.memberPhone.trim(),
					},
				},
			});
			setEditing(null);
			toast.success(t('adminPage.saved'));
			if (editing._id === user._id) {
				userVar({
					...user,
					memberType: result.data.updateMemberByAdmin.memberType,
					memberStatus: result.data.updateMemberByAdmin.memberStatus,
					memberNick: result.data.updateMemberByAdmin.memberNick,
					memberPhone: result.data.updateMemberByAdmin.memberPhone,
				});
				if (editing.memberType !== MemberType.ADMIN || editing.memberStatus !== MemberStatus.ACTIVE) return;
			}
			await refetch();
		} catch {
			toast.error(t('adminPage.actionError'));
		} finally {
			setBusy(false);
		}
	};
	return (
		<section className="admin-section">
			<h2>{t('adminPage.members')}</h2>
			<Stack className="admin-filters">
				<AdminSearch
					disabled={busy}
					label="searchMembers"
					value={text}
					onChange={setText}
					onApply={() => filter('text', text.trim())}
					onClear={() => {
						setText('');
						filter('text', '');
					}}
				/>
				<AdminSelect
					disabled={busy}
					label="status"
					value={inquiry.search.memberStatus ?? 'ALL'}
					options={['ALL', ...Object.values(MemberStatus)]}
					onChange={(value) => filter('memberStatus', value)}
				/>
				<AdminSelect
					disabled={busy}
					label="type"
					value={inquiry.search.memberType ?? 'ALL'}
					options={['ALL', ...Object.values(MemberType)]}
					onChange={(value) => filter('memberType', value)}
				/>
				<AdminSelect
					disabled={busy}
					label="sort"
					value={inquiry.sort ?? 'createdAt'}
					options={['createdAt', 'updatedAt', 'memberLikes', 'memberViews']}
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
								{['member', 'phone', 'type', 'status', 'packages', 'created', 'actions'].map((key) => (
									<TableCell key={key}>{t(`adminPage.${key}`)}</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{list.map((member) => (
								<TableRow key={member._id}>
									<TableCell>
										<div className="admin-identity">
											<Avatar
												src={member.memberImage ? packageImageUrl(member.memberImage) : undefined}
												alt={member.memberNick}
											/>
											<div>
												<strong>{member.memberFullName || member.memberNick}</strong>
												<small>{member.memberNick}</small>
											</div>
										</div>
									</TableCell>
									<TableCell>{member.memberPhone}</TableCell>
									<TableCell>{t(`adminPage.values.${member.memberType}`)}</TableCell>
									<TableCell>
										<span className={`admin-status status-${member.memberStatus}`}>
											{t(`adminPage.values.${member.memberStatus}`)}
										</span>
									</TableCell>
									<TableCell>{member.memberPackages ?? 0}</TableCell>
									<TableCell>{new Date(member.createdAt).toISOString().slice(0, 10)}</TableCell>
									<TableCell>
										<Button disabled={busy} onClick={() => setEditing({ ...member })}>
											{t('adminPage.edit')}
										</Button>
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
				aria-labelledby="member-edit-title"
			>
				<DialogTitle id="member-edit-title">{t('adminPage.editMember')}</DialogTitle>
				<DialogContent>
					<Stack className="admin-edit-fields">
						<TextField
							label={t('authPage.username')}
							value={editing?.memberNick ?? ''}
							disabled={busy}
							onChange={(event) => editing && setEditing({ ...editing, memberNick: event.target.value })}
						/>
						<TextField
							label={t('adminPage.phone')}
							value={editing?.memberPhone ?? ''}
							disabled={busy}
							onChange={(event) => editing && setEditing({ ...editing, memberPhone: event.target.value })}
						/>
						<AdminSelect
							disabled={busy}
							label="type"
							value={editing?.memberType ?? 'USER'}
							options={Object.values(MemberType)}
							onChange={(value) => editing && setEditing({ ...editing, memberType: value as MemberType })}
						/>
						<AdminSelect
							disabled={busy}
							label="status"
							value={editing?.memberStatus ?? 'ACTIVE'}
							options={Object.values(MemberStatus)}
							onChange={(value) => editing && setEditing({ ...editing, memberStatus: value as MemberStatus })}
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
		</section>
	);
};
export default withAdminLayout(AdminUsers);
