import React from 'react';
import { Avatar, Button, Stack } from '@mui/material';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import toast from 'react-hot-toast';
import { userVar } from '../../../apollo/store';
import { Member } from '../../types/member/member';
import { packageImageUrl } from '../travelPackage/TravelPackageCard';

const TEMP_AGENT_CONTACT = { email: 'agent@tripora.com' };
const MemberMenu = ({ member, busy, onFollow }: { member: Member; busy: boolean; onFollow: () => void }) => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const name = member.memberFullName || member.memberNick || t('agents.member');
	const followed = Boolean(member.meFollowed?.[0]?.myFollowing);
	return (
		<section className="profile-overview">
			<div className="profile-information">
				<Stack className="profile-identity">
					<Avatar src={member.memberImage ? packageImageUrl(member.memberImage) : undefined} alt={name}>
						{name.charAt(0)}
					</Avatar>
					<div>
						<span className="agent-role">
							{t(
								member.memberType === 'AGENT'
									? 'agents.travelAgent'
									: member.memberType === 'ADMIN'
									? 'agents.admin'
									: 'agents.member',
							)}
						</span>
						<h1>{name}</h1>
						{member.memberAddress && (
							<p className="agent-location">
								<LocationOnOutlinedIcon fontSize="small" />
								{member.memberAddress}
							</p>
						)}
					</div>
				</Stack>
				<div className="profile-stats">
					<span>
						<b>{member.memberPackages ?? 0}</b>
						{t('agents.travelPackages')}
					</span>
					<span>
						<b>{member.memberFollowers ?? 0}</b>
						{t('agents.followers')}
					</span>
					<span>
						<b>{member.memberFollowings ?? 0}</b>
						{t('agents.followings')}
					</span>
					<span>
						<b>{member.memberLikes ?? 0}</b>
						{t('agents.likes')}
					</span>
					<span>
						<b>{member.memberViews ?? 0}</b>
						{t('agents.views')}
					</span>
				</div>
				{member.memberDesc && (
					<div className="profile-about">
						<h2>{t('agents.about')}</h2>
						<p>{member.memberDesc}</p>
					</div>
				)}
			</div>
			<Stack className="profile-contact">
				<h2>{t('agents.contact')}</h2>
				{member.memberPhone && (
					<a href={`tel:${member.memberPhone.replace(/[^+\d]/g, '')}`}>
						<PhoneOutlinedIcon />
						<span>
							<small>{t('agents.phone')}</small>
							{member.memberPhone}
						</span>
					</a>
				)}
				<a href={`mailto:${TEMP_AGENT_CONTACT.email}`}>
					<EmailOutlinedIcon />
					<span>
						<small>{t('agents.email')}</small>
						{TEMP_AGENT_CONTACT.email}
					</span>
				</a>
				{member._id !== user._id && (
					<Button variant="outlined" disabled={busy} onClick={onFollow}>
						{t(followed ? 'agents.unfollow' : 'agents.follow')}
					</Button>
				)}
				<Button
					variant="contained"
					startIcon={<ChatBubbleOutlineIcon />}
					onClick={() => toast(t('agents.messagingSoon'))}
				>
					{t('agents.message')}
				</Button>
			</Stack>
		</section>
	);
};
export default MemberMenu;
