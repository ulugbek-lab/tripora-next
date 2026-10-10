import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import { Alert, Button, CircularProgress, IconButton, Pagination, Stack, TextField, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import moment from 'moment';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
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
import { formatterStr } from '../../libs/utils';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: { ...(await serverSideTranslations(locale, ['common'])) },
});

const TravelPackageDetail: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
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
			await sweetMixinErrorAlert('Please sign in to save travel packages.');
			return;
		}
		const targetId = packageId;
		setAction('like');
		try {
			await likePackage({ variables: { input: targetId } });
			// The mutation does not attach meLiked. Reload only this package's personalized detail.
			if (activeId.current === targetId) await refetch({ input: targetId });
		} catch {
			await sweetMixinErrorAlert('Unable to update your favorite. Please try again.');
		} finally {
			setAction(null);
		}
	};

	const followHandler = async () => {
		if (action || !item?.memberData?._id) return;
		if (!user._id) {
			await sweetMixinErrorAlert('Please sign in to follow this member.');
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
			await sweetMixinErrorAlert('Unable to update your follow. Please try again.');
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
			await sweetTopSmallSuccessAlert('Comment added', 800);
		} catch {
			await sweetMixinErrorAlert('Unable to add your comment. Please try again.');
		} finally {
			setAction(null);
		}
	};

	const backLink = <Link href="/travel-package">Back to travel packages</Link>;
	if (!router.isReady || (packageId && loading))
		return (
			<Stack
				id="travel-package-detail-page"
				className={`detail-state ${device === 'mobile' ? 'mobile' : ''}`}
				role="status"
			>
				<CircularProgress />
				<Typography>Loading travel package…</Typography>
			</Stack>
		);
	if (!packageId)
		return (
			<Stack id="travel-package-detail-page" className="detail-state">
				<Alert severity="info">Select a valid travel package to view its details.</Alert>
				{backLink}
			</Stack>
		);
	if (error || !available || !item)
		return (
			<Stack id="travel-package-detail-page" className="detail-state">
				<Alert severity="warning">This travel package is unavailable or could not be loaded.</Alert>
				<Button onClick={() => void refetch({ input: packageId })}>Retry</Button>
				{backLink}
			</Stack>
		);

	const images = item.packageImages.filter(Boolean);
	const liked = Boolean(item.meLiked?.[0]?.myFavorite);
	const member = item.memberData;
	const followed = Boolean(member?.meFollowed?.[0]?.myFollowing);
	const start = moment.utc(item.packageStartDate);
	return (
		<div id="travel-package-detail-page" className={device === 'mobile' ? 'mobile' : ''}>
			<div className="container">
				<Stack className="travel-package-detail-config">
					{backLink}
					<Stack className="travel-package-info-config">
						<Stack className="info">
							<Stack className="left-box">
								<Typography component="h1" className="title-main">
									{item.packageTitle}
								</Typography>
								<Typography className="destination">
									{item.packageCity}, {item.packageCountry}
								</Typography>
								<Typography>
									{item.packageType.charAt(0) + item.packageType.slice(1).toLowerCase()} ·{' '}
									{item.packageStatus === TravelPackageStatus.SOLD_OUT ? 'Sold out' : 'Active'}
								</Typography>
							</Stack>
							<Stack className="right-box">
								<Typography className="price">
									{item.packageCurrency} {formatterStr(item.packagePrice) || '0'}
								</Typography>
								<Stack className="buttons">
									<RemoveRedEyeIcon />
									<Typography>{item.packageViews} views</Typography>
									<IconButton
										aria-label={liked ? 'Remove travel package from favorites' : 'Add travel package to favorites'}
										aria-pressed={liked}
										disabled={Boolean(action) || !active}
										onClick={() => void likeHandler()}
									>
										{liked ? <FavoriteIcon color="primary" /> : <FavoriteBorderIcon />}
									</IconButton>
									<Typography>{item.packageLikes} likes</Typography>
									<Typography>{item.packageComments} comments</Typography>
								</Stack>
							</Stack>
						</Stack>
						{item.packageStatus === TravelPackageStatus.SOLD_OUT && (
							<Alert severity="info">This travel package is sold out.</Alert>
						)}
						<Stack className="images">
							<Stack className="main-image">
								{images.length ? (
									<img
										src={packageImageUrl(images[selectedImage] ?? images[0])}
										alt={`${item.packageTitle} — image ${Math.min(selectedImage + 1, images.length)}`}
									/>
								) : (
									<Stack className="no-image">
										<Typography>No package images available.</Typography>
									</Stack>
								)}
							</Stack>
							{images.length > 1 && (
								<Stack className="sub-images">
									{images.map((image, index) => (
										<Button
											key={`${image}-${index}`}
											className="sub-img-box"
											aria-label={`Show package image ${index + 1}`}
											aria-pressed={index === selectedImage}
											onClick={() => setSelectedImage(index)}
										>
											<img src={packageImageUrl(image)} alt={`${item.packageTitle} thumbnail ${index + 1}`} />
										</Button>
									))}
								</Stack>
							)}
						</Stack>
					</Stack>
					<Stack className="travel-package-desc-config">
						<Stack className="left-config">
							<Stack className="options-config">
								<Stack>
									<Typography className="label">Departure (UTC)</Typography>
									<Typography>{start.isValid() ? start.format('DD MMMM, YYYY') : 'Date unavailable'}</Typography>
								</Stack>
								<Stack>
									<Typography className="label">Duration</Typography>
									<Typography>{item.packageDurationDays} days</Typography>
								</Stack>
								<Stack>
									<Typography className="label">Maximum travellers</Typography>
									<Typography>{item.packageMaxTravellers}</Typography>
								</Stack>
								<Stack>
									<Typography className="label">Available slots</Typography>
									<Typography>{item.packageAvailableSlots}</Typography>
								</Stack>
							</Stack>
							<Stack className="description-config">
								<Typography component="h2" className="section-title">
									Package description
								</Typography>
								<Typography className="description">
									{item.packageDesc?.trim() || 'No description available.'}
								</Typography>
							</Stack>
							<Stack className="reviews-config">
								<Typography component="h2" className="section-title">
									Comments ({commentTotal})
								</Typography>
								{commentsLoading ? (
									<Stack role="status">
										<CircularProgress size={24} />
										<Typography>Loading comments…</Typography>
									</Stack>
								) : commentsError ? (
									<Alert
										severity="error"
										action={
											<Button onClick={() => void commentsRefetch({ input: commentsInquiry })}>Retry comments</Button>
										}
									>
										Unable to load comments.
									</Alert>
								) : comments.length ? (
									comments.map((comment) => <Review key={comment._id} comment={comment} />)
								) : (
									<Typography>No comments yet.</Typography>
								)}
								{!commentsLoading && !commentsError && commentTotal > commentsInquiry.limit && (
									<Pagination
										page={commentsInquiry.page}
										count={Math.ceil(commentTotal / commentsInquiry.limit)}
										onChange={(_, page) => setCommentPage({ id: packageId, page })}
										shape="circular"
										color="primary"
									/>
								)}
							</Stack>
							<Stack component="form" className="leave-review-config" onSubmit={createCommentHandler}>
								<Typography component="h2" className="section-title">
									Leave a comment
								</Typography>
								{!user._id && <Typography>Sign in to leave a comment.</Typography>}
								<TextField
									label="Comment"
									multiline
									minRows={3}
									value={commentText}
									onChange={(e) => setCommentText(e.target.value)}
									inputProps={{ maxLength: 100 }}
									helperText={`${commentText.length}/100 characters`}
									disabled={!user._id || !active || Boolean(action)}
								/>
								<Button
									type="submit"
									variant="contained"
									disabled={!user._id || !active || Boolean(action) || !commentText.trim()}
								>
									Submit comment
								</Button>
							</Stack>
						</Stack>
						<Stack className="right-config">
							<Stack className="member-info">
								<Typography component="h2" className="section-title">
									Package agent / member
								</Typography>
								{member ? (
									<>
										<img
											className="member-image"
											src={member.memberImage ? packageImageUrl(member.memberImage) : '/img/profile/defaultUser.svg'}
											alt={member.memberNick}
										/>
										<Link href={member._id === user._id ? '/mypage' : `/member?memberId=${member._id}`}>
											{member.memberFullName || member.memberNick}
										</Link>
										<Typography>{member.memberType}</Typography>
										{member.memberPhone && <Typography>{member.memberPhone}</Typography>}
										{member.memberDesc && <Typography className="description">{member.memberDesc}</Typography>}
										{member._id !== user._id && (
											<Button variant="outlined" disabled={Boolean(action)} onClick={() => void followHandler()}>
												{followed ? 'Unfollow' : 'Follow'}
											</Button>
										)}
									</>
								) : (
									<Typography>Member information unavailable.</Typography>
								)}
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutFull(TravelPackageDetail);
