import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { Avatar, Stack } from '@mui/material';
import { packageImageUrl } from '../travelPackage/TravelPackageCard';
import { Member } from '../../types/member/member';
const TopAgentCard = ({ agent }: { agent: Member }) => {
	const { t } = useTranslation('common');
	return (
		<Link href={{ pathname: '/agent/detail', query: { agentId: agent._id } }} className="home-agent-card">
			<Avatar
				src={
					agent.memberImage
						? agent.memberImage.startsWith('/img/')
							? agent.memberImage
							: packageImageUrl(agent.memberImage)
						: undefined
				}
			>
				{agent.memberNick?.charAt(0).toUpperCase()}
			</Avatar>
			<Stack>
				<strong>{agent.memberNick}</strong>
				<span>{t('home.agents.packages', { count: agent.memberPackages ?? 0 })}</span>
				<small>{t('home.agents.profile')}</small>
			</Stack>
		</Link>
	);
};
export default TopAgentCard;
