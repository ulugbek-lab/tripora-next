import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import Link from 'next/link';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { TravelPackage } from '../../types/travel-package/travel-package';
import { formatterStr } from '../../utils';

interface TravelPackageCardProps {
	travelPackage: TravelPackage;
	likePackageHandler?: (id: string) => Promise<void>;
	hideEngagement?: boolean;
	isFavorite?: boolean;
	liking: boolean;
	marketplace?: boolean;
}

export function packageImageUrl(path?: string): string {
	if (!path) return '/img/travel/package-placeholder.svg';
	if (/^https?:\/\//i.test(path) || path.startsWith('//')) return path;
	const base =
		process.env.REACT_APP_API_URL || process.env.REACT_APP_API_GRAPHQL_URL?.replace(/\/graphql\/?$/, '') || '';
	return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

const LegacyTravelPackageCard = ({
	travelPackage: item,
	likePackageHandler,
	liking,
	hideEngagement,
	isFavorite,
}: TravelPackageCardProps) => {
	const date = new Date(item.packageStartDate);
	const startDate = Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : 'Date unavailable';
	const liked = isFavorite ?? Boolean(item.meLiked?.[0]?.myFavorite);
	return (
		<Stack className="travel-package-card">
			<Stack className="top">
				<Link
					href={{ pathname: '/travel-package/detail', query: { id: item._id } }}
					aria-label={`View ${item.packageTitle}`}
				>
					<img src={packageImageUrl(item.packageImages[0])} alt={item.packageTitle} />
				</Link>
				<Box component="div" className="price-box">
					<Typography>
						{item.packageCurrency} {formatterStr(item.packagePrice) || '0'}
					</Typography>
				</Box>
			</Stack>
			<Stack className="bottom">
				<Stack className="name-address">
					<Link href={{ pathname: '/travel-package/detail', query: { id: item._id } }}>
						<Typography component="h2" className="name">
							{item.packageTitle}
						</Typography>
					</Link>
					<Typography className="address">
						{item.packageCity}, {item.packageCountry}
					</Typography>
				</Stack>
				<Typography className="type">{item.packageType.charAt(0) + item.packageType.slice(1).toLowerCase()}</Typography>
				<Stack className="options">
					<Typography>{item.packageDurationDays} days</Typography>
					<Typography>Starts {startDate}</Typography>
					<Typography>
						Max {item.packageMaxTravellers} travellers · {item.packageAvailableSlots} slots available
					</Typography>
				</Stack>
				{!hideEngagement && (
					<Stack className="type-buttons">
						<Stack className="buttons">
							<RemoveRedEyeIcon fontSize="small" />
							<Typography>{item.packageViews}</Typography>
							<IconButton
								aria-label={
									liked ? `Remove ${item.packageTitle} from favorites` : `Add ${item.packageTitle} to favorites`
								}
								aria-pressed={liked}
								disabled={liking}
								onClick={() => void likePackageHandler?.(item._id)}
							>
								{liked ? <FavoriteIcon color="primary" /> : <FavoriteBorderIcon />}
							</IconButton>
							<Typography>{item.packageLikes}</Typography>
						</Stack>
					</Stack>
				)}
			</Stack>
		</Stack>
	);
};

const MarketplaceCard = ({
	travelPackage: item,
	likePackageHandler,
	liking,
	isFavorite,
	hideEngagement,
}: TravelPackageCardProps) => {
	const { t, i18n } = useTranslation('common');
	const [unavailable, setUnavailable] = useState(!item.packageImages?.[0]);
	useEffect(() => setUnavailable(!item.packageImages?.[0]), [item.packageImages?.[0]]);
	const locale =
		({ en: 'en-US', kr: 'ko-KR', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN' } as Record<string, string>)[i18n.language] ??
		'en-US';
	const date = new Date(item.packageStartDate);
	const startDate = Number.isFinite(date.getTime())
		? date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
		: t('marketplace.card.dateUnavailable');
	const href = { pathname: '/travel-package/detail', query: { id: item._id } };
	const liked = isFavorite ?? Boolean(item.meLiked?.[0]?.myFavorite);
	return (
		<Stack component="article" className="marketplace-card">
			<div className="marketplace-card-media">
				<Link href={href} aria-label={t('marketplace.card.viewLabel', { title: item.packageTitle })}>
					<img
						src={unavailable ? '/img/travel/package-placeholder.svg' : packageImageUrl(item.packageImages[0])}
						alt={unavailable ? t('marketplace.card.photoUnavailable') : item.packageTitle}
						loading="lazy"
						onError={() => setUnavailable(true)}
						onLoad={(e) => {
							if (e.currentTarget.naturalWidth < 2) setUnavailable(true);
						}}
					/>
				</Link>
				{unavailable && <span className="photo-unavailable">{t('marketplace.card.photoUnavailable')}</span>}
				<span className="package-type">{t(`marketplace.packageTypes.${item.packageType}`)}</span>
				{!hideEngagement && (
					<IconButton
						className="package-save"
						aria-label={t(liked ? 'marketplace.card.removeSaved' : 'marketplace.card.addSaved', {
							title: item.packageTitle,
						})}
						aria-pressed={liked}
						disabled={liking}
						onClick={() => void likePackageHandler?.(item._id)}
					>
						{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
					</IconButton>
				)}
			</div>
			<Stack className="marketplace-card-info">
				<p className="package-destination">
					{item.packageCity}, {item.packageCountry}
				</p>
				<Link href={href} className="package-title">
					<Typography component="h2">{item.packageTitle}</Typography>
				</Link>
				<Stack className="package-facts">
					<span>
						<ScheduleIcon />
						{t('marketplace.card.days', { count: item.packageDurationDays })}
					</span>
					<span>
						<PeopleOutlineIcon />
						{t('marketplace.card.capacity', { count: item.packageMaxTravellers })}
					</span>
				</Stack>
				<p className="package-date">{t('marketplace.card.departure', { date: startDate })}</p>
				<p className="package-availability">{t('marketplace.card.slots', { count: item.packageAvailableSlots })}</p>
				<Stack className="package-card-bottom">
					<span className="package-price">
						<small>{item.packageCurrency}</small>{' '}
						{item.packagePrice.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
					</span>
					<Link href={href}>{t('marketplace.card.view')}</Link>
				</Stack>
			</Stack>
		</Stack>
	);
};

const TravelPackageCard = (props: TravelPackageCardProps) =>
	props.marketplace ? <MarketplaceCard {...props} /> : <LegacyTravelPackageCard {...props} />;
export default TravelPackageCard;
