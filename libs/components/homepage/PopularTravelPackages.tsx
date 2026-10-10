import { useTranslation } from 'next-i18next';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Navigation } from 'swiper';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import toast from 'react-hot-toast';
import { TravelPackages } from '../../types/travel-package/travel-package';
import { TravelPackagesInquiry } from '../../types/travel-package/travel-package.input';
import { Direction } from '../../enums/common.enum';
import { GET_TRAVEL_PACKAGES } from '../../../apollo/user/query';
import { LIKE_TARGET_TRAVEL_PACKAGE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import PopularTravelPackageCard from './PopularTravelPackageCard';
const initialInput: TravelPackagesInquiry = {
	page: 1,
	limit: 8,
	sort: 'packageViews',
	direction: Direction.DESC,
	search: {},
};
const PopularTravelPackages = () => {
	const { t, i18n } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const previousUser = useRef(user._id);
	const [likingId, setLikingId] = useState<string | null>(null);
	const { data, loading, error, refetch } = useQuery<{ getTravelPackages: TravelPackages }>(GET_TRAVEL_PACKAGES, {
		context: { suppressErrorAlert: true },
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
	});
	const packages = data?.getTravelPackages.list ?? [];
	const [likeTargetTravelPackage] = useMutation(LIKE_TARGET_TRAVEL_PACKAGE, {
		context: { suppressErrorAlert: true },
		refetchQueries: ['GetTravelPackages'],
		awaitRefetchQueries: true,
	});
	useEffect(() => {
		if (previousUser.current !== user._id) {
			previousUser.current = user._id;
			void refetch().catch(() => {});
		}
	}, [user._id, refetch]);
	const retry = async () => {
		try {
			await refetch();
		} catch {
			toast.error(t('home.feedback.packagesError'));
		}
	};
	const likePackageHandler = async (id: string) => {
		if (likingId) return;
		if (!user._id) {
			toast.error(t('home.feedback.signInToSave'));
			return;
		}
		const wasLiked = Boolean(packages.find((item) => item._id === id)?.meLiked?.[0]?.myFavorite);
		setLikingId(id);
		try {
			await likeTargetTravelPackage({ variables: { input: id } });
			toast.success(wasLiked ? t('home.feedback.unsaved') : t('home.feedback.saved'));
		} catch {
			toast.error(t('home.feedback.saveError'));
		} finally {
			setLikingId(null);
		}
	};
	return (
		<Stack
			component="section"
			className="home-package-section popular-travel-packages"
			aria-labelledby="popular-packages-title"
		>
			<Stack className="home-section-heading">
				<Stack>
					<Typography component="h2" id="popular-packages-title">
						{t('home.sections.popular.title')}
					</Typography>
					<p>{t('home.sections.popular.description')}</p>
				</Stack>
				<Stack className="home-section-actions">
					<Link href="/travel-package">{t('home.controls.exploreAll')}</Link>
					<IconButton className="home-popular-prev" aria-label={t('home.controls.previous')}>
						<WestIcon />
					</IconButton>
					<IconButton className="home-popular-next" aria-label={t('home.controls.next')}>
						<EastIcon />
					</IconButton>
				</Stack>
			</Stack>
			{error ? (
				<Alert severity="error" action={<Button onClick={() => void retry()}>{t('home.controls.retry')}</Button>}>
					{t('home.states.packagesError')}
				</Alert>
			) : loading && !packages.length ? (
				<Stack className="home-loading-cards" role="status" aria-label={t('home.states.loadingPackages')}>
					{[0, 1, 2].map((key) => (
						<Skeleton key={key} variant="rounded" height={355} />
					))}
				</Stack>
			) : !packages.length ? (
				<Stack className="home-empty-state">
					<Typography>{t('home.states.packagesEmpty')}</Typography>
					<p>{t('home.states.packagesEmptyHint')}</p>
				</Stack>
			) : (
				<Swiper
					key={i18n.language}
					a11y={{
						prevSlideMessage: t('home.controls.previous'),
						nextSlideMessage: t('home.controls.next'),
						slideLabelMessage: t('home.controls.slide'),
						firstSlideMessage: t('home.controls.first'),
						lastSlideMessage: t('home.controls.last'),
						containerRoleDescriptionMessage: t('home.controls.carouselRole'),
						itemRoleDescriptionMessage: t('home.controls.slideRole'),
					}}
					className="home-package-swiper"
					slidesPerView="auto"
					spaceBetween={20}
					modules={[Navigation, A11y]}
					navigation={{ prevEl: '.home-popular-prev', nextEl: '.home-popular-next' }}
				>
					{packages.map((item) => (
						<SwiperSlide key={item._id}>
							<PopularTravelPackageCard
								travelPackage={item}
								likePackageHandler={likePackageHandler}
								liking={Boolean(likingId)}
							/>
						</SwiperSlide>
					))}
				</Swiper>
			)}
		</Stack>
	);
};
export default PopularTravelPackages;
