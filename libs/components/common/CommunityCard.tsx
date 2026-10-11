import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { packageImageUrl } from '../travelPackage/TravelPackageCard';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

interface CommunityCardProps {
	boardArticle: BoardArticle;
	size?: string;
	likeArticleHandler?: any;
	tripora?: boolean;
	onLike?: (id: string) => Promise<void>;
	busy?: boolean;
}

const LegacyCommunityCard = (props: CommunityCardProps) => {
	const { boardArticle, size = 'normal', likeArticleHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const imagePath: string = boardArticle?.articleImage
		? `${REACT_APP_API_URL}/${boardArticle?.articleImage}`
		: '/img/community/communityImg.png';

	/** HANDLERS **/
	const chooseArticleHandler = (e: React.SyntheticEvent, boardArticle: BoardArticle) => {
		router.push(
			{
				pathname: '/community/detail',
				query: { articleCategory: boardArticle?.articleCategory, id: boardArticle?._id },
			},
			undefined,
			{ shallow: true },
		);
	};

	const goMemberPage = (id: string) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	if (device === 'mobile') {
		return <div>COMMUNITY CARD MOBILE</div>;
	} else {
		return (
			<Stack
				sx={{ width: size === 'small' ? '285px' : '317px' }}
				className="community-general-card-config"
				onClick={(e: any) => chooseArticleHandler(e, boardArticle)}
			>
				<Stack className="image-box">
					<img src={imagePath} alt="" className="card-img" />
				</Stack>
				<Stack className="desc-box" sx={{ marginTop: '-20px' }}>
					<Stack>
						<Typography
							className="desc"
							onClick={(e: any) => {
								e.stopPropagation();
								goMemberPage(boardArticle?.memberData?._id as string);
							}}
						>
							{boardArticle?.memberData?.memberNick}
						</Typography>
						<Typography className="title">{boardArticle?.articleTitle}</Typography>
					</Stack>
					<Stack className={'buttons'}>
						<IconButton color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{boardArticle?.articleViews}</Typography>
						<IconButton color={'default'} onClick={(e: any) => likeArticleHandler(e, user, boardArticle?._id)}>
							{boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon color={'primary'} />
							) : (
								<FavoriteBorderIcon />
							)}
						</IconButton>
						<Typography className="view-cnt">{boardArticle?.articleLikes}</Typography>
					</Stack>
				</Stack>
				<Stack className="date-box">
					<Moment className="month" format={'MMMM'}>
						{boardArticle?.createdAt}
					</Moment>
					<Typography className="day">
						<Moment format={'DD'}>{boardArticle?.createdAt}</Moment>
					</Typography>
				</Stack>
			</Stack>
		);
	}
};

const TriporaCommunityCard = ({ boardArticle: article, onLike, busy }: CommunityCardProps) => {
	const { t, i18n } = useTranslation('common');
	const [imageFailed, setImageFailed] = useState(false);
	const locale =
		({ en: 'en-US', kr: 'ko-KR', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN' } as Record<string, string>)[i18n.language] ??
		'en-US';
	const date = new Date(article.createdAt);
	const dateLabel = Number.isFinite(date.getTime())
		? date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
		: t('communityPage.dateUnavailable');
	const href = { pathname: '/community/detail', query: { id: article._id, articleCategory: article.articleCategory } };
	const preview = article.articleContent
		?.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	const author = article.memberData;
	const liked = Boolean(article.meLiked?.[0]?.myFavorite);
	return (
		<Stack component="article" className="tripora-community-card">
			{article.articleImage && !imageFailed && (
				<Link href={href} className="community-card-image" aria-label={article.articleTitle}>
					<img
						src={packageImageUrl(article.articleImage)}
						alt=""
						loading="lazy"
						onError={() => setImageFailed(true)}
						onLoad={(event) => {
							if (event.currentTarget.naturalWidth < 2) setImageFailed(true);
						}}
					/>
				</Link>
			)}
			<Stack className="community-card-content">
				<span className="community-card-category">{t(`communityPage.categories.${article.articleCategory}`)}</span>
				<Link href={href} className="community-card-title">
					<h2>{article.articleTitle}</h2>
				</Link>
				{preview && <p className="community-card-preview">{preview}</p>}
				<div className="community-card-author">
					{author?._id ? (
						<Link href={{ pathname: '/member', query: { memberId: author._id } }}>
							{author.memberFullName || author.memberNick}
						</Link>
					) : (
						<span>{t('communityPage.member')}</span>
					)}
					<time dateTime={Number.isFinite(date.getTime()) ? date.toISOString() : undefined}>{dateLabel}</time>
				</div>
				<div className="community-card-stats">
					<span aria-label={t('communityPage.views')}>
						<RemoveRedEyeIcon />
						{article.articleViews}
					</span>
					<span aria-label={t('communityPage.comments')}>
						<ChatBubbleOutlineIcon />
						{article.articleComments}
					</span>
					<IconButton
						type="button"
						size="small"
						disabled={busy}
						aria-label={t(liked ? 'communityPage.unlike' : 'communityPage.like')}
						aria-pressed={liked}
						onClick={() => void onLike?.(article._id)}
					>
						{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
						<small>{article.articleLikes}</small>
					</IconButton>
				</div>
				<Link href={href} className="community-card-read">
					{t('communityPage.readMore')}
				</Link>
			</Stack>
		</Stack>
	);
};
const CommunityCard = (props: CommunityCardProps) =>
	props.tripora ? <TriporaCommunityCard {...props} /> : <LegacyCommunityCard {...props} />;
export default CommunityCard;
