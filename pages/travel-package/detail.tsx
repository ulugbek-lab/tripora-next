import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import { Alert, Button, CircularProgress, Pagination, Stack, TextField, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import DetailGallery from '../../libs/components/travelPackage/DetailGallery';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutDetail from '../../libs/components/layout/LayoutDetail';
import Review from '../../libs/components/travelPackage/Review';
import { packageImageUrl } from '../../libs/components/travelPackage/TravelPackageCard';
import { TravelPackage } from '../../libs/types/travel-package/travel-package';
import { TravelPackageStatus } from '../../libs/enums/travel-package.enum';
import { Comments } from '../../libs/types/comment/comment';
import { CommentsInquiry, CommentInput } from '../../libs/types/comment/comment.input';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Direction } from '../../libs/enums/common.enum';
import { GET_TRAVEL_PACKAGE, GET_TRAVEL_PACKAGE_COMMENTS } from '../../apollo/user/query';
import { LIKE_TARGET_TRAVEL_PACKAGE, CREATE_COMMENT, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import posthog from 'posthog-js';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'], {
			...require('../../next-i18next.config'),
			reloadOnPrerender: process.env.NODE_ENV === 'development',
		})),
	},
});

// Temporary public-facing contact placeholders; replace with real agent contacts later.
const TEMP_AGENT_CONTACT = {
	phone: '+82 10-1234-5678',
	email: 'agent@tripora.com',
};

