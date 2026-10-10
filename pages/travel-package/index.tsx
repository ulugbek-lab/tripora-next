import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Alert, Box, Button, CircularProgress, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import Filter from '../../libs/components/travelPackage/Filter';
import TravelPackageCard from '../../libs/components/travelPackage/TravelPackageCard';
import { TravelPackagesInquiry, TravelPackageSearch } from '../../libs/types/travel-package/travel-package.input';
import { TravelPackages } from '../../libs/types/travel-package/travel-package';
import {
	TravelPackageType,
	packageCurrencies,
	availableTravelPackageSorts,
} from '../../libs/enums/travel-package.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { GET_TRAVEL_PACKAGES } from '../../apollo/user/query';
import { LIKE_TARGET_TRAVEL_PACKAGE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: { ...(await serverSideTranslations(locale, ['common'])) },
});

export const initialInput: TravelPackagesInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

// Whitelist URL input before it reaches GraphQL; malformed input uses the default inquiry.
export function parseInquiry(raw: string | string[] | undefined): TravelPackagesInquiry {
	const fallback = { ...initialInput, search: {} };
	if (typeof raw !== 'string') return fallback;
	try {
		const input = JSON.parse(raw);
		if (!input || typeof input !== 'object' || Array.isArray(input)) return fallback;
		const source = input.search;
		if (!source || typeof source !== 'object' || Array.isArray(source)) return fallback;
		const search: TravelPackageSearch = {};
		for (const key of ['countryList', 'cityList'] as const) {
			if (Array.isArray(source[key])) {
				const values = source[key].filter(
					(value: unknown): value is string => typeof value === 'string' && value.trim().length > 0,
				);
				if (values.length) search[key] = values;
			}
		}
		if (Array.isArray(source.typeList)) {
			const types = source.typeList.filter((value: TravelPackageType) =>
				Object.values(TravelPackageType).includes(value),
			);
			if (types.length) search.typeList = types;
		}
		if (packageCurrencies.includes(source.packageCurrency)) search.packageCurrency = source.packageCurrency;
		for (const key of ['priceRange', 'durationRange', 'maxTravellersRange'] as const) {
			const range = source[key];
			if (key === 'priceRange' && !search.packageCurrency) continue;
			if (
				range &&
				Number.isInteger(range.start) &&
				Number.isInteger(range.end) &&
				range.start >= 0 &&
				range.end <= 2147483647 &&
				range.start <= range.end
			) {
				search[key] = { start: range.start, end: range.end };
			}
		}
		if (
			source.startDateRange &&
			typeof source.startDateRange.start === 'string' &&
			typeof source.startDateRange.end === 'string'
		) {
			const start = new Date(source.startDateRange.start),
				end = new Date(source.startDateRange.end);
			if (Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && start <= end)
				search.startDateRange = { start: start.toISOString(), end: end.toISOString() };
		}
		if (typeof source.text === 'string' && source.text.trim()) search.text = source.text.trim();
		if (typeof source.memberId === 'string' && /^[a-f\d]{24}$/i.test(source.memberId))
			search.memberId = source.memberId;
		return {
			page: Number.isInteger(input.page) && input.page > 0 && input.page <= 2147483647 ? input.page : 1,
			limit: Number.isInteger(input.limit) && input.limit > 0 && input.limit <= 2147483647 ? input.limit : 9,
			sort: availableTravelPackageSorts.includes(input.sort) ? input.sort : 'createdAt',
			direction: Object.values(Direction).includes(input.direction) ? input.direction : Direction.DESC,
			search,
		};
	} catch {
		return fallback;
	}
}

const sortingOptions = [
	{ label: 'Newest', sort: 'createdAt', direction: Direction.DESC },
	{ label: 'Lowest price', sort: 'packagePrice', direction: Direction.ASC },
	{ label: 'Highest price', sort: 'packagePrice', direction: Direction.DESC },
	{ label: 'Most viewed', sort: 'packageViews', direction: Direction.DESC },
	{ label: 'Most liked', sort: 'packageLikes', direction: Direction.DESC },
	{ label: 'Start date', sort: 'packageStartDate', direction: Direction.ASC },
];

