import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, IconButton, Stack } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { TravelPackage } from '../../types/travel-package/travel-package';
import { packageImageUrl } from '../travelPackage/TravelPackageCard';
export interface HomePackageCardProps {
	travelPackage: TravelPackage;
	likePackageHandler: (id: string) => Promise<void>;
	liking: boolean;
}
const fallback = '/img/travel/package-placeholder.svg';
const HomePackageCard = ({ travelPackage: item, likePackageHandler, liking }: HomePackageCardProps) => {
	const { t, i18n } = useTranslation('common');
	const [imageUnavailable, setImageUnavailable] = useState(!item.packageImages?.[0]);
	useEffect(() => setImageUnavailable(!item.packageImages?.[0]), [item.packageImages?.[0]]);
	const href = { pathname: '/travel-package/detail', query: { id: item._id } };
	const date = new Date(item.packageStartDate);
	const startDate = Number.isFinite(date.getTime())
		? new Intl.DateTimeFormat(
				({ en: 'en-US', kr: 'ko-KR', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN' } as Record<string, string>)[
					i18n.language
				] ?? 'en-US',
				{ month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' },
		  ).format(date)
		: t('home.card.dateUnavailable');
	const liked = Boolean(item.meLiked?.[0]?.myFavorite);
	return (
		<Stack component="article" className="home-package-card" data-package-id={item._id}>
			<Box component="div" className="home-card-media">
				<Link href={href} aria-label={t('home.card.viewLabel', { title: item.packageTitle })}>
					<img
						src={imageUnavailable ? fallback : packageImageUrl(item.packageImages[0])}
						alt={imageUnavailable ? t('home.card.photoUnavailable') : item.packageTitle}
						loading="lazy"
						onError={() => setImageUnavailable(true)}
						onLoad={(event) => {
							if (event.currentTarget.naturalWidth < 2) setImageUnavailable(true);
						}}
					/>
				</Link>
				{imageUnavailable && <span className="home-card-photo-placeholder">{t('home.card.photoUnavailable')}</span>}
				<span className="home-card-type">{t(`home.packageTypes.${item.packageType}`)}</span>
				<IconButton
					className="home-card-save"
					aria-label={t(liked ? 'home.card.removeSaved' : 'home.card.addSaved', { title: item.packageTitle })}
					aria-pressed={liked}
					disabled={liking}
					onClick={() => void likePackageHandler(item._id)}
				>
					{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
				</IconButton>
			</Box>
			<Stack className="home-card-info">
				<p className="home-card-destination">
					{item.packageCity}, {item.packageCountry}
				</p>
				<Link href={href} className="home-card-title">
					{item.packageTitle}
				</Link>
				<Stack className="home-card-facts">
					<span>
						<ScheduleIcon />
						{t('home.card.days', { count: item.packageDurationDays })}
					</span>
					<span>
						<PeopleOutlineIcon />
						{t('home.card.capacity', { count: item.packageMaxTravellers })}
					</span>
				</Stack>
				<p className="home-card-date">{t('home.card.departure', { date: startDate })}</p>
				<Stack className="home-card-bottom">
					<span className="home-card-price">
						<small>{item.packageCurrency}</small>{' '}
						{item.packagePrice.toLocaleString(
							({ en: 'en-US', kr: 'ko-KR', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN' } as Record<string, string>)[
								i18n.language
							] ?? 'en-US',
							{ maximumFractionDigits: 2, minimumFractionDigits: 2 },
						)}
					</span>
					<Link href={href}>{t('home.card.view')}</Link>
				</Stack>
			</Stack>
		</Stack>
	);
};
export default HomePackageCard;
