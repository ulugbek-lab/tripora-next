import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { Button, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import Link from 'next/link';
import moment from 'moment';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';
import { TravelPackageStatus } from '../../enums/travel-package.enum';
import { TravelPackage } from '../../types/travel-package/travel-package';
import { packageImageUrl } from '../travelPackage/TravelPackageCard';

interface Props {
	travelPackage: TravelPackage;
	managed?: boolean;
	busy?: boolean;
	onStatus?: (id: string, status: TravelPackageStatus) => Promise<void>;
	onDelete?: (id: string) => Promise<void>;
}
const TravelPackageCard = ({ travelPackage: item, managed, busy, onStatus, onDelete }: Props) => {
	const { t, i18n } = useTranslation('common');
	const locale = ({ en: 'en-US', kr: 'ko-KR', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN' } as Record<string, string>)[i18n.language] ?? 'en-US';
	const user = useReactiveVar(userVar);
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const [pendingStatus, setPendingStatus] = useState<TravelPackageStatus | null>(null);
	const [imageFailed, setImageFailed] = useState(false);
	const own = managed && user.memberType === MemberType.AGENT && item.memberId === user._id;
	const title =
		item.packageStatus === TravelPackageStatus.ACTIVE ? (
			<Link href={{ pathname: '/travel-package/detail', query: { id: item._id } }}>{item.packageTitle}</Link>
		) : (
			item.packageTitle
		);
	return (
		<Stack className="managed-travel-package-card">
			<img
				src={
					imageFailed || !item.packageImages?.[0]
						? '/img/travel/package-placeholder.svg'
						: packageImageUrl(item.packageImages[0])
				}
				alt={item.packageTitle}
				onError={() => setImageFailed(true)}
			/>
			<Stack className="card-information">
				<Typography component="h2">{title}</Typography>
				<Typography>
					{item.packageCity}, {item.packageCountry} · {t(`home.packageTypes.${item.packageType}`)}
				</Typography>
				<Typography>
					{item.packageCurrency} {item.packagePrice.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ·{' '}
					{t('marketplace.card.days', { count: item.packageDurationDays })}
				</Typography>
				<Typography>
					{t('marketplace.card.departure', { date: moment.utc(item.packageStartDate).format('YYYY-MM-DD') })}
				</Typography>
				<Typography>
					{t('marketplace.card.capacity', { count: item.packageMaxTravellers })} ·{' '}
					{t('marketplace.card.slots', { count: item.packageAvailableSlots })}
				</Typography>
				<Typography>
					{t('agents.viewCount', { count: item.packageViews })} · {item.packageLikes} {t('agents.likes')} ·{' '}
					{item.packageComments} {t('communityPage.comments')}
				</Typography>
			</Stack>
			<Stack className="card-actions">
				<Button disabled={!own || busy} onClick={(e) => setAnchor(e.currentTarget)}>
					{t(
						item.packageStatus === TravelPackageStatus.SOLD_OUT
							? 'myPage.soldOut'
							: item.packageStatus === TravelPackageStatus.DELETE
							? 'myPage.deleted'
							: 'myPage.active',
					)}
				</Button>
				{own && (
					<>
						<Menu
							anchorEl={anchor}
							open={Boolean(anchor)}
							onClose={() => setAnchor(null)}
							TransitionProps={{
								onExited: () => {
									if (pendingStatus) {
										const status = pendingStatus;
										setPendingStatus(null);
										setTimeout(() => void onStatus?.(item._id, status), 0);
									}
								},
							}}
						>
							<MenuItem
								onClick={() => {
									setAnchor(null);
									setPendingStatus(
										item.packageStatus === TravelPackageStatus.ACTIVE
											? TravelPackageStatus.SOLD_OUT
											: TravelPackageStatus.ACTIVE,
									);
								}}
							>
								{t(item.packageStatus === TravelPackageStatus.ACTIVE ? 'myPage.markSoldOut' : 'myPage.activate')}
							</MenuItem>
						</Menu>
						<Link
							href={{ pathname: '/mypage', query: { category: 'addTravelPackage', id: item._id } }}
							onClick={(event) => {
								if (busy) event.preventDefault();
							}}
						>
							<IconButton component="span" aria-label={t('myPage.edit')} disabled={busy}>
								<ModeIcon />
							</IconButton>
						</Link>
						<IconButton aria-label={t('myPage.delete')} disabled={busy} onClick={() => void onDelete?.(item._id)}>
							<DeleteIcon />
						</IconButton>
					</>
				)}
			</Stack>
		</Stack>
	);
};
export default TravelPackageCard;
