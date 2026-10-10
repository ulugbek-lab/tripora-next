import React, { useEffect, useState } from 'react';
import { Alert, Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { TravelPackageSearch, TravelPackagesInquiry } from '../../types/travel-package/travel-package.input';
import { TravelPackageType, packageCurrencies } from '../../enums/travel-package.enum';

interface FilterProps {
	searchFilter: TravelPackagesInquiry;
	onChange: (search: TravelPackageSearch) => Promise<void>;
}

export interface FilterValues {
	country: string;
	city: string;
	text: string;
	currency: string;
	types: TravelPackageType[];
	priceMin: string;
	priceMax: string;
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
		text: search.text ?? '',
		currency: search.packageCurrency ?? '',
		types: search.typeList ?? [],
		priceMin: search.priceRange?.start.toString() ?? '',
		priceMax: search.priceRange?.end.toString() ?? '',
		durationMin: search.durationRange?.start.toString() ?? '',
		durationMax: search.durationRange?.end.toString() ?? '',
		capacityMin: search.maxTravellersRange?.start.toString() ?? '',
		capacityMax: search.maxTravellersRange?.end.toString() ?? '',
		dateMin: search.startDateRange ? new Date(search.startDateRange.start).toISOString().slice(0, 10) : '',
		dateMax: search.startDateRange ? new Date(search.startDateRange.end).toISOString().slice(0, 10) : '',
	};
}

// Build only backend-supported fields from validated form drafts.
export function searchFromValues(values: FilterValues, previous: TravelPackageSearch): TravelPackageSearch {
	const search: TravelPackageSearch = {};
	if (previous.memberId) search.memberId = previous.memberId;
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
	if (values.text.trim()) search.text = values.text.trim();
	if (values.types.length) search.typeList = values.types;
	if (values.currency) search.packageCurrency = values.currency;
	for (const [field, min, max, label] of [
		['priceRange', values.priceMin, values.priceMax, 'Price'],
		['durationRange', values.durationMin, values.durationMax, 'Duration'],
		['maxTravellersRange', values.capacityMin, values.capacityMax, 'Capacity'],
	] as const) {
		if (!min && !max) continue;
		if (field === 'priceRange' && !values.currency) throw new Error('Select a currency before applying a price range.');
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
			throw new Error(`${label}: enter both bounds as nonnegative whole numbers, with minimum ≤ maximum.`);
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
			throw new Error('Start date: enter both dates, with the first date no later than the last.');
		search.startDateRange = { start: start.toISOString(), end: end.toISOString() };
	}
	return search;
}

