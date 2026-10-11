import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
	Alert,
	Button,
	CircularProgress,
	IconButton,
	InputAdornment,
	Pagination,
	Stack,
	Tab,
	Tabs,
	TextField,
	Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import toast from 'react-hot-toast';
import CommunityCard from '../../libs/components/common/CommunityCard';
import withLayoutCommunity from '../../libs/components/layout/LayoutCommunity';
import { BoardArticles } from '../../libs/types/board-article/board-article';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { Direction } from '../../libs/enums/common.enum';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'], {
			...require('../../next-i18next.config'),
			reloadOnPrerender: process.env.NODE_ENV === 'development',
		})),
	},
});

const Community: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const categories = Object.values(BoardArticleCategory);
	const category = categories.includes(router.query.articleCategory as BoardArticleCategory)
		? (router.query.articleCategory as BoardArticleCategory)
		: BoardArticleCategory.TRAVEL_STORY;
	const pageValue = Number(router.query.page);
	const page = Number.isInteger(pageValue) && pageValue > 0 && pageValue <= 2147483647 ? pageValue : 1;
	const text = typeof router.query.text === 'string' ? router.query.text.trim() : '';
	const sort = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews'].includes(String(router.query.sort))
		? String(router.query.sort)
		: 'createdAt';
	const direction = router.query.direction === Direction.DESC ? Direction.DESC : Direction.ASC;
	const inquiry: BoardArticlesInquiry = {
		page,
		limit: 6,
		sort,
		direction,
		search: { articleCategory: category, ...(text ? { text } : {}) },
	};
	const [searchText, setSearchText] = useState(text);
	const [liking, setLiking] = useState('');
	useEffect(() => {
		setSearchText(text);
	}, [text]);
	useEffect(() => {
		if (router.isReady && router.query.articleCategory !== category) {
			void router
				.replace(
					{ pathname: '/community', query: { ...router.query, articleCategory: category, page: 1 } },
					undefined,
					{ shallow: true },
				)
				.catch(() => toast.error(t('communityPage.actionError')));
		}
	}, [router.isReady, router.query.articleCategory]);
	const { data, loading, error, refetch } = useQuery<{ getBoardArticles: BoardArticles }>(GET_BOARD_ARTICLES, {
		variables: { input: inquiry },
		skip: !router.isReady,
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
		context: { suppressErrorAlert: true },
	});
	const [like] = useMutation(LIKE_TARGET_BOARD_ARTICLE, { context: { suppressErrorAlert: true } });
	const list = data?.getBoardArticles?.list ?? [];
	const total = data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;
	const updateQuery = async (changes: { articleCategory?: string; page?: number; text?: string }) => {
		const next = { ...router.query, articleCategory: category, page, ...changes };
		if (!next.text) delete next.text;
		try {
			await router.push({ pathname: '/community', query: next }, undefined, { shallow: true, scroll: false });
		} catch {
			toast.error(t('communityPage.actionError'));
		}
	};
	const likeArticle = async (id: string) => {
		if (!user._id) {
			toast.error(t('communityPage.signIn'));
			return;
		}
		if (liking) return;
		setLiking(id);
		try {
			await like({ variables: { input: id } });
			await refetch();
		} catch {
			toast.error(t('communityPage.actionError'));
		} finally {
			setLiking('');
		}
	};
	return (
		<main id="community-list-page">
			<div className="community-container">
				<header className="community-heading">
					<div>
						<p className="community-eyebrow">{t('communityPage.eyebrow')}</p>
						<Typography component="h1">{t('communityPage.title')}</Typography>
						<p>{t('communityPage.description')}</p>
					</div>
					{user._id && (
						<Button
							component={Link}
							href="/mypage?category=writeArticle"
							variant="contained"
							startIcon={<EditOutlinedIcon />}
						>
							{t('communityPage.write')}
						</Button>
					)}
				</header>
				<Stack className="community-controls">
					<Tabs
						value={category}
						variant="scrollable"
						scrollButtons="auto"
						allowScrollButtonsMobile
						aria-label={t('communityPage.categoriesLabel')}
						onChange={(_, value) => void updateQuery({ articleCategory: value, page: 1 })}
					>
						{categories.map((value) => (
							<Tab key={value} value={value} label={t(`communityPage.categories.${value}`)} />
						))}
					</Tabs>
					<Stack
						component="form"
						className="community-search"
						onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
							event.preventDefault();
							void updateQuery({ text: searchText.trim(), page: 1 });
						}}
					>
						<TextField
							label={t('communityPage.search')}
							placeholder={t('communityPage.searchPlaceholder')}
							value={searchText}
							onChange={(event) => setSearchText(event.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
								endAdornment: searchText ? (
									<InputAdornment position="end">
										<IconButton
											type="button"
											size="small"
											aria-label={t('communityPage.clearSearch')}
											onClick={() => {
												setSearchText('');
												void updateQuery({ text: '', page: 1 });
											}}
										>
											<CloseIcon fontSize="small" />
										</IconButton>
									</InputAdornment>
								) : undefined,
							}}
						/>
						<Button type="submit" variant="outlined">
							{t('communityPage.searchButton')}
						</Button>
					</Stack>
				</Stack>
				{loading || !router.isReady ? (
					<Stack className="community-state" role="status">
						<CircularProgress size={28} />
						<p>{t('communityPage.loading')}</p>
					</Stack>
				) : error ? (
					<Alert
						severity="error"
						action={
							<Button onClick={() => void refetch().catch(() => toast.error(t('communityPage.loadError')))}>
								{t('communityPage.retry')}
							</Button>
						}
					>
						{t('communityPage.loadError')}
					</Alert>
				) : (
					<>
						<p className="community-result">{t('communityPage.results', { count: total })}</p>
						{list.length ? (
							<div className="community-grid">
								{list.map((article) => (
									<CommunityCard
										key={article._id}
										boardArticle={article}
										tripora
										onLike={likeArticle}
										busy={Boolean(liking)}
									/>
								))}
							</div>
						) : (
							<Stack className="community-state">
								<p>{t('communityPage.empty')}</p>
							</Stack>
						)}
						{total > inquiry.limit && (
							<Pagination
								page={page}
								count={Math.ceil(total / inquiry.limit)}
								onChange={(_, value) => void updateQuery({ page: value })}
								shape="rounded"
								getItemAriaLabel={(type, number, selected) =>
									type === 'page'
										? t(selected ? 'marketplace.pagination.current' : 'marketplace.pagination.page', { page: number })
										: t(`marketplace.pagination.${type}`)
								}
							/>
						)}
					</>
				)}
			</div>
		</main>
	);
};
export default withLayoutCommunity(Community);
