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
	const user = useReactiveVar(userVar);
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const [pendingStatus, setPendingStatus] = useState<TravelPackageStatus | null>(null);
	const own = managed && user.memberType === MemberType.AGENT && item.memberId === user._id;
	const title =
		item.packageStatus === TravelPackageStatus.ACTIVE ? (
			<Link href={{ pathname: '/travel-package/detail', query: { id: item._id } }}>{item.packageTitle}</Link>
		) : (
			item.packageTitle
		);
	return (
		<Stack className="managed-travel-package-card">
			<img src={packageImageUrl(item.packageImages[0])} alt={item.packageTitle} />
			<Stack className="card-information">
				<Typography component="h2">{title}</Typography>
				<Typography>
					{item.packageCity}, {item.packageCountry} · {item.packageType}
				</Typography>
				<Typography>
					{item.packageCurrency} {item.packagePrice.toLocaleString('en-US', { maximumFractionDigits: 20 })} ·{' '}
					{item.packageDurationDays} days
				</Typography>
				<Typography>Departure {moment.utc(item.packageStartDate).format('DD MMMM, YYYY')}</Typography>
				<Typography>
					Maximum travellers {item.packageMaxTravellers} · Available slots {item.packageAvailableSlots}
				</Typography>
				<Typography>
					{item.packageViews} views · {item.packageLikes} likes · {item.packageComments} comments
				</Typography>
			</Stack>
			<Stack className="card-actions">
				<Button disabled={!own || busy} onClick={(e) => setAnchor(e.currentTarget)}>
					{item.packageStatus === TravelPackageStatus.SOLD_OUT ? 'Sold out' : item.packageStatus}
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
								{item.packageStatus === TravelPackageStatus.ACTIVE ? 'Mark sold out' : 'Activate'}
							</MenuItem>
						</Menu>
						<Link
							href={{ pathname: '/mypage', query: { category: 'addTravelPackage', id: item._id } }}
							onClick={(event) => {
								if (busy) event.preventDefault();
							}}
						>
							<IconButton component="span" aria-label={`Edit ${item.packageTitle}`} disabled={busy}>
								<ModeIcon />
							</IconButton>
						</Link>
						<IconButton
							aria-label={`Delete ${item.packageTitle}`}
							disabled={busy}
							onClick={() => void onDelete?.(item._id)}
						>
							<DeleteIcon />
						</IconButton>
					</>
				)}
			</Stack>
		</Stack>
	);
};
export default TravelPackageCard;
