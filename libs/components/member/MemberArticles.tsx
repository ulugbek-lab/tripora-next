import React, { useState } from 'react';
import Link from 'next/link';
import { Alert, Button, CircularProgress, IconButton, Pagination, Stack } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { GET_PUBLIC_MEMBER_ARTICLES } from '../../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { BoardArticles } from '../../types/board-article/board-article';
import { userVar } from '../../../apollo/store';
import { packageImageUrl } from '../travelPackage/TravelPackageCard';

const MemberArticles = ({ memberId }: { memberId: string }) => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const [busy, setBusy] = useState('');
	const { data, loading, error, refetch } = useQuery<{ getBoardArticles: BoardArticles }>(GET_PUBLIC_MEMBER_ARTICLES, {
		variables: { input: { page, limit: 6, sort: 'createdAt', direction: 'DESC', search: { memberId } } },
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		context: { suppressErrorAlert: true },
	});
	const [like] = useMutation(LIKE_TARGET_BOARD_ARTICLE, { context: { suppressErrorAlert: true } });
	const articles = data?.getBoardArticles?.list ?? [];
	const total = data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;
	const likeArticle = async (id: string) => {
		if (!user._id) {
			toast.error(t('agents.signIn'));
			return;
		}
		if (busy) return;
		setBusy(id);
		try {
			await like({ variables: { input: id } });
			await refetch();
		} catch {
			toast.error(t('agents.actionError'));
		} finally {
			setBusy('');
		}
	};
	return (
		<section className="profile-section">
			<h2>{t('agents.articles')}</h2>
			{loading ? (
				<Stack className="agents-state" role="status">
					<CircularProgress size={28} />
					<p>{t('agents.loading')}</p>
				</Stack>
			) : error ? (
				<Alert
					severity="error"
					action={
						<Button onClick={() => void refetch().catch(() => toast.error(t('agents.articlesError')))}>
							{t('agents.retry')}
						</Button>
					}
				>
					{t('agents.articlesError')}
				</Alert>
			) : (
				<div className="agents-grid">
					{articles.length ? (
						articles.map((article) => (
							<Stack component="article" className="profile-story" key={article._id}>
								{article.articleImage && (
									<img
										src={packageImageUrl(article.articleImage)}
										alt=""
										loading="lazy"
										onError={(event) => {
											event.currentTarget.style.display = 'none';
										}}
									/>
								)}
								<Link
									href={{
										pathname: '/community/detail',
										query: { id: article._id, articleCategory: article.articleCategory },
									}}
								>
									{article.articleTitle}
								</Link>
								<IconButton
									aria-label={t(article.meLiked?.[0]?.myFavorite ? 'agents.unlike' : 'agents.like', {
										name: article.articleTitle,
									})}
									disabled={Boolean(busy)}
									onClick={() => void likeArticle(article._id)}
								>
									{article.meLiked?.[0]?.myFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
									<small>{article.articleLikes}</small>
								</IconButton>
							</Stack>
						))
					) : (
						<p className="agents-state">{t('agents.noArticles')}</p>
					)}
				</div>
			)}
			{!loading && !error && total > 6 && (
				<Pagination
					page={page}
					count={Math.ceil(total / 6)}
					onChange={(_, next) => setPage(next)}
					shape="rounded"
					getItemAriaLabel={(type, number, selected) =>
						type === 'page'
							? t(selected ? 'marketplace.pagination.current' : 'marketplace.pagination.page', { page: number })
							: t(`marketplace.pagination.${type}`)
					}
				/>
			)}
		</section>
	);
};
export default MemberArticles;
