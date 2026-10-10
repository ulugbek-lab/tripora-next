import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { Stack } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import { packageImageUrl } from '../travelPackage/TravelPackageCard';
const fallback = '/img/travel/package-placeholder.svg';
const CommunityCard = ({ article }: { article: BoardArticle }) => {
	const { t } = useTranslation('common');
	return (
		<Link
			href={{ pathname: '/community/detail', query: { articleCategory: article.articleCategory, id: article._id } }}
			className="home-story-card"
		>
			<img
				src={article.articleImage ? packageImageUrl(article.articleImage) : fallback}
				alt=""
				loading="lazy"
				onError={(event) => {
					if (event.currentTarget.getAttribute('src') !== fallback) event.currentTarget.src = fallback;
				}}
			/>
			<Stack>
				<small>{t('home.community.story')}</small>
				<strong>{article.articleTitle}</strong>
				<span>
					{t('home.community.by', { name: article.memberData?.memberNick ?? t('home.community.authorFallback') })}
				</span>
			</Stack>
		</Link>
	);
};
export default CommunityCard;