const TravelPackageList: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [searchFilter, setSearchFilter] = useState<TravelPackagesInquiry>(initialInput);
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [likingId, setLikingId] = useState<string | null>(null);
	const [routeError, setRouteError] = useState('');
	const urlInquiry = parseInquiry(router.query.input);
	const synchronized = router.isReady && JSON.stringify(urlInquiry) === JSON.stringify(searchFilter);

	useEffect(() => {
		if (router.isReady) setSearchFilter(parseInquiry(router.query.input));
	}, [router.isReady, router.query.input]);

	const [likeTargetTravelPackage] = useMutation(LIKE_TARGET_TRAVEL_PACKAGE);
	const { data, loading, error, refetch } = useQuery<{ getTravelPackages: TravelPackages }>(GET_TRAVEL_PACKAGES, {
		variables: { input: searchFilter },
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		skip: !synchronized,
	});
	const packages = data?.getTravelPackages.list ?? [];
	const total = data?.getTravelPackages.metaCounter?.[0]?.total ?? 0;

	const pushInquiry = async (next: TravelPackagesInquiry) => {
		setRouteError('');
		try {
			await router.push({ pathname: '/travel-package', query: { input: JSON.stringify(next) } }, undefined, {
				scroll: false,
				shallow: true,
			});
		} catch {
			setRouteError('Unable to update the travel package search. Please try again.');
		}
	};

	const likePackageHandler = async (id: string) => {
		if (likingId) return;
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			setLikingId(id);
			await likeTargetTravelPackage({ variables: { input: id } });
			// Refetch this observable's current variables, including filters/page changed during the mutation.
			await refetch();
			await sweetTopSmallSuccessAlert('Success', 800);
		} catch (err) {
			await sweetMixinErrorAlert(err instanceof Error ? err.message : 'Unable to update your favorite.');
		} finally {
			setLikingId(null);
		}
	};

	const sortLabel =
		sortingOptions.find((option) => option.sort === searchFilter.sort && option.direction === searchFilter.direction)
			?.label ?? searchFilter.sort;
	const busy = loading || !synchronized;
	return (
		<div id="travel-package-list-page" className={device === 'mobile' ? 'mobile' : ''}>
			<div className="container">
				<Box component="div" className="right">
					<Typography>Sort by</Typography>
					<Button onClick={(event) => setAnchorEl(event.currentTarget)} endIcon={<KeyboardArrowDownRoundedIcon />}>
						{sortLabel}
					</Button>
					<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
						{sortingOptions.map((option) => (
							<MenuItem
								key={option.label}
								selected={option.label === sortLabel}
								onClick={() => {
									setAnchorEl(null);
									void pushInquiry({ ...searchFilter, sort: option.sort, direction: option.direction, page: 1 });
								}}
							>
								{option.label}
							</MenuItem>
						))}
					</Menu>
				</Box>
				<Stack className="travel-package-page">
					<Stack className="filter-config">
						<Filter
							searchFilter={searchFilter}
							onChange={(search) => pushInquiry({ ...searchFilter, search, page: 1 })}
						/>
					</Stack>
					<Stack className="main-config">
						{routeError && <Alert severity="error">{routeError}</Alert>}
						{busy ? (
							<Stack className="state-box" role="status">
								<CircularProgress />
								<Typography>Loading travel packages…</Typography>
							</Stack>
						) : error ? (
							<Alert severity="error" action={<Button onClick={() => void refetch()}>Retry</Button>}>
								Unable to load travel packages. Please try again.
							</Alert>
						) : (
							<>
								<Stack className="list-config">
									{packages.length ? (
										packages.map((travelPackage) => (
											<TravelPackageCard
												key={travelPackage._id}
												travelPackage={travelPackage}
												likePackageHandler={likePackageHandler}
												liking={Boolean(likingId)}
											/>
										))
									) : (
										<Stack className="state-box">
											<img src="/img/icons/icoAlert.svg" alt="" />
											<Typography>No travel packages found.</Typography>
										</Stack>
									)}
								</Stack>
								{total > 0 && (
									<Stack className="pagination-config">
										<Pagination
											page={searchFilter.page}
											count={Math.ceil(total / searchFilter.limit)}
											onChange={(_, page) => void pushInquiry({ ...searchFilter, page })}
											shape="circular"
											color="primary"
										/>
										<Typography>Total {total} travel packages available</Typography>
									</Stack>
								)}
							</>
						)}
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(TravelPackageList);
