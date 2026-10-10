import React from 'react';
import Link from 'next/link';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { TravelPackage } from '../../types/travel-package/travel-package';
import { formatterStr } from '../../utils';

interface TravelPackageCardProps {
	travelPackage: TravelPackage;
	likePackageHandler: (id: string) => Promise<void>;
	liking: boolean;
}

export function packageImageUrl(path?: string): string {
	if (!path) return '/img/banner/header1.svg';
	if (/^https?:\/\//i.test(path) || path.startsWith('//')) return path;
	const base =
		process.env.REACT_APP_API_URL || process.env.REACT_APP_API_GRAPHQL_URL?.replace(/\/graphql\/?$/, '') || '';
	return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

const TravelPackageCard = ({ travelPackage: item, likePackageHandler, liking }: TravelPackageCardProps) => {
	const date = new Date(item.packageStartDate);
	const startDate = Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : 'Date unavailable';
	const liked = Boolean(item.meLiked?.[0]?.myFavorite);
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
							onClick={() => void likePackageHandler(item._id)}
						>
							{liked ? <FavoriteIcon color="primary" /> : <FavoriteBorderIcon />}
						</IconButton>
						<Typography>{item.packageLikes}</Typography>
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default TravelPackageCard;
