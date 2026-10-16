import React from 'react';
import Link from 'next/link';
import { Avatar, Button, IconButton, Stack } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EastIcon from '@mui/icons-material/East';
import { useTranslation } from 'next-i18next';
import { Member } from '../../types/member/member';
import { packageImageUrl } from '../travelPackage/TravelPackageCard';

interface AgentCardProps {
	agent: Member;
	onLike?: (id: string) => Promise<void>;
	liking?: boolean;
	onFollow?: () => void;
	following?: boolean;
	busy?: boolean;
}
const AgentCard = ({ agent, onLike, liking, onFollow, following, busy }: AgentCardProps) => {
	const { t } = useTranslation('common');
	const name = agent.memberFullName || agent.memberNick || t('agents.agent');
	const href = { pathname: '/member', query: { memberId: agent._id } };
	const liked = Boolean(agent.meLiked?.[0]?.myFavorite);
	return (
		<Stack component="article" className="tripora-agent-card">
			<Link href={href} className="agent-identity">
				<Avatar variant="rounded" src={agent.memberImage ? packageImageUrl(agent.memberImage) : undefined} alt={name}>
					{name.charAt(0)}
				</Avatar>
				<div>
					<h2>{name}</h2>
					<span className="agent-role">{t(agent.memberType === 'AGENT' ? 'agents.travelAgent' : 'agents.member')}</span>
				</div>
			</Link>
			{agent.memberDesc && <p className="agent-summary">{agent.memberDesc}</p>}
			{agent.memberAddress && (
				<p className="agent-location">
					<LocationOnOutlinedIcon fontSize="small" />
					{agent.memberAddress}
				</p>
			)}
			<div className="agent-stats">
				{agent.memberPackages !== undefined && (
					<span>
						<TravelExploreIcon />
						{t('agents.packageCount', { count: agent.memberPackages })}
					</span>
				)}
				<span>
					<VisibilityOutlinedIcon />
					{t('agents.viewCount', { count: agent.memberViews ?? 0 })}
				</span>
			</div>
			<Stack className="agent-actions">
				<Link href={href} className="agent-profile-action">
					{t('agents.viewProfile')}
					<EastIcon fontSize="small" />
				</Link>
				{onFollow && (
					<Button variant="outlined" disabled={busy} onClick={onFollow}>
						{t(following ? 'agents.unfollow' : 'agents.follow')}
					</Button>
				)}
				{onLike && (
					<IconButton
						aria-label={t(liked ? 'agents.unlike' : 'agents.like', { name })}
						aria-pressed={liked}
						disabled={liking}
						onClick={() => void onLike(agent._id)}
					>
						{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
						<small>{agent.memberLikes ?? 0}</small>
					</IconButton>
				)}
			</Stack>
		</Stack>
	);
};
export default AgentCard;