const Filter = ({ searchFilter, onChange }: FilterProps) => {
	const [values, setValues] = useState<FilterValues>(() => formValues(searchFilter.search));
	const [error, setError] = useState('');
	useEffect(() => {
		setValues(formValues(searchFilter.search));
		setError('');
	}, [searchFilter]);
	const change = (field: keyof FilterValues, value: string) => setValues({ ...values, [field]: value });
	const clear = (field: keyof TravelPackageSearch) => {
		const search = { ...searchFilter.search };
		delete search[field];
		if (field === 'packageCurrency') delete search.priceRange;
		const fields: Partial<Record<keyof TravelPackageSearch, Partial<FilterValues>>> = {
			text: { text: '' },
			countryList: { country: '' },
			cityList: { city: '' },
			typeList: { types: [] },
			packageCurrency: { currency: '', priceMin: '', priceMax: '' },
			priceRange: { priceMin: '', priceMax: '' },
			durationRange: { durationMin: '', durationMax: '' },
			maxTravellersRange: { capacityMin: '', capacityMax: '' },
			startDateRange: { dateMin: '', dateMax: '' },
		};
		setValues({ ...values, ...fields[field] });
		setError('');
		void onChange(search);
	};
	const apply = (event: React.FormEvent) => {
		event.preventDefault();
		try {
			const search = searchFromValues(values, searchFilter.search);
			setError('');
			void onChange(search);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Please check your filters.');
		}
	};
	return (
		<Stack component="form" className="filter-main" onSubmit={apply}>
			<Typography className="title-main">Find your travel package</Typography>
			<TextField
				label="Search title or destination"
				value={values.text}
				onChange={(e) => change('text', e.target.value)}
				size="small"
			/>
			<Button type="button" size="small" onClick={() => clear('text')}>
				Clear search
			</Button>
			<TextField
				label="Destination country"
				helperText="Comma-separated names, matching packages exactly."
				value={values.country}
				onChange={(e) => change('country', e.target.value)}
				size="small"
			/>
			<Button type="button" size="small" onClick={() => clear('countryList')}>
				Clear country
			</Button>
			<TextField
				helperText="Comma-separated city names."
				label="City"
				value={values.city}
				onChange={(e) => change('city', e.target.value)}
				size="small"
			/>
			<Button type="button" size="small" onClick={() => clear('cityList')}>
				Clear city
			</Button>
			<Stack>
				<Typography className="title">Package type</Typography>
				{Object.values(TravelPackageType).map((type) => (
					<FormControlLabel
						key={type}
						control={
							<Checkbox
								size="small"
								checked={values.types.includes(type)}
								onChange={(e) =>
									setValues({
										...values,
										types: e.target.checked ? [...values.types, type] : values.types.filter((value) => value !== type),
									})
								}
							/>
						}
						label={type.charAt(0) + type.slice(1).toLowerCase()}
					/>
				))}
			</Stack>
			<Button type="button" size="small" onClick={() => clear('typeList')}>
				Clear package type
			</Button>
			<TextField
				select
				label="Currency"
				value={values.currency}
				onChange={(e) =>
					setValues({ ...values, currency: e.target.value, ...(e.target.value ? {} : { priceMin: '', priceMax: '' }) })
				}
				size="small"
			>
				<MenuItem value="">Any currency</MenuItem>
				{packageCurrencies.map((currency) => (
					<MenuItem key={currency} value={currency}>
						{currency}
					</MenuItem>
				))}
			</TextField>
			<Button type="button" size="small" onClick={() => clear('packageCurrency')}>
				Clear currency and price
			</Button>
			<Typography className="title">Price range</Typography>
			<Stack className="range-inputs">
				<TextField
					label="Min price"
					type="number"
					disabled={!values.currency}
					value={values.priceMin}
					onChange={(e) => change('priceMin', e.target.value)}
					inputProps={{ min: 0, step: 1 }}
					size="small"
				/>
				<TextField
					label="Max price"
					type="number"
					disabled={!values.currency}
					value={values.priceMax}
					onChange={(e) => change('priceMax', e.target.value)}
					inputProps={{ min: 0, step: 1 }}
					size="small"
				/>
			</Stack>
			<Typography variant="caption">Choose a currency and enter both price bounds.</Typography>
			<Button type="button" size="small" onClick={() => clear('priceRange')}>
				Clear price
			</Button>
			<Typography className="title">Duration (days)</Typography>
			<Stack className="range-inputs">
				<TextField
					label="Min days"
					type="number"
					value={values.durationMin}
					onChange={(e) => change('durationMin', e.target.value)}
					inputProps={{ min: 0, step: 1 }}
					size="small"
				/>
				<TextField
					label="Max days"
					type="number"
					value={values.durationMax}
					onChange={(e) => change('durationMax', e.target.value)}
					inputProps={{ min: 0, step: 1 }}
					size="small"
				/>
			</Stack>
			<Button type="button" size="small" onClick={() => clear('durationRange')}>
				Clear duration
			</Button>
			<Typography className="title">Package capacity (max travellers)</Typography>
			<Stack className="range-inputs">
				<TextField
					label="Min capacity"
					type="number"
					value={values.capacityMin}
					onChange={(e) => change('capacityMin', e.target.value)}
					inputProps={{ min: 0, step: 1 }}
					size="small"
				/>
				<TextField
					label="Max capacity"
					type="number"
					value={values.capacityMax}
					onChange={(e) => change('capacityMax', e.target.value)}
					inputProps={{ min: 0, step: 1 }}
					size="small"
				/>
			</Stack>
			<Button type="button" size="small" onClick={() => clear('maxTravellersRange')}>
				Clear capacity
			</Button>
			<Typography className="title">Start date (UTC)</Typography>
			<TextField
				label="First departure date"
				type="date"
				value={values.dateMin}
				onChange={(e) => change('dateMin', e.target.value)}
				InputLabelProps={{ shrink: true }}
				size="small"
			/>
			<TextField
				label="Last departure date"
				type="date"
				value={values.dateMax}
				onChange={(e) => change('dateMax', e.target.value)}
				InputLabelProps={{ shrink: true }}
				size="small"
			/>
			<Button type="button" size="small" onClick={() => clear('startDateRange')}>
				Clear dates
			</Button>
			{error && <Alert severity="error">{error}</Alert>}
			<Button variant="contained" type="submit">
				Apply filters
			</Button>
			<Button
				type="button"
				startIcon={<RefreshIcon />}
				onClick={() => {
					setValues(formValues({}));
					setError('');
					void onChange({});
				}}
			>
				Reset all filters
			</Button>
		</Stack>
	);
};

export default Filter;
