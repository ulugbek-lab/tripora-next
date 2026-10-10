import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import {
	Alert,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useApolloClient } from '@apollo/client';
import { GET_HOME_DESTINATIONS } from '../../../apollo/user/query';
import { HomeDestination, canonicalDestinationValues, countrySearchTerms } from './homeDestination';
import { TravelPackageType } from '../../enums/travel-package.enum';
import { Direction } from '../../enums/common.enum';
import { TravelPackagesInquiry } from '../../types/travel-package/travel-package.input';
export interface HeroValues {
	country: string;
	city: string;
	type: string;
	departure: string;
	capacityMin: string;
	capacityMax: string;
	durationMin: string;
	durationMax: string;
	text: string;
}
const emptyValues: HeroValues = {
	country: '',
	city: '',
	type: '',
	departure: '',
	capacityMin: '',
	capacityMax: '',
	durationMin: '',
	durationMax: '',
	text: '',
};

export function buildHomepageInquiry(
	values: HeroValues,
	translate?: (key: string, options?: { label: string }) => string,
): TravelPackagesInquiry {
	const inquiry: TravelPackagesInquiry = {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	};
	if (values.country.trim()) inquiry.search.countryList = [values.country.trim()];
	if (values.city.trim()) inquiry.search.cityList = [values.city.trim()];
	if (values.text.trim()) inquiry.search.text = values.text.trim();
	if (values.type) {
		if (!Object.values(TravelPackageType).includes(values.type as TravelPackageType))
			throw new Error(translate ? translate('home.errors.type') : 'Choose a valid package type.');
		inquiry.search.typeList = [values.type as TravelPackageType];
	}
	if (values.departure) {
		const start = new Date(`${values.departure}T00:00:00.000Z`);
		if (
			!/^\d{4}-\d{2}-\d{2}$/.test(values.departure) ||
			!Number.isFinite(start.getTime()) ||
			start.toISOString().slice(0, 10) !== values.departure
		)
			throw new Error(translate ? translate('home.errors.date') : 'Choose a valid departure date.');
		inquiry.search.startDateRange = { start: start.toISOString(), end: `${values.departure}T23:59:59.999Z` };
	}
	for (const [field, min, max, label] of [
		['maxTravellersRange', values.capacityMin, values.capacityMax, 'Capacity'],
		['durationRange', values.durationMin, values.durationMax, 'Duration'],
	] as const) {
		if (!min && !max) continue;
		const start = Number(min),
			end = Number(max);
		if (
			!min.trim() ||
			!max.trim() ||
			!Number.isInteger(start) ||
			!Number.isInteger(end) ||
			start < 0 ||
			end > 2147483647 ||
			start > end
		)
			throw new Error(
				translate
					? translate('home.errors.range', {
							label: translate(field === 'maxTravellersRange' ? 'home.filters.capacity' : 'home.filters.duration'),
					  })
					: `${label}: enter both bounds as nonnegative whole numbers, with minimum ≤ maximum.`,
			);
		inquiry.search[field] = { start, end };
	}
	return inquiry;
}

