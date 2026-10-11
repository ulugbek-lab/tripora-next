import React, { useState } from 'react';
import Link from 'next/link';
import { Alert, Button, CircularProgress, Pagination, Stack } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { userVar } from '../../../apollo/store';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { BoardArticles } from '../../types/board-article/board-article';
import CommunityCard from '../common/CommunityCard';
const MyArticles = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const [busy, setBusy] = useState(false);
	const { data, loading, error, refetch } = useQuery<{ getBoardArticles: BoardArticles }>(GET_BOARD_ARTICLES, {
		variables: { input: { page, limit: 6, sort: 'createdAt', direction: 'DESC', search: { memberId: user._id } } },
		skip: !user._id,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		context: { suppressErrorAlert: true },
	});
	const [like] = useMutation(LIKE_TARGET_BOARD_ARTICLE, { context: { suppressErrorAlert: true } });
	const articles = data?.getBoardArticles?.list ?? [];
	const total = data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;
	const onLike = async (id: string) => {
		if (busy || !user._id) return;
		setBusy(true);
		try {
			await like({ variables: { input: id } });
			await refetch();
		} catch {
			toast.error(t('myPage.actionError'));
		} finally {
			setBusy(false);
		}
	};
	return (
		<Stack>
			<h2>{t('myPage.myArticles')}</h2>
			<Button component={Link} href="/mypage?category=writeArticle" variant="outlined">
				{t('myPage.writeArticle')}
			</Button>
			{loading ? (
				<Stack className="mypage-state" role="status">
					<CircularProgress size={28} />
					<p>{t('myPage.loading')}</p>
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
			) : articles.length ? (
				<div className="community-grid">
					{articles.map((article) => (
						<CommunityCard key={article._id} boardArticle={article} tripora onLike={onLike} busy={busy} />
					))}
				</div>
			) : (
				<p className="mypage-state">{t('myPage.noArticles')}</p>
			)}
			{!loading && !error && total > 6 && (
				<Pagination page={page} count={Math.ceil(total / 6)} onChange={(_, value) => setPage(value)} />
			)}
		</Stack>
	);
};
export default MyArticles;
