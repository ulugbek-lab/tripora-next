import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { Alert, Button, Skeleton, Stack, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import { GET_TRAVEL_AGENTS } from '../../../apollo/user/query';
import { Member } from '../../types/member/member';
import { Direction } from '../../enums/common.enum';
import TopAgentCard from './TopAgentCard';
const input = { page: 1, limit: 4, sort: 'createdAt', direction: Direction.DESC, search: {} };
const TopAgents = () => {
	const { t } = useTranslation('common');
	const { data, loading, error, refetch } = useQuery<{ getAgents: { list: Member[] } }>(GET_TRAVEL_AGENTS, {
		context: { suppressErrorAlert: true },
		fetchPolicy: 'cache-and-network',
		variables: { input },
	});
	const agents = data?.getAgents.list ?? [];
	const retry = async () => {
		try {
			await refetch();
		} catch {
			toast.error(t('home.agents.retryError'));
		}
	};
	return (
		<Stack component="section" className="home-agents" aria-labelledby="home-agents-title">
			<Stack className="home-section-heading">
				<Stack>
					<Typography component="h2" id="home-agents-title">
						{t('home.agents.title')}
					</Typography>
					<p>{t('home.agents.description')}</p>
				</Stack>
				<Link href="/agent">{t('home.agents.all')}</Link>
			</Stack>
			{error ? (
				<Alert severity="error" action={<Button onClick={() => void retry()}>{t('home.agents.retry')}</Button>}>
					{t('home.agents.error')}
				</Alert>
			) : loading && !agents.length ? (
				<Skeleton variant="rounded" height={130} aria-label={t('home.agents.loading')} />
			) : !agents.length ? (
				<Stack className="home-empty-state">{t('home.agents.empty')}</Stack>
			) : (
				<Stack className="home-agent-grid">
					{agents.map((agent) => (
						<TopAgentCard key={agent._id} agent={agent} />
					))}
				</Stack>
			)}
		</Stack>
	);
};
export default TopAgents;
