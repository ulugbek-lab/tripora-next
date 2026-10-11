import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import {
	Alert,
	Button,
	Chip,
	CircularProgress,
	Drawer,
	IconButton,
	Menu,
	MenuItem,
	Pagination,
	Stack,
	Typography,
	useMediaQuery,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutMarketplace from '../../libs/components/layout/LayoutMarketplace';
import { useTranslation } from 'next-i18next';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import toast from 'react-hot-toast';
import Filter from '../../libs/components/travelPackage/Filter';
import TravelPackageCard from '../../libs/components/travelPackage/TravelPackageCard';
import { TravelPackagesInquiry, TravelPackageSearch } from '../../libs/types/travel-package/travel-package.input';
import { TravelPackages } from '../../libs/types/travel-package/travel-package';
import {
	TravelPackageType,
	packageCurrencies,
	availableTravelPackageSorts,
} from '../../libs/enums/travel-package.enum';
import { Direction } from '../../libs/enums/common.enum';
import { GET_TRAVEL_PACKAGES } from '../../apollo/user/query';
import { LIKE_TARGET_TRAVEL_PACKAGE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'], {
			...require('../../next-i18next.config'),
			reloadOnPrerender: process.env.NODE_ENV === 'development',
		})),
	},
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
	{ label: 'newest', sort: 'createdAt', direction: Direction.DESC },
	{ label: 'lowest', sort: 'packagePrice', direction: Direction.ASC },
	{ label: 'highest', sort: 'packagePrice', direction: Direction.DESC },
	{ label: 'viewed', sort: 'packageViews', direction: Direction.DESC },
	{ label: 'liked', sort: 'packageLikes', direction: Direction.DESC },
	{ label: 'startDate', sort: 'packageStartDate', direction: Direction.ASC },
];

