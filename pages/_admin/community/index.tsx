import React, { useState } from 'react';
import {
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
import { useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import toast from 'react-hot-toast';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { AdminPagination, AdminSelect, AdminState } from '../../../libs/components/admin/AdminControls';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_BOARD_ARTICLE_BY_ADMIN, REMOVE_BOARD_ARTICLE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { BoardArticles, BoardArticle } from '../../../libs/types/board-article/board-article';
import { AllBoardArticlesInquiry } from '../../../libs/types/board-article/board-article.input';
import { BoardArticleCategory, BoardArticleStatus } from '../../../libs/enums/board-article.enum';
import { Direction } from '../../../libs/enums/common.enum';
export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'], {
			...require('../../../next-i18next.config'),
			reloadOnPrerender: process.env.NODE_ENV === 'development',
		})),
	},
});
const AdminCommunity = () => {
	const { t } = useTranslation('common');
	const [inquiry, setInquiry] = useState<AllBoardArticlesInquiry>({
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	});
	const [editing, setEditing] = useState<BoardArticle | null>(null);
	const [removing, setRemoving] = useState<BoardArticle | null>(null);
	const [busy, setBusy] = useState(false);
	const { data, loading, error, refetch } = useQuery<{ getAllBoardArticlesByAdmin: BoardArticles }>(
		GET_ALL_BOARD_ARTICLES_BY_ADMIN,
		{
			variables: { input: inquiry },
			fetchPolicy: 'network-only',
			notifyOnNetworkStatusChange: true,
			context: { suppressErrorAlert: true },
		},
	);
	const list = data?.getAllBoardArticlesByAdmin?.list ?? [];
	const total = data?.getAllBoardArticlesByAdmin?.metaCounter?.[0]?.total ?? 0;
	const [update] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN, { context: { suppressErrorAlert: true } });
	const [remove] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN, { context: { suppressErrorAlert: true } });
	const filter = (key: 'articleStatus' | 'articleCategory', value: string) => {
		const search = { ...inquiry.search };
		if (value === 'ALL') delete search[key];
		else Object.assign(search, { [key]: value });
		setInquiry({ ...inquiry, page: 1, search });
	};
	const refresh = async () => {
		const result = await refetch();
		const last = Math.max(
			1,
			Math.ceil((result.data.getAllBoardArticlesByAdmin.metaCounter?.[0]?.total ?? 0) / inquiry.limit),
		);
		if (inquiry.page > last) setInquiry({ ...inquiry, page: last });
	};
	const save = async () => {
		if (!editing || busy) return;
		if (editing.articleTitle.trim().length < 3 || editing.articleTitle.trim().length > 500) {
			toast.error(t('adminPage.validation'));
			return;
		}
		setBusy(true);
		try {
			await update({
				variables: {
					input: { _id: editing._id, articleTitle: editing.articleTitle.trim(), articleStatus: editing.articleStatus },
				},
			});
			setEditing(null);
			toast.success(t('adminPage.saved'));
			await refresh();
		} catch {
			toast.error(t('adminPage.actionError'));
		} finally {
			setBusy(false);
		}
	};
	const removeArticle = async () => {
		if (!removing || removing.articleStatus !== BoardArticleStatus.DELETE || busy) return;
		setBusy(true);
		try {
			await remove({ variables: { input: removing._id } });
			setRemoving(null);
			toast.success(t('adminPage.removed'));
			await refresh();
		} catch {
			toast.error(t('adminPage.actionError'));
		} finally {
			setBusy(false);
		}
	};
	return (
		<section className="admin-section">
			<h2>{t('adminPage.community')}</h2>
			<Stack className="admin-filters">
				<AdminSelect
					disabled={busy}
					label="status"
					value={inquiry.search.articleStatus ?? 'ALL'}
					options={['ALL', ...Object.values(BoardArticleStatus)]}
					onChange={(value) => filter('articleStatus', value)}
				/>
				<AdminSelect
					disabled={busy}
					label="category"
					value={inquiry.search.articleCategory ?? 'ALL'}
					options={['ALL', ...Object.values(BoardArticleCategory)]}
					onChange={(value) => filter('articleCategory', value)}
				/>
				<AdminSelect
					disabled={busy}
					label="sort"
					value={inquiry.sort ?? 'createdAt'}
					options={['createdAt', 'updatedAt', 'articleViews', 'articleLikes']}
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
								{['title', 'category', 'owner', 'status', 'views', 'likes', 'created', 'actions'].map((key) => (
									<TableCell key={key}>{t(`adminPage.${key}`)}</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{list.map((article) => (
								<TableRow key={article._id}>
									<TableCell>
										<strong>{article.articleTitle}</strong>
									</TableCell>
									<TableCell>{t(`communityPage.categories.${article.articleCategory}`)}</TableCell>
									<TableCell>{article.memberData?.memberNick || article.memberId}</TableCell>
									<TableCell>
										<span className={`admin-status status-${article.articleStatus}`}>
											{t(`adminPage.values.${article.articleStatus}`)}
										</span>
									</TableCell>
									<TableCell>{article.articleViews}</TableCell>
									<TableCell>{article.articleLikes}</TableCell>
									<TableCell>{new Date(article.createdAt).toISOString().slice(0, 10)}</TableCell>
									<TableCell>
										{article.articleStatus === BoardArticleStatus.ACTIVE ? (
											<Button disabled={busy} onClick={() => setEditing({ ...article })}>
												{t('adminPage.edit')}
											</Button>
										) : (
											<Button disabled={busy} onClick={() => setRemoving(article)}>
												{t('adminPage.remove')}
											</Button>
										)}
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
				aria-labelledby="article-edit-title"
			>
				<DialogTitle id="article-edit-title">{t('adminPage.editArticle')}</DialogTitle>
				<DialogContent>
					<Stack className="admin-edit-fields">
						<TextField
							label={t('adminPage.title')}
							value={editing?.articleTitle ?? ''}
							disabled={busy}
							onChange={(event) => editing && setEditing({ ...editing, articleTitle: event.target.value })}
						/>
						<AdminSelect
							disabled={busy}
							label="status"
							value={editing?.articleStatus ?? 'ACTIVE'}
							options={Object.values(BoardArticleStatus)}
							onChange={(value) => editing && setEditing({ ...editing, articleStatus: value as BoardArticleStatus })}
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
			<Dialog
				className="admin-dialog"
				open={Boolean(removing)}
				onClose={() => !busy && setRemoving(null)}
				aria-labelledby="article-remove-title"
			>
				<DialogTitle id="article-remove-title">{t('adminPage.confirm')}</DialogTitle>
				<DialogContent>{t('adminPage.removeConfirm')}</DialogContent>
				<DialogActions>
					<Button disabled={busy} onClick={() => setRemoving(null)}>
						{t('adminPage.cancel')}
					</Button>
					<Button disabled={busy} variant="contained" onClick={() => void removeArticle()}>
						{t('adminPage.remove')}
					</Button>
				</DialogActions>
			</Dialog>
		</section>
	);
};
export default withAdminLayout(AdminCommunity);
