import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { Button, Stack, Typography } from '@mui/material';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
const Advertisement = () => {
	const { t } = useTranslation('common');
	return (
		<Stack component="aside" className="home-discovery-banner">
			<ExploreOutlinedIcon />
			<Stack>
				<Typography component="h2">{t('home.banner.title')}</Typography>
				<p>{t('home.banner.description')}</p>
			</Stack>
			<Button component={Link} href="/travel-package" variant="contained">
				{t('home.banner.action')}
			</Button>
		</Stack>
	);
};
export default Advertisement;
