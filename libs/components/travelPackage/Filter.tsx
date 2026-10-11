import React, { useEffect, useRef, useState } from 'react';
import {
	Alert,
	Button,
	Checkbox,
	FormControlLabel,
	IconButton,
	InputAdornment,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useApolloClient } from '@apollo/client';
import CloseIcon from '@mui/icons-material/Close';
import { resolveDestination } from './resolveDestination';
import { useTranslation } from 'next-i18next';
import { TravelPackageSearch, TravelPackagesInquiry } from '../../types/travel-package/travel-package.input';
import { TravelPackageType } from '../../enums/travel-package.enum';

interface FilterProps {
	searchFilter: TravelPackagesInquiry;
	onChange: (search: TravelPackageSearch) => Promise<void>;
}

export interface FilterValues {
	country: string;
	city: string;
	types: TravelPackageType[];
	durationMin: string;
	durationMax: string;
	capacityMin: string;
	capacityMax: string;
	dateMin: string;
	dateMax: string;
}

function formValues(search: TravelPackageSearch): FilterValues {
	return {
		country: search.countryList?.join(', ') ?? '',
		city: search.cityList?.join(', ') ?? '',
		types: search.typeList ?? [],
		durationMin: search.durationRange?.start.toString() ?? '',
		durationMax: search.durationRange?.end.toString() ?? '',
		capacityMin: search.maxTravellersRange?.start.toString() ?? '',
		capacityMax: search.maxTravellersRange?.end.toString() ?? '',
		dateMin: search.startDateRange ? new Date(search.startDateRange.start).toISOString().slice(0, 10) : '',
		dateMax: search.startDateRange ? new Date(search.startDateRange.end).toISOString().slice(0, 10) : '',
	};
}

// Build only backend-supported fields from validated form drafts.
export function searchFromValues(
	values: FilterValues,
	previous: TravelPackageSearch,
	translate?: (key: string, options?: { label: string }) => string,
): TravelPackageSearch {
	// Preserve URL filters that no longer have sidebar controls.
	const search: TravelPackageSearch = { ...previous };
	for (const key of [
		'countryList',
		'cityList',
		'typeList',
		'durationRange',
		'maxTravellersRange',
		'startDateRange',
	] as const)
		delete search[key];
	const countries = values.country
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean);
	const cities = values.city
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean);
	if (countries.length) search.countryList = countries;
	if (cities.length) search.cityList = cities;
	if (values.types.length) search.typeList = values.types;
	for (const [field, min, max, label] of [
		['durationRange', values.durationMin, values.durationMax, 'Duration'],
		['maxTravellersRange', values.capacityMin, values.capacityMax, 'Capacity'],
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
					? translate('marketplace.validation.range', { label: translate(`marketplace.rangeLabels.${field}`) })
					: `${label}: enter both bounds as nonnegative whole numbers, with minimum ≤ maximum.`,
			);
		search[field] = { start, end };
	}
	if (values.dateMin || values.dateMax) {
		const start = new Date(`${values.dateMin}T00:00:00.000Z`),
			end = new Date(`${values.dateMax}T23:59:59.999Z`);
		if (
			!values.dateMin ||
			!values.dateMax ||
			!Number.isFinite(start.getTime()) ||
			!Number.isFinite(end.getTime()) ||
			start > end
		)
			throw new Error(
				translate
					? translate('marketplace.validation.dates')
					: 'Start date: enter both dates, with the first date no later than the last.',
			);
		search.startDateRange = { start: start.toISOString(), end: end.toISOString() };
	}
	return search;
}