const TravelPackageHeaderFilter = () => {
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const client = useApolloClient();
	const [values, setValues] = useState<HeroValues>(emptyValues);
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const [error, setError] = useState('');
	const [searching, setSearching] = useState(false);
	useEffect(() => setError(''), [i18n.language]);
	const change = (field: keyof HeroValues, value: string) => {
		setValues((current) => ({ ...current, [field]: value }));
		setError('');
	};
	const validate = () => {
		try {
			const inquiry = buildHomepageInquiry(values, (key, options) => t(key, options));
			setError('');
			return inquiry;
		} catch (err) {
			const message = err instanceof Error ? err.message : t('home.errors.filters');
			setError(message);
			return null;
		}
	};
	const pushSearchHandler = async (event: React.FormEvent) => {
		event.preventDefault();
		event.stopPropagation();
		if (searching) return;
		const input = validate();
		if (!input) return;
		setSearching(true);
		try {
			const resolve = async (value: string, field: keyof HomeDestination, countryList?: string[]) => {
				const destinations: HomeDestination[] = [];
				const terms = field === 'packageCountry' ? countrySearchTerms(value) : [value.trim()];
				for (const text of terms) {
					let page = 1;
					let total = 0;
					do {
						const { data } = await client.query<{
							getTravelPackages: { list: HomeDestination[]; metaCounter: { total: number }[] };
						}>({
							query: GET_HOME_DESTINATIONS,
							context: { suppressErrorAlert: true },
							fetchPolicy: 'network-only',
							variables: {
								input: {
									page,
									limit: 50,
									sort: 'createdAt',
									direction: Direction.DESC,
									search: { text, ...(countryList ? { countryList } : {}) },
								},
							},
						});
						destinations.push(...data.getTravelPackages.list);
						total = data.getTravelPackages.metaCounter?.[0]?.total ?? 0;
						page += 1;
					} while ((page - 1) * 50 < total);
				}
				return canonicalDestinationValues(value, field, destinations);
			};
			if (values.country.trim()) {
				const canonical = await resolve(values.country, 'packageCountry');
				if (!canonical.length) {
					setError(t('home.errors.country'));
					return;
				}
				input.search.countryList = canonical;
			}
			if (values.city.trim()) {
				const canonical = await resolve(values.city, 'packageCity', input.search.countryList);
				if (!canonical.length) {
					setError(t('home.errors.city'));
					return;
				}
				input.search.cityList = canonical;
			}
			await router.push({ pathname: '/travel-package', query: { input: JSON.stringify(input) } });
		} catch {
			toast.error(t('home.feedback.searchError'));
		} finally {
			setSearching(false);
		}
	};
	const filterCount = [
		values.type,
		values.text.trim(),
		values.durationMin || values.durationMax,
		values.capacityMin || values.capacityMax,
	].filter(Boolean).length;
	return (
		<>
			<Stack
				component="form"
				className="travel-package-header-search"
				onSubmit={pushSearchHandler}
				aria-busy={searching}
			>
				<Typography className="hero-eyebrow">{t('home.hero.eyebrow')}</Typography>
				<Typography component="h1">{t('home.hero.title')}</Typography>
				<Typography className="hero-description">{t('home.hero.description')}</Typography>
				<Stack className="home-search-surface">
					<Stack className="home-search-fields">
						<TextField
							label={t('home.hero.country')}
							InputLabelProps={{ shrink: true }}
							placeholder={t('home.hero.countryExample')}
							value={values.country}
							onChange={(e) => change('country', e.target.value)}
							disabled={searching}
						/>
						<TextField
							label={t('home.hero.city')}
							placeholder={t('home.hero.cityExample')}
							value={values.city}
							onChange={(e) => change('city', e.target.value)}
							disabled={searching}
						/>
						<TextField
							label={t('home.hero.departure')}
							type="date"
							disabled={searching}
							value={values.departure}
							onChange={(e) => change('departure', e.target.value)}
							InputLabelProps={{ shrink: true }}
						/>
						<Button type="submit" variant="contained" startIcon={<SearchIcon />} disabled={searching}>
							{searching ? t('home.hero.searching') : t('home.hero.search')}
						</Button>
					</Stack>
					<Stack className="home-search-tools">
						<Button
							type="button"
							disabled={searching}
							startIcon={<TuneIcon />}
							onClick={() => setOpenAdvancedFilter(true)}
						>
							{t('home.hero.more')}
							{filterCount ? ` (${filterCount})` : ''}
						</Button>
						<Button
							type="button"
							disabled={searching}
							onClick={() => {
								setValues({ ...emptyValues });
								setError('');
							}}
						>
							{t('home.hero.reset')}
						</Button>
						<span>{t('home.hero.hint')}</span>
					</Stack>
				</Stack>
				{error && <Alert severity="error">{error}</Alert>}
			</Stack>
			<Dialog
				open={openAdvancedFilter}
				onClose={() => setOpenAdvancedFilter(false)}
				fullWidth
				maxWidth="sm"
				className="home-filter-dialog"
				aria-labelledby="travel-hero-filters-title"
			>
				<DialogTitle id="travel-hero-filters-title">
					{t('home.filters.title')}
					<IconButton
						aria-label={t('home.filters.close')}
						onClick={() => setOpenAdvancedFilter(false)}
						sx={{ float: 'right' }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent className="home-filter-content">
					<TextField
						select
						label={t('home.filters.type')}
						value={values.type}
						onChange={(e) => change('type', e.target.value)}
						fullWidth
					>
						<MenuItem value="">{t('home.filters.anyType')}</MenuItem>
						{Object.values(TravelPackageType).map((type) => (
							<MenuItem key={type} value={type}>
								{t(`home.packageTypes.${type}`)}
							</MenuItem>
						))}
					</TextField>
					<TextField
						label={t('home.filters.text')}
						value={values.text}
						onChange={(e) => change('text', e.target.value)}
						fullWidth
					/>
					<Typography component="h3">{t('home.filters.duration')}</Typography>
					<Stack className="home-filter-range">
						<TextField
							label={t('home.filters.minDays')}
							type="number"
							value={values.durationMin}
							onChange={(e) => change('durationMin', e.target.value)}
							inputProps={{ min: 0, step: 1 }}
						/>
						<TextField
							label={t('home.filters.maxDays')}
							type="number"
							value={values.durationMax}
							onChange={(e) => change('durationMax', e.target.value)}
							inputProps={{ min: 0, step: 1 }}
						/>
					</Stack>
					<Typography component="h3">{t('home.filters.capacity')}</Typography>
					<Typography variant="body2">{t('home.filters.capacityHelp')}</Typography>
					<Stack className="home-filter-range">
						<TextField
							label={t('home.filters.minCapacity')}
							type="number"
							value={values.capacityMin}
							onChange={(e) => change('capacityMin', e.target.value)}
							inputProps={{ min: 0, step: 1 }}
						/>
						<TextField
							label={t('home.filters.maxCapacity')}
							type="number"
							value={values.capacityMax}
							onChange={(e) => change('capacityMax', e.target.value)}
							inputProps={{ min: 0, step: 1 }}
						/>
					</Stack>
					{error && <Alert severity="error">{error}</Alert>}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setValues({ ...emptyValues });
							setError('');
						}}
					>
						{t('home.filters.resetAll')}
					</Button>
					<Button
						variant="contained"
						onClick={() => {
							if (validate()) setOpenAdvancedFilter(false);
						}}
					>
						{t('home.filters.apply')}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};
export default TravelPackageHeaderFilter;