const TravelPackageList: NextPage = () => {
	const { t, i18n } = useTranslation('common');
	const compact = useMediaQuery('(max-width:900px)');
	const [filtersOpen, setFiltersOpen] = useState(false);
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

	const [likeTargetTravelPackage] = useMutation(LIKE_TARGET_TRAVEL_PACKAGE, { context: { suppressErrorAlert: true } });
	const { data, loading, error, refetch } = useQuery<{ getTravelPackages: TravelPackages }>(GET_TRAVEL_PACKAGES, {
		variables: { input: searchFilter },
		context: { suppressErrorAlert: true },
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
			setRouteError(t('marketplace.routeError'));
		}
	};

	const likePackageHandler = async (id: string) => {
		if (likingId) return;
		try {
			if (!user._id) {
				toast.error(t('marketplace.signInToSave'));
				return;
			}
			setLikingId(id);
			await likeTargetTravelPackage({ variables: { input: id } });
			// Refetch this observable's current variables, including filters/page changed during the mutation.
			await refetch();
			toast.success(t('marketplace.savedUpdated'));
		} catch (err) {
			toast.error(t('marketplace.saveError'));
		} finally {
			setLikingId(null);
		}
	};

	const selectedSort = sortingOptions.find(
		(option) => option.sort === searchFilter.sort && option.direction === searchFilter.direction,
	);
	const sortLabel = selectedSort
		? t(`marketplace.sort.${selectedSort.label}`)
		: t(`marketplace.sortFields.${searchFilter.sort}`);
	const busy = loading || !synchronized;
	const locale =
		({ en: 'en-US', kr: 'ko-KR', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN' } as Record<string, string>)[i18n.language] ??
		'en-US';
	const filterLabels: Partial<Record<keyof TravelPackageSearch, string>> = {
		countryList: searchFilter.search.countryList?.join(', '),
		cityList: searchFilter.search.cityList?.join(', '),
		typeList: searchFilter.search.typeList?.map((type) => t(`marketplace.packageTypes.${type}`)).join(', '),
		packageCurrency: searchFilter.search.packageCurrency,
		text: searchFilter.search.text,
		memberId: searchFilter.search.memberId ? t('marketplace.agentFilter') : undefined,
	};
	for (const [field, key] of [
		['priceRange', 'price'],
		['durationRange', 'duration'],
		['maxTravellersRange', 'capacity'],
	] as const) {
		const range = searchFilter.search[field];
		if (range)
			filterLabels[field] = t(`marketplace.summary.${key}`, {
				min: range.start.toLocaleString(locale),
				max: range.end.toLocaleString(locale),
				currency: searchFilter.search.packageCurrency,
			});
	}
	const dateRange = searchFilter.search.startDateRange;
	if (dateRange)
		filterLabels.startDateRange = t('marketplace.summary.dates', {
			min: new Date(dateRange.start).toLocaleDateString(locale, { timeZone: 'UTC' }),
			max: new Date(dateRange.end).toLocaleDateString(locale, { timeZone: 'UTC' }),
		});
	const activeFilters = Object.entries(filterLabels).filter(([, label]) => Boolean(label));
	const removeFilter = (field: keyof TravelPackageSearch) => {
		const search = { ...searchFilter.search };
		delete search[field];
		if (field === 'packageCurrency') delete search.priceRange;
		void pushInquiry({ ...searchFilter, search, page: 1 });
	};
	const filters = (
		<Filter searchFilter={searchFilter} onChange={(search) => pushInquiry({ ...searchFilter, search, page: 1 })} />
	);
	return (
		<main id="travel-package-list-page">
			<div className="marketplace-container">
				<header className="marketplace-heading">
					<p className="marketplace-eyebrow">{t('marketplace.eyebrow')}</p>
					<Typography component="h1">{t('marketplace.title')}</Typography>
					<p>{t('marketplace.description')}</p>
				</header>
				<Stack className="marketplace-toolbar">
					<Typography className="result-count" aria-live="polite">
						{busy
							? t('marketplace.loading')
							: error
							? t('marketplace.results')
							: t('marketplace.resultCount', { count: total })}
					</Typography>
					<Stack direction="row" alignItems="center" gap={1}>
						{compact && (
							<Button variant="outlined" startIcon={<TuneIcon />} onClick={() => setFiltersOpen(true)}>
								{t('marketplace.filters')} {activeFilters.length > 0 && `(${activeFilters.length})`}
							</Button>
						)}
						<Button
							className="sort-control"
							aria-label={t('marketplace.sortBy')}
							aria-haspopup="menu"
							aria-expanded={Boolean(anchorEl)}
							onClick={(event) => setAnchorEl(event.currentTarget)}
							endIcon={<KeyboardArrowDownRoundedIcon />}
						>
							{sortLabel}
						</Button>
						<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
							{sortingOptions.map((option) => (
								<MenuItem
									key={option.label}
									selected={option === selectedSort}
									onClick={() => {
										setAnchorEl(null);
										void pushInquiry({ ...searchFilter, sort: option.sort, direction: option.direction, page: 1 });
									}}
								>
									{t(`marketplace.sort.${option.label}`)}
								</MenuItem>
							))}
						</Menu>
					</Stack>
				</Stack>
				{activeFilters.length > 0 && (
					<Stack className="active-filters" aria-label={t('marketplace.activeFilters')}>
						{activeFilters.map(([field, label]) => (
							<Chip
								key={field}
								label={label}
								onDelete={() => removeFilter(field as keyof TravelPackageSearch)}
								deleteIcon={<CloseIcon aria-label={t('marketplace.removeFilter', { label })} />}
							/>
						))}
						<Button size="small" onClick={() => void pushInquiry({ ...searchFilter, search: {}, page: 1 })}>
							{t('marketplace.clearAll')}
						</Button>
					</Stack>
				)}
				<Stack className="travel-package-page">
					{!compact && (
						<aside className="filter-config" aria-label={t('marketplace.filters')}>
							{filters}
						</aside>
					)}
					<Stack className="main-config" id="marketplace-results" aria-busy={busy}>
						{routeError && <Alert severity="error">{routeError}</Alert>}
						{busy ? (
							<Stack className="state-box" role="status">
								<CircularProgress size={30} />
								<Typography>{t('marketplace.loading')}</Typography>
							</Stack>
						) : error ? (
							<Stack className="state-box">
								<TravelExploreIcon />
								<Typography component="h2">{t('marketplace.queryError')}</Typography>
								<Typography>{t('marketplace.retryHint')}</Typography>
								<Button
									variant="outlined"
									onClick={() => void refetch().catch(() => toast.error(t('marketplace.queryError')))}
								>
									{t('marketplace.retry')}
								</Button>
							</Stack>
						) : (
							<>
								<Stack className="list-config">
									{packages.length ? (
										packages.map((travelPackage) => (
											<TravelPackageCard
												key={travelPackage._id}
												marketplace
												travelPackage={travelPackage}
												likePackageHandler={likePackageHandler}
												liking={Boolean(likingId)}
											/>
										))
									) : (
										<Stack className="state-box">
											<TravelExploreIcon />
											<Typography component="h2">{t('marketplace.empty')}</Typography>
											<Typography>{t('marketplace.emptyHint')}</Typography>
											{activeFilters.length > 0 && (
												<Button
													variant="outlined"
													onClick={() => void pushInquiry({ ...searchFilter, search: {}, page: 1 })}
												>
													{t('marketplace.clearAll')}
												</Button>
											)}
										</Stack>
									)}
								</Stack>
								{total > 0 && (
									<Stack className="pagination-config">
										<Pagination
											page={searchFilter.page}
											count={Math.ceil(total / searchFilter.limit)}
											onChange={(_, page) => void pushInquiry({ ...searchFilter, page })}
											shape="rounded"
											getItemAriaLabel={(type, page, selected) =>
												type === 'page'
													? t(selected ? 'marketplace.pagination.current' : 'marketplace.pagination.page', { page })
													: t(`marketplace.pagination.${type}`)
											}
										/>
										<Typography variant="caption">
											{t('marketplace.pageOf', {
												page: searchFilter.page,
												total: Math.ceil(total / searchFilter.limit),
											})}
										</Typography>
									</Stack>
								)}
							</>
						)}
					</Stack>
				</Stack>
			</div>
			{compact && (
				<Drawer
					anchor="left"
					open={filtersOpen}
					onClose={() => setFiltersOpen(false)}
					PaperProps={{ className: 'marketplace-filter-drawer' }}
				>
					<Stack className="drawer-heading">
						<Typography component="h2">{t('marketplace.filters')}</Typography>
						<IconButton aria-label={t('marketplace.closeFilters')} onClick={() => setFiltersOpen(false)}>
							<CloseIcon />
						</IconButton>
					</Stack>
					{filters}
					<Button className="drawer-results" variant="outlined" onClick={() => setFiltersOpen(false)}>
						{t('marketplace.showResults')}
					</Button>
				</Drawer>
			)}
		</main>
	);
};

export default withLayoutMarketplace(TravelPackageList);
