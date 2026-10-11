import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
const AdminMenuList = ({ onNavigate }: { onNavigate?: () => void }) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	return (
		<nav className="admin-navigation" aria-label={t('adminPage.navigation')}>
			{[
				['/_admin/users', 'members', PeopleOutlineIcon],
				['/_admin/travel-package', 'packages', TravelExploreIcon],
				['/_admin/community', 'community', ArticleOutlinedIcon],
			].map(([path, key, Icon]) => {
				const Symbol = Icon as typeof PeopleOutlineIcon;
				return (
					<Link
						key={path as string}
						href={path as string}
						onClick={onNavigate}
						aria-current={router.pathname === path ? 'page' : undefined}
					>
						<Symbol fontSize="small" />
						{t(`adminPage.${key}`)}
					</Link>
				);
			})}
		</nav>
	);
};
export default AdminMenuList;
