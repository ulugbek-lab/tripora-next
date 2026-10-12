import React, { useEffect, useState } from 'react';
import { Alert, Avatar, Button, CircularProgress, Stack, TextField } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';
import { userVar } from '../../../apollo/store';
import { GET_TRAVEL_MEMBER } from '../../../apollo/user/query';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { Member } from '../../types/member/member';
import { packageImageUrl } from '../travelPackage/TravelPackageCard';

const MyProfile = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [draft, setDraft] = useState({
		memberNick: '',
		memberPhone: '',
		memberFullName: '',
		memberAddress: '',
		memberDesc: '',
		memberImage: '',
	});
	const [busy, setBusy] = useState(false);
	const { data, loading, error, refetch } = useQuery<{ getMember: Member }>(GET_TRAVEL_MEMBER, {
		variables: { input: user._id },
		skip: !user._id,
		fetchPolicy: 'network-only',
		context: { suppressErrorAlert: true },
	});
	const member = data?.getMember;
	const reset = () => {
		if (member)
			setDraft({
				memberNick: member.memberNick,
				memberPhone: member.memberPhone,
				memberFullName: member.memberFullName ?? '',
				memberAddress: member.memberAddress ?? '',
				memberDesc: member.memberDesc ?? '',
				memberImage: member.memberImage ?? '',
			});
	};
	useEffect(reset, [member]);
	const [updateMember] = useMutation(UPDATE_MEMBER, { context: { suppressErrorAlert: true } });
	const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const image = event.target.files?.[0];
		if (!image || busy) return;
		if (!['image/jpeg', 'image/png'].includes(image.type)) {
			toast.error(t('myPage.imageFormat'));
			return;
		}
		setBusy(true);
		try {
			const body = new FormData();
			body.append(
				'operations',
				JSON.stringify({
					query:
						'mutation ImageUploader($file: Upload!, $target: String!) { imageUploader(file: $file, target: $target) }',
					variables: { file: null, target: 'member' },
				}),
			);
			body.append('map', JSON.stringify({ '0': ['variables.file'] }));
			body.append('0', image);
			const result = await axios.post(process.env.REACT_APP_API_GRAPHQL_URL as string, body, {
				headers: { 'Apollo-Require-Preflight': 'true', Authorization: `Bearer ${getJwtToken()}` },
				withCredentials: true,
			});
			const path = result.data?.data?.imageUploader;
			if (!path || result.data.errors?.length) throw new Error();
			setDraft((current) => ({ ...current, memberImage: path }));
		} catch {
			toast.error(t('myPage.uploadError'));
		} finally {
			setBusy(false);
			event.target.value = '';
		}
	};
	const save = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (busy || !user._id) return;
		if (
			draft.memberNick.trim().length < 3 ||
			draft.memberNick.trim().length > 12 ||
			!draft.memberPhone.trim() ||
			(draft.memberFullName.trim() &&
				(draft.memberFullName.trim().length < 3 || draft.memberFullName.trim().length > 100))
		) {
			toast.error(t('myPage.profileValidation'));
			return;
		}
		setBusy(true);
		try {
			const input = {
				...draft,
				_id: user._id,
				memberNick: draft.memberNick.trim(),
				memberPhone: draft.memberPhone.trim(),
				...(draft.memberFullName.trim()
					? { memberFullName: draft.memberFullName.trim() }
					: { memberFullName: undefined }),
			};
			const result = await updateMember({ variables: { input } });
			const updated = result.data?.updateMember as Member & { accessToken?: string };
			const token = updated?.accessToken;
			if (!token) throw new Error();
			updateStorage({ jwtToken: token });
			updateUserInfo(token);
			userVar({ ...userVar(), memberImage: updated.memberImage ?? '' });
			await refetch();
			toast.success(t('myPage.saved'));
		} catch {
			toast.error(t('myPage.actionError'));
		} finally {
			setBusy(false);
		}
	};
	if (loading)
		return (
			<Stack className="mypage-state" role="status">
				<CircularProgress size={28} />
				<p>{t('myPage.loading')}</p>
			</Stack>
		);
	if (error || !member)
		return (
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
		);
	return (
		<Stack component="form" className="mypage-profile-form" onSubmit={save}>
			<h2>{t('myPage.myProfile')}</h2>
			<Stack className="profile-photo">
				<Avatar src={draft.memberImage ? packageImageUrl(draft.memberImage) : undefined} alt={draft.memberNick}>
					{draft.memberNick.charAt(0)}
				</Avatar>
				<Button component="label" variant="outlined" disabled={busy}>
					{t('myPage.uploadImage')}
					<input hidden type="file" accept="image/jpeg,image/png" onChange={upload} />
				</Button>
				<small>{t('myPage.imageFormat')}</small>
			</Stack>
			<div className="form-fields">
				{(['memberNick', 'memberFullName', 'memberPhone', 'memberAddress'] as const).map((field) => (
					<TextField
						key={field}
						label={t(`myPage.${field}`)}
						value={draft[field]}
						disabled={busy}
						onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}
					/>
				))}
			</div>
			<TextField
				className="profile-about-field"
				label={t('myPage.memberDesc')}
				multiline
				minRows={3}
				value={draft.memberDesc}
				disabled={busy}
				onChange={(event) => setDraft({ ...draft, memberDesc: event.target.value })}
			/>
			<p>
				{t(
					member.memberType === 'AGENT'
						? 'agents.travelAgent'
						: member.memberType === 'ADMIN'
						? 'agents.admin'
						: 'agents.member',
				)}{' '}
				· {t(`myPage.memberStatuses.${member.memberStatus}`)}
			</p>
			<Stack className="form-actions">
				<Button type="submit" variant="contained" disabled={busy}>
					{t(busy ? 'myPage.working' : 'myPage.save')}
				</Button>
				<Button type="button" variant="outlined" disabled={busy} onClick={reset}>
					{t('myPage.cancel')}
				</Button>
			</Stack>
		</Stack>
	);
};
export default MyProfile;
