import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Alert, Button, Skeleton, Stack, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import { GET_HOME_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticle } from '../../types/board-article/board-article';
import { Direction } from '../../enums/common.enum';
import CommunityCard from './CommunityCard';
const input = {
	page: 1,
	limit: 3,
	sort: 'articleViews',
	direction: Direction.DESC,
	search: { articleCategory: 'TRAVEL_STORY' },
};
const CommunityBoards = () => {
	const { t } = useTranslation('common');
	const { data, loading, error, refetch } = useQuery<{ getBoardArticles: { list: BoardArticle[] } }>(
		GET_HOME_BOARD_ARTICLES,
		{ context: { suppressErrorAlert: true }, fetchPolicy: 'cache-and-network', variables: { input } },
	);
	const articles = data?.getBoardArticles.list ?? [];
	const retry = async () => {
		try {
			await refetch();
		} catch {
			toast.error(t('home.community.retryError'));
		}
	};
	return (
		<Stack component="section" className="home-community" aria-labelledby="home-community-title">
			<Stack className="home-section-heading">
				<Stack>
					<Typography component="h2" id="home-community-title">
						{t('home.community.title')}
					</Typography>
					<p>{t('home.community.description')}</p>
				</Stack>
				<Link href="/community?articleCategory=TRAVEL_STORY">{t('home.community.join')}</Link>
			</Stack>
			{error ? (
				<Alert severity="error" action={<Button onClick={() => void retry()}>{t('home.community.retry')}</Button>}>
					{t('home.community.error')}
				</Alert>
			) : loading && !articles.length ? (
				<Skeleton variant="rounded" height={160} aria-label={t('home.community.loading')} />
			) : !articles.length ? (
				<Stack className="home-empty-state">
					<Typography>{t('home.community.empty')}</Typography>
					<p>{t('home.community.emptyHint')}</p>
					<Link href="/community?articleCategory=TRAVEL_STORY">{t('home.community.visit')}</Link>
				</Stack>
			) : (
				<Stack className="home-community-grid">
					{articles.map((article) => (
						<CommunityCard key={article._id} article={article} />
					))}
				</Stack>
			)}
		</Stack>
	);
};
export default CommunityBoards;
