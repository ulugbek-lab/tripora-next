import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { Stack, Typography } from '@mui/material';
import { Direction } from '../../enums/common.enum';
const destinations = [
	['Seoul', 'home.destinations.SEOUL.caption', 'SEOUL'],
	['Busan', 'home.destinations.BUSAN.caption', 'BUSAN'],
	['Jeju', 'home.destinations.JEJU.caption', 'JEJU'],
	['Gyeongju', 'home.destinations.GYEONGJU.caption', 'GYEONGJU'],
];
const Events = () => {
	const { t } = useTranslation('common');
	return (
		<Stack component="section" className="home-destinations" aria-labelledby="home-destinations-title">
			<Stack className="home-section-heading">
				<Stack>
					<Typography component="h2" id="home-destinations-title">
						{t('home.destinations.title')}
					</Typography>
					<p>{t('home.destinations.description')}</p>
				</Stack>
			</Stack>
			<Stack className="home-destination-grid">
				{destinations.map(([city, caption, image]) => (
					<Link
						key={city}
						href={{
							pathname: '/travel-package',
							query: {
								input: JSON.stringify({
									page: 1,
									limit: 9,
									sort: 'createdAt',
									direction: Direction.DESC,
									search: { cityList: [city] },
								}),
							},
						}}
						className="home-destination-card"
					>
						<img src={`/img/banner/cities/${image}.webp`} alt={t(`home.destinations.${image}.city`)} loading="lazy" />
						<span>
							<strong>{t(`home.destinations.${image}.city`)}</strong>
							<small>{t(caption)}</small>
							<b>{t('home.destinations.explore')}</b>
						</span>
					</Link>
				))}
			</Stack>
		</Stack>
	);
};
export default Events;
