import React from 'react';
import Link from 'next/link';
import { Avatar, Button, Stack } from '@mui/material';
import { useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import { packageImageUrl } from '../travelPackage/TravelPackageCard';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HistoryIcon from '@mui/icons-material/History';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';

const MyMenu = ({ category }: { category: string }) => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const links: Array<[string, typeof AccountCircleOutlinedIcon]> = [
		['myProfile', AccountCircleOutlinedIcon],
		['favoriteTravelPackages', FavoriteBorderIcon],
		['visitedTravelPackages', HistoryIcon],
		['followers', PeopleOutlineIcon],
		['followings', PeopleOutlineIcon],
		['myArticles', ArticleOutlinedIcon],
		['writeArticle', AddCircleOutlineIcon],
	];
	if (user.memberType === 'AGENT')
		links.splice(1, 0, ['myTravelPackages', TravelExploreIcon], ['addTravelPackage', AddCircleOutlineIcon]);
	return (
		<Stack className="mypage-menu">
			<div className="mypage-identity">
				<Avatar src={user.memberImage ? packageImageUrl(user.memberImage) : undefined} alt={user.memberNick}>
					{user.memberNick.charAt(0)}
				</Avatar>
				<strong>{user.memberFullName || user.memberNick}</strong>
				<small>
					{t(
						user.memberType === 'AGENT'
							? 'agents.travelAgent'
							: user.memberType === 'ADMIN'
							? 'agents.admin'
							: 'agents.member',
					)}
				</small>
			</div>
			<nav aria-label={t('myPage.navigation')}>
				{links.map(([key, Icon]) => (
					<Link
						key={key as string}
						href={{ pathname: '/mypage', query: { category: key as string } }}
						aria-current={category === key ? 'page' : undefined}
					>
						<Icon fontSize="small" />
						{t(`myPage.${key}`)}
					</Link>
				))}
			</nav>
			<Button
				onClick={async () => {
					await logOut();
					toast.success(t('home.feedback.signedOut'));
					await router.push('/');
				}}
			>
				{t('myPage.logout')}
			</Button>
		</Stack>
	);
};
export default MyMenu;
