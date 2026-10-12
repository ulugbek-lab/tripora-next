import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
	Alert,
	Avatar,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Pagination,
	TextField,
} from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import toast from 'react-hot-toast';
import { userVar } from '../../apollo/store';
import { GET_BOARD_ARTICLE, GET_COMMENTS } from '../../apollo/user/query';
import { CREATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { Comment, Comments } from '../../libs/types/comment/comment';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { Direction } from '../../libs/enums/common.enum';
import { packageImageUrl } from '../../libs/components/travelPackage/TravelPackageCard';
import withLayoutCommunityDetail from '../../libs/components/layout/LayoutCommunityDetail';

const ArticleViewer = dynamic(() => import('../../libs/components/community/TViewer'), { ssr: false });
export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'], {
			...require('../../next-i18next.config'),
			reloadOnPrerender: process.env.NODE_ENV === 'development',
		})),
	},
});
const CommunityDetail = () => {
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const articleId =
		typeof router.query.id === 'string' && /^[a-f\d]{24}$/i.test(router.query.id) ? router.query.id : '';
	const [pageState, setPageState] = useState({ id: '', page: 1 });
	const page = pageState.id === articleId ? pageState.page : 1;
	const [comment, setComment] = useState('');
	const [busy, setBusy] = useState(false);
	const [liking, setLiking] = useState(false);
	const [editing, setEditing] = useState<Comment | null>(null);
	const [editText, setEditText] = useState('');
	const [deleting, setDeleting] = useState<Comment | null>(null);
	const currentId = useRef(articleId);
	currentId.current = articleId;
	useEffect(() => {
		setComment('');
		setEditing(null);
		setDeleting(null);
	}, [articleId]);
	const inquiry = { page, limit: 5, sort: 'createdAt', direction: Direction.DESC, search: { commentRefId: articleId } };
	const { data, loading, error, refetch } = useQuery<{ getBoardArticle: BoardArticle }>(GET_BOARD_ARTICLE, {
		variables: { input: articleId },
		skip: !router.isReady || !articleId,
		fetchPolicy: 'network-only',
		context: { suppressErrorAlert: true },
	});
	const article = data?.getBoardArticle?._id === articleId ? data.getBoardArticle : undefined;
	const {
		data: commentData,
		loading: commentsLoading,
		error: commentsError,
		refetch: refetchComments,
	} = useQuery<{ getComments: Comments }>(GET_COMMENTS, {
		variables: { input: inquiry },
		skip: !article,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		context: { suppressErrorAlert: true },
	});
	const comments = commentData?.getComments.list ?? [];
	const total = commentData?.getComments.metaCounter?.[0]?.total ?? 0;
	const [likeArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE, { context: { suppressErrorAlert: true } });
	const [createComment] = useMutation(CREATE_COMMENT, { context: { suppressErrorAlert: true } });
	const [updateComment] = useMutation(UPDATE_COMMENT, { context: { suppressErrorAlert: true } });
	const liked = Boolean(article?.meLiked?.[0]?.myFavorite);
	const category =
		article?.articleCategory ??
		(Object.values(BoardArticleCategory).includes(router.query.articleCategory as BoardArticleCategory)
			? (router.query.articleCategory as BoardArticleCategory)
			: BoardArticleCategory.TRAVEL_STORY);
	const back = { pathname: '/community', query: { articleCategory: category } };
	const date = (value: Date) =>
		new Intl.DateTimeFormat(
			({ en: 'en-US', kr: 'ko-KR', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN' } as Record<string, string>)[i18n.language] ??
				'en-US',
			{ dateStyle: 'medium' },
		).format(new Date(value));
	const image = (path?: string) => (path ? (path.startsWith('/img/') ? path : packageImageUrl(path)) : undefined);
	const refreshComments = async () => {
		const result = await refetchComments();
		const count = result.data.getComments.metaCounter?.[0]?.total ?? 0;
		if (page > Math.max(1, Math.ceil(count / 5)))
			setPageState({ id: articleId, page: Math.max(1, Math.ceil(count / 5)) });
	};
	const like = async () => {
		if (!user._id) {
			toast.error(t('communityDetail.signIn'));
			return;
		}
		if (liking || !article) return;
		setLiking(true);
		try {
			await likeArticle({ variables: { input: articleId } });
			if (currentId.current === articleId) await refetch();
		} catch {
			toast.error(t('communityDetail.actionError'));
		} finally {
			setLiking(false);
		}
	};
	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!user._id) {
			toast.error(t('communityDetail.signIn'));
			return;
		}
		if (busy || !article || !comment.trim() || comment.trim().length > 100) return;
		setBusy(true);
		try {
			await createComment({
				variables: {
					input: { commentGroup: CommentGroup.ARTICLE, commentRefId: articleId, commentContent: comment.trim() },
				},
			});
			if (currentId.current === articleId) {
				setComment('');
				setPageState({ id: articleId, page: 1 });
				await refetchComments({ input: { ...inquiry, page: 1 } });
			}
			toast.success(t('communityDetail.posted'));
		} catch {
			toast.error(t('communityDetail.actionError'));
		} finally {
			setBusy(false);
		}
	};
	const changeComment = async (remove: boolean) => {
		const target = remove ? deleting : editing;
		if (
			busy ||
			!target ||
			target.memberId !== user._id ||
			(!remove && (!editText.trim() || editText.trim().length > 100))
		)
			return;
		setBusy(true);
		try {
			await updateComment({
				variables: {
					input: {
						_id: target._id,
						...(remove ? { commentStatus: CommentStatus.DELETE } : { commentContent: editText.trim() }),
					},
				},
			});
			if (currentId.current === articleId) await refreshComments();
			setEditing(null);
			setDeleting(null);
			toast.success(t(remove ? 'communityDetail.deleted' : 'communityDetail.updated'));
		} catch {
			toast.error(t('communityDetail.actionError'));
		} finally {
			setBusy(false);
		}
	};
	const notFound = !articleId || error?.graphQLErrors.some((item) => item.message === 'No data found!');
	return (
		<main id="community-detail-page" className="article-detail">
			<Link href={back} className="article-back">
				<ArrowBackIcon fontSize="small" />
				{t('communityDetail.back')}
			</Link>
			{!router.isReady || loading ? (
				<div className="article-state" role="status">
					<CircularProgress size={28} />
					<p>{t('communityDetail.loading')}</p>
				</div>
			) : error || !article ? (
				<Alert
					severity={notFound ? 'info' : 'error'}
					action={
						!notFound ? (
							<Button onClick={() => void refetch().catch(() => toast.error(t('communityDetail.loadError')))}>
								{t('communityDetail.retry')}
							</Button>
						) : undefined
					}
				>
					{t(notFound ? 'communityDetail.notFound' : 'communityDetail.loadError')}
				</Alert>
			) : (
				<>
					<Head>
						<title>{article.articleTitle} | Tripora</title>
					</Head>
					<article className="article-surface">
						<header>
							<span className="article-category">{t(`communityPage.categories.${article.articleCategory}`)}</span>
							<h1>{article.articleTitle}</h1>
							<div className="article-meta">
								<Link href={{ pathname: '/member', query: { memberId: article.memberId } }} className="article-author">
									<Avatar src={image(article.memberData?.memberImage)}>
										{article.memberData?.memberNick?.charAt(0)}
									</Avatar>
									<span>{article.memberData?.memberNick ?? t('communityDetail.member')}</span>
								</Link>
								<time dateTime={new Date(article.createdAt).toISOString()}>{date(article.createdAt)}</time>
							</div>
							<div className="article-counters">
								<span>{t('communityDetail.views', { count: article.articleViews })}</span>
								<span>{t('communityDetail.comments', { count: total })}</span>
								<Button
									type="button"
									onClick={() => void like()}
									disabled={liking}
									aria-pressed={liked}
									startIcon={liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
								>
									{t('communityDetail.likes', { count: article.articleLikes })}
								</Button>
							</div>
						</header>
						{article.articleImage && (
							<img
								className="article-cover"
								src={image(article.articleImage)}
								alt={article.articleTitle}
								onError={(event) => {
									event.currentTarget.hidden = true;
								}}
							/>
						)}
						<div className="article-content">
							<ArticleViewer markdown={article.articleContent} />
						</div>
					</article>
					<section className="article-comments" aria-labelledby="article-comments-heading">
						<h2 id="article-comments-heading">{t('communityDetail.comments', { count: total })}</h2>
						<form onSubmit={submit} className="article-comment-form">
							<TextField
								fullWidth
								multiline
								minRows={3}
								placeholder={t('communityDetail.leaveComment')}
								inputProps={{ maxLength: 100, 'aria-label': t('communityDetail.leaveComment') }}
								value={comment}
								disabled={busy}
								onChange={(event) => setComment(event.target.value)}
							/>
							<div className="comment-form-actions">
								<small>{comment.length}/100</small>
								<Button type="submit" variant="contained" disabled={busy || !comment.trim()}>
									{t(busy ? 'communityDetail.working' : 'communityDetail.submit')}
								</Button>
							</div>
						</form>
						{commentsLoading ? (
							<div className="article-state" role="status">
								<CircularProgress size={24} />
								<p>{t('communityDetail.loadingComments')}</p>
							</div>
						) : commentsError ? (
							<Alert
								severity="error"
								action={
									<Button
										onClick={() => void refetchComments().catch(() => toast.error(t('communityDetail.commentsError')))}
									>
										{t('communityDetail.retry')}
									</Button>
								}
							>
								{t('communityDetail.commentsError')}
							</Alert>
						) : !comments.length ? (
							<p className="comment-empty">{t('communityDetail.noComments')}</p>
						) : (
							comments.map((item) => (
								<article className="article-comment" key={item._id}>
									<div className="comment-heading">
										<Link className="article-author" href={{ pathname: '/member', query: { memberId: item.memberId } }}>
											<Avatar src={image(item.memberData?.memberImage)}>
												{item.memberData?.memberNick?.charAt(0)}
											</Avatar>
											<span>{item.memberData?.memberNick ?? t('communityDetail.member')}</span>
										</Link>
										<time dateTime={new Date(item.createdAt).toISOString()}>{date(item.createdAt)}</time>
										{item.memberId === user._id && (
											<div className="comment-actions">
												<IconButton
													aria-label={t('communityDetail.edit')}
													disabled={busy}
													onClick={() => {
														setEditing(item);
														setEditText(item.commentContent);
													}}
												>
													<EditOutlinedIcon fontSize="small" />
												</IconButton>
												<IconButton
													aria-label={t('communityDetail.delete')}
													disabled={busy}
													onClick={() => setDeleting(item)}
												>
													<DeleteOutlineIcon fontSize="small" />
												</IconButton>
											</div>
										)}
									</div>
									<p>{item.commentContent}</p>
								</article>
							))
						)}
						{!commentsLoading && !commentsError && total > 5 && (
							<Pagination
								shape="rounded"
								count={Math.ceil(total / 5)}
								page={page}
								onChange={(_, next) => setPageState({ id: articleId, page: next })}
								getItemAriaLabel={(type, number, selected) =>
									type === 'page'
										? t(selected ? 'marketplace.pagination.current' : 'marketplace.pagination.page', { page: number })
										: t(`marketplace.pagination.${type}`)
								}
							/>
						)}
					</section>
				</>
			)}
			<Dialog
				open={Boolean(editing)}
				onClose={() => {
					if (!busy) setEditing(null);
				}}
				fullWidth
				maxWidth="sm"
				PaperProps={{ className: 'article-comment-dialog' }}
			>
				<DialogTitle>{t('communityDetail.edit')}</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						fullWidth
						multiline
						minRows={3}
						value={editText}
						disabled={busy}
						inputProps={{ maxLength: 100, 'aria-label': t('communityDetail.leaveComment') }}
						onChange={(event) => setEditText(event.target.value)}
					/>
					<small>{editText.length}/100</small>
				</DialogContent>
				<DialogActions>
					<Button disabled={busy} onClick={() => setEditing(null)}>
						{t('communityDetail.cancel')}
					</Button>
					<Button
						variant="contained"
						disabled={busy || !editText.trim() || editText.trim() === editing?.commentContent}
						onClick={() => void changeComment(false)}
					>
						{t('communityDetail.save')}
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog
				open={Boolean(deleting)}
				onClose={() => {
					if (!busy) setDeleting(null);
				}}
				fullWidth
				maxWidth="xs"
				PaperProps={{ className: 'article-comment-dialog' }}
			>
				<DialogTitle>{t('communityDetail.delete')}</DialogTitle>
				<DialogContent>{t('communityDetail.deleteConfirm')}</DialogContent>
				<DialogActions>
					<Button disabled={busy} onClick={() => setDeleting(null)}>
						{t('communityDetail.cancel')}
					</Button>
					<Button variant="contained" disabled={busy} onClick={() => void changeComment(true)}>
						{t('communityDetail.delete')}
					</Button>
				</DialogActions>
			</Dialog>
		</main>
	);
};
export default withLayoutCommunityDetail(CommunityDetail);