const TravelPackageDetail: NextPage = () => {
	const router = useRouter();
	const { t, i18n } = useTranslation('common');
	const locale =
		({ en: 'en-US', kr: 'ko-KR', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN' } as Record<string, string>)[i18n.language] ??
		'en-US';
	const user = useReactiveVar(userVar);
	const packageId =
		typeof router.query.id === 'string' && /^[a-f\d]{24}$/i.test(router.query.id) ? router.query.id : '';
	const activeId = useRef(packageId);
	activeId.current = packageId;
	const [selectedImage, setSelectedImage] = useState(0);
	const [commentPage, setCommentPage] = useState({ id: '', page: 1 });
	const [commentText, setCommentText] = useState('');
	const [action, setAction] = useState<'like' | 'follow' | 'comment' | null>(null);
	useEffect(() => {
		setSelectedImage(0);
		setCommentText('');
	}, [packageId]);

	const { data, loading, error, refetch } = useQuery<{ getTravelPackage: TravelPackage | null }>(GET_TRAVEL_PACKAGE, {
		context: { suppressErrorAlert: true },
		variables: { input: packageId },
		skip: !router.isReady || !packageId,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const item = data?.getTravelPackage?._id === packageId ? data.getTravelPackage : null;
	const available = Boolean(item && item.packageStatus !== TravelPackageStatus.DELETE);
	const viewedId = useRef('');
	useEffect(() => {
		if (!available || viewedId.current === packageId) return;
		viewedId.current = packageId;
		posthog.capture('travel_package_viewed');
	}, [available, packageId]);
	const active = item?.packageStatus === TravelPackageStatus.ACTIVE;
	const commentsInquiry: CommentsInquiry = {
		page: commentPage.id === packageId ? commentPage.page : 1,
		limit: 5,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { commentRefId: packageId },
	};
	const {
		data: commentData,
		loading: commentsLoading,
		error: commentsError,
		refetch: commentsRefetch,
	} = useQuery<{ getComments: Comments }>(GET_TRAVEL_PACKAGE_COMMENTS, {
		context: { suppressErrorAlert: true },
		variables: { input: commentsInquiry },
		skip: !router.isReady || !packageId || !available,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const comments = commentData?.getComments.list ?? [];
	const commentTotal = commentData?.getComments.metaCounter?.[0]?.total ?? 0;
	const [likePackage] = useMutation(LIKE_TARGET_TRAVEL_PACKAGE, { context: { suppressErrorAlert: true } });
	const [createComment] = useMutation(CREATE_COMMENT, { context: { suppressErrorAlert: true } });
	const [subscribe] = useMutation(SUBSCRIBE, { context: { suppressErrorAlert: true } });
	const [unsubscribe] = useMutation(UNSUBSCRIBE, { context: { suppressErrorAlert: true } });

	const likeHandler = async () => {
		if (action || !active) return;
		if (!user._id) {
			toast.error(t('detail.signInToSave'));
			return;
		}
		const targetId = packageId;
		setAction('like');
		try {
			await likePackage({ variables: { input: targetId } });
			// The mutation does not attach meLiked. Reload only this package's personalized detail.
			if (activeId.current === targetId) await refetch({ input: targetId });
		} catch {
			toast.error(t('detail.saveError'));
		} finally {
			setAction(null);
		}
	};

	const followHandler = async () => {
		if (action || !item?.memberData?._id) return;
		if (!user._id) {
			toast.error(t('detail.signInToFollow'));
			return;
		}
		const targetId = packageId,
			ownerId = item.memberData._id;
		if (ownerId === user._id) return;
		const followed = Boolean(item.memberData.meFollowed?.[0]?.myFollowing);
		setAction('follow');
		try {
			await (followed ? unsubscribe : subscribe)({ variables: { input: ownerId } });
			if (activeId.current === targetId) await refetch({ input: targetId });
		} catch {
			toast.error(t('detail.followError'));
		} finally {
			setAction(null);
		}
	};

	const createCommentHandler = async (event: React.FormEvent) => {
		event.preventDefault();
		const content = commentText.trim();
		if (action || !active || !user._id || !content || content.length > 100) return;
		const targetId = packageId;
		const input: CommentInput = {
			commentGroup: CommentGroup.TRAVEL_PACKAGE,
			commentRefId: targetId,
			commentContent: content,
		};
		setAction('comment');
		try {
			await createComment({ variables: { input } });
			if (activeId.current !== targetId) return;
			setCommentText('');
			if (commentsInquiry.page === 1) {
				await commentsRefetch({ input: commentsInquiry });
			} else {
				// Changing page triggers useQuery; do not also refetch with variables from the previous render.
				setCommentPage({ id: targetId, page: 1 });
			}
			if (activeId.current === targetId) await refetch({ input: targetId });
			toast.success(t('detail.commentAdded'));
		} catch {
			toast.error(t('detail.commentError'));
		} finally {
			setAction(null);
		}
	};

	const backLink = (
		<Link className="detail-back-link" href="/travel-package">
			<ArrowBackIcon fontSize="small" />
			{t('detail.back')}
		</Link>
	);
	if (!router.isReady || (packageId && loading))
		return (
			<Stack id="travel-package-detail-page" className="detail-state" role="status">
				<CircularProgress size={30} />
				<Typography>{t('detail.loading')}</Typography>
			</Stack>
		);
	if (!packageId)
		return (
			<Stack id="travel-package-detail-page" className="detail-state">
				<Alert severity="info">{t('detail.invalid')}</Alert>
				{backLink}
			</Stack>
		);
	if (error || !available || !item)
		return (
			<Stack id="travel-package-detail-page" className="detail-state">
				<Typography component="h1">{t('detail.unavailable')}</Typography>
				<Button
					variant="outlined"
					onClick={() => void refetch({ input: packageId }).catch(() => toast.error(t('detail.unavailable')))}
				>
					{t('detail.retry')}
				</Button>
				{backLink}
			</Stack>
		);

	const images = item.packageImages.filter(Boolean);
	const liked = Boolean(item.meLiked?.[0]?.myFavorite);
	const member = item.memberData;
	const followed = Boolean(member?.meFollowed?.[0]?.myFollowing);
	const start = new Date(item.packageStartDate);
	const dateLabel = Number.isFinite(start.getTime())
		? start.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
		: t('detail.dateUnavailable');
	return (
		<main id="travel-package-detail-page">
			<div className="detail-container">
				{backLink}
				<Stack className="travel-package-detail-config">
					<DetailGallery
						images={images}
						title={item.packageTitle}
						selected={selectedImage}
						onSelect={setSelectedImage}
					/>
					<header className="detail-heading">
						<Stack className="left-box">
							<p className="destination">
								{item.packageCity}, {item.packageCountry}
							</p>
							<Typography component="h1" className="title-main">
								{item.packageTitle}
							</Typography>
							<Stack className="detail-badges">
								<span>{t(`detail.packageTypes.${item.packageType}`)}</span>
								<span className={active ? 'status-active' : 'status-sold-out'}>
									{t(active ? 'detail.active' : 'detail.soldOut')}
								</span>
							</Stack>
						</Stack>
						<Stack className="right-box">
							<Typography className="label">{t('detail.price')}</Typography>
							<Typography className="price">
								<small>{item.packageCurrency}</small>{' '}
								{item.packagePrice.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
							</Typography>
							<Button
								className="detail-save"
								variant="outlined"
								startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
								aria-label={t(liked ? 'detail.removeSaved' : 'detail.addSaved')}
								aria-pressed={liked}
								disabled={Boolean(action) || !active}
								onClick={() => void likeHandler()}
							>
								{t(liked ? 'detail.saved' : 'detail.save')}
							</Button>
						</Stack>
					</header>
					{item.packageStatus === TravelPackageStatus.SOLD_OUT && (
						<Alert severity="info">{t('detail.soldOutHint')}</Alert>
					)}
					<Stack className="options-config">
						<Stack>
							<EventOutlinedIcon />
							<Typography className="label">{t('detail.departure')}</Typography>
							<Typography>{dateLabel}</Typography>
						</Stack>
						<Stack>
							<ScheduleIcon />
							<Typography className="label">{t('detail.duration')}</Typography>
							<Typography>{t('detail.days', { count: item.packageDurationDays })}</Typography>
						</Stack>
						<Stack>
							<PeopleOutlineIcon />
							<Typography className="label">{t('detail.capacity')}</Typography>
							<Typography>{item.packageMaxTravellers}</Typography>
						</Stack>
						<Stack>
							<ConfirmationNumberOutlinedIcon />
							<Typography className="label">{t('detail.slots')}</Typography>
							<Typography>{item.packageAvailableSlots}</Typography>
						</Stack>
					</Stack>
					<Stack className="travel-package-desc-config">
						<Stack className="left-config">
							<section className="description-config">
								<Typography component="h2" className="section-title">
									{t('detail.about')}
								</Typography>
								<Typography className="description">{item.packageDesc?.trim() || t('detail.noDescription')}</Typography>
							</section>
							<section className="reviews-config">
								<Stack className="comments-heading">
									<Typography component="h2" className="section-title">
										{t('detail.comments', { count: commentTotal })}
									</Typography>
									<span>
										<RemoveRedEyeIcon fontSize="small" />
										{t('detail.views', { count: item.packageViews })}
									</span>
								</Stack>
								{commentsLoading ? (
									<Stack className="comment-state" role="status">
										<CircularProgress size={24} />
										<Typography>{t('detail.loadingComments')}</Typography>
									</Stack>
								) : commentsError ? (
									<Alert
										severity="error"
										action={
											<Button
												onClick={() =>
													void commentsRefetch({ input: commentsInquiry }).catch(() =>
														toast.error(t('detail.commentsError')),
													)
												}
											>
												{t('detail.retry')}
											</Button>
										}
									>
										{t('detail.commentsError')}
									</Alert>
								) : comments.length ? (
									comments.map((comment) => <Review key={comment._id} comment={comment} />)
								) : (
									<Typography className="comment-state">{t('detail.noComments')}</Typography>
								)}
								{!commentsLoading && !commentsError && commentTotal > commentsInquiry.limit && (
									<Pagination
										page={commentsInquiry.page}
										count={Math.ceil(commentTotal / commentsInquiry.limit)}
										onChange={(_, page) => setCommentPage({ id: packageId, page })}
										shape="rounded"
										getItemAriaLabel={(type, page, selected) =>
											type === 'page'
												? t(selected ? 'detail.pagination.current' : 'detail.pagination.page', { page })
												: t(`detail.pagination.${type}`)
										}
									/>
								)}
							</section>
							<Stack component="form" className="leave-review-config" onSubmit={createCommentHandler}>
								<Typography component="h2" className="section-title">
									{t('detail.leaveComment')}
								</Typography>
								{!user._id && <Typography className="comment-help">{t('detail.signInToComment')}</Typography>}
								<TextField
									label={t('detail.comment')}
									placeholder={t('detail.commentPlaceholder')}
									multiline
									minRows={3}
									value={commentText}
									onChange={(event) => setCommentText(event.target.value)}
									inputProps={{ maxLength: 100 }}
									helperText={t('detail.counter', { count: commentText.length, max: 100 })}
									disabled={!user._id || !active || Boolean(action)}
								/>
								<Button
									type="submit"
									variant="contained"
									disabled={!user._id || !active || Boolean(action) || !commentText.trim()}
								>
									{t(action === 'comment' ? 'detail.submitting' : 'detail.submit')}
								</Button>
							</Stack>
						</Stack>
						<aside className="right-config">
							<Stack className="member-info">
								<Typography component="h2" className="section-title">
									{t('detail.agent')}
								</Typography>
								{member ? (
									<>
										<img
											className="member-image"
											src={member.memberImage ? packageImageUrl(member.memberImage) : '/img/profile/defaultUser.svg'}
											alt={member.memberNick}
											onError={(event) => {
												event.currentTarget.onerror = null;
												if (!event.currentTarget.src.endsWith('/img/profile/defaultUser.svg'))
													event.currentTarget.src = '/img/profile/defaultUser.svg';
											}}
										/>
										<Link
											className="member-name"
											href={member._id === user._id ? '/mypage' : `/member?memberId=${member._id}`}
										>
											{member.memberFullName || member.memberNick || t('detail.agent')}
										</Link>
										<Typography className="label">
											{t(member.memberType === 'AGENT' ? 'detail.travelAgent' : 'detail.member')}
										</Typography>

										{member.memberDesc && <Typography className="description">{member.memberDesc}</Typography>}
									</>
								) : (
									<>
										<img className="member-image" src="/img/profile/defaultUser.svg" alt="" />
										<Typography className="member-name">{t('detail.agent')}</Typography>
										<Typography className="label">{t('detail.travelAgent')}</Typography>
									</>
								)}
								<Stack className="agent-contact">
									<a href={`tel:${TEMP_AGENT_CONTACT.phone.replace(/[^+\d]/g, '')}`}>
										<PhoneOutlinedIcon aria-hidden="true" />
										<span>
											<small>{t('detail.phone')}</small>
											{TEMP_AGENT_CONTACT.phone}
										</span>
									</a>
									<a href={`mailto:${TEMP_AGENT_CONTACT.email}`}>
										<EmailOutlinedIcon aria-hidden="true" />
										<span>
											<small>{t('detail.email')}</small>
											{TEMP_AGENT_CONTACT.email}
										</span>
									</a>
								</Stack>
								{member && (
									<Link
										className="agent-profile-link"
										href={member._id === user._id ? '/mypage' : `/member?memberId=${member._id}`}
									>
										{t('detail.viewProfile')}
									</Link>
								)}
								{member && member._id !== user._id && (
									<Button variant="outlined" disabled={Boolean(action)} onClick={() => void followHandler()}>
										{t(followed ? 'detail.unfollow' : 'detail.follow')}
									</Button>
								)}
								<Button
									className="agent-message"
									variant="contained"
									type="button"
									startIcon={<ChatBubbleOutlineIcon />}
									onClick={() => toast(t('detail.messagingSoon'))}
								>
									{t('detail.messageAgent')}
								</Button>
							</Stack>
						</aside>
					</Stack>
				</Stack>
			</div>
		</main>
	);
};

export default withLayoutDetail(TravelPackageDetail);