const Filter = ({ searchFilter, onChange }: FilterProps) => {
	const { t, i18n } = useTranslation('common');
	const client = useApolloClient();
	const [applying, setApplying] = useState(false);
	const [values, setValues] = useState<FilterValues>(() => formValues(searchFilter.search));
	const [error, setError] = useState('');
	const previousValues = useRef(formValues(searchFilter.search));
	useEffect(() => {
		const next = formValues(searchFilter.search);
		const changed = Object.keys(next).filter(
			(key) =>
				JSON.stringify(next[key as keyof FilterValues]) !==
				JSON.stringify(previousValues.current[key as keyof FilterValues]),
		);
		setValues((draft) => ({
			...draft,
			...Object.fromEntries(changed.map((key) => [key, next[key as keyof FilterValues]])),
		}));
		previousValues.current = next;
		setError('');
	}, [searchFilter]);
	const change = (field: keyof FilterValues, value: string) => setValues({ ...values, [field]: value });
	const apply = async (event: React.FormEvent) => {
		event.preventDefault();
		if (applying) return;
		setApplying(true);
		try {
			const search = searchFromValues(values, searchFilter.search, (key, options) => t(key, options));
			for (const [key, field, errorKey] of [
				['countryList', 'packageCountry', 'country'],
				['cityList', 'packageCity', 'city'],
			] as const) {
				if (!search[key]?.length) continue;
				const resolved: string[] = [];
				for (const value of search[key]!) {
					const canonical = await resolveDestination(
						client,
						value,
						field,
						field === 'packageCity' ? search.countryList : undefined,
					);
					if (!canonical.length) {
						setError(t(`marketplace.validation.${errorKey}`));
						return;
					}
					resolved.push(...canonical);
				}
				search[key] = Array.from(new Set(resolved));
			}
			setError('');
			await onChange(search);
		} catch (err) {
			setError(
				err instanceof Error && !('graphQLErrors' in err) && !('networkError' in err)
					? err.message
					: t('marketplace.validation.filters'),
			);
		} finally {
			setApplying(false);
		}
	};
	useEffect(() => setError(''), [i18n.language]);
	const clearInput = (field: 'country' | 'city') => {
		const key = ({ country: 'countryList', city: 'cityList' } as const)[field];
		const search = { ...searchFilter.search };
		delete search[key];
		setValues({ ...values, [field]: '' });
		setError('');
		void onChange(search);
	};
	const inputAdornments = (field: 'country' | 'city') => ({
		endAdornment: values[field] ? (
			<InputAdornment position="end">
				<IconButton
					type="button"
					size="small"
					aria-label={t(`marketplace.clearInput.${field}`)}
					disabled={applying}
					onClick={() => clearInput(field)}
				>
					<CloseIcon fontSize="small" />
				</IconButton>
			</InputAdornment>
		) : undefined,
	});
	const range = (min: keyof FilterValues, max: keyof FilterValues, minLabel: string, maxLabel: string) => (
		<Stack className="range-inputs">
			<TextField
				label={t(`marketplace.${minLabel}`)}
				type="number"
				value={values[min]}
				onChange={(e) => change(min, e.target.value)}
				inputProps={{ min: 0, step: 1 }}
				size="small"
			/>
			<TextField
				label={t(`marketplace.${maxLabel}`)}
				type="number"
				value={values[max]}
				onChange={(e) => change(max, e.target.value)}
				inputProps={{ min: 0, step: 1 }}
				size="small"
			/>
		</Stack>
	);
	return (
		<Stack component="form" className="marketplace-filter" onSubmit={apply}>
			<Stack className="filter-title">
				<Typography component="h2">{t('marketplace.filters')}</Typography>
				<Button
					size="small"
					type="button"
					onClick={() => {
						setValues(formValues({}));
						setError('');
						void onChange({});
					}}
				>
					{t('marketplace.clearAll')}
				</Button>
			</Stack>
			<Stack component="fieldset" className="filter-group">
				<Typography component="legend">{t('marketplace.destination')}</Typography>
				<TextField
					className="destination-search-input"
					label={t('marketplace.country')}
					placeholder={t('marketplace.placeholders.country')}
					InputProps={inputAdornments('country')}
					disabled={applying}
					helperText={t('marketplace.countryHint')}
					value={values.country}
					onChange={(e) => change('country', e.target.value)}
					size="small"
				/>
				<TextField
					className="destination-search-input"
					label={t('marketplace.city')}
					placeholder={t('marketplace.placeholders.city')}
					InputProps={inputAdornments('city')}
					disabled={applying}
					helperText={t('marketplace.cityHint')}
					value={values.city}
					onChange={(e) => change('city', e.target.value)}
					size="small"
				/>
			</Stack>
			<Stack component="fieldset" className="filter-group">
				<Typography component="legend">{t('marketplace.trip')}</Typography>
				<Typography className="filter-label">{t('marketplace.type')}</Typography>
				<Stack className="type-options">
					{Object.values(TravelPackageType).map((type) => (
						<FormControlLabel
							key={type}
							label={t(`marketplace.packageTypes.${type}`)}
							control={
								<Checkbox
									size="small"
									checked={values.types.includes(type)}
									onChange={(e) =>
										setValues({
											...values,
											types: e.target.checked
												? [...values.types, type]
												: values.types.filter((value) => value !== type),
										})
									}
								/>
							}
						/>
					))}
				</Stack>
				<Typography className="filter-label">{t('marketplace.departure')}</Typography>
				<TextField
					label={t('marketplace.firstDate')}
					type="date"
					value={values.dateMin}
					onChange={(e) => change('dateMin', e.target.value)}
					InputLabelProps={{ shrink: true }}
					size="small"
				/>
				<TextField
					label={t('marketplace.lastDate')}
					type="date"
					value={values.dateMax}
					onChange={(e) => change('dateMax', e.target.value)}
					InputLabelProps={{ shrink: true }}
					size="small"
				/>
				<Typography className="filter-label">{t('marketplace.duration')}</Typography>
				{range('durationMin', 'durationMax', 'minDays', 'maxDays')}
				<Typography className="filter-label">{t('marketplace.capacity')}</Typography>
				{range('capacityMin', 'capacityMax', 'minCapacity', 'maxCapacity')}
				<Typography variant="caption" className="filter-help">
					{t('marketplace.capacityHint')}
				</Typography>
			</Stack>
			{error && <Alert severity="error">{error}</Alert>}
			<Button className="filter-apply" variant="contained" type="submit" disabled={applying}>
				{t('marketplace.apply')}
			</Button>
		</Stack>
	);
};

export default Filter;
