import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';
import { Direction } from '../../enums/common.enum';
import { TravelPackageType, TravelPackageStatus, packageCurrencies } from '../../enums/travel-package.enum';
import { TravelPackage, TravelPackages } from '../../types/travel-package/travel-package';
import { TravelPackageInput } from '../../types/travel-package/travel-package.input';
import { TravelPackageUpdate as PackageUpdate } from '../../types/travel-package/travel-package.update';
import { GET_AGENT_TRAVEL_PACKAGES } from '../../../apollo/user/query';
import {
	CREATE_TRAVEL_PACKAGE,
	UPDATE_TRAVEL_PACKAGE,
	UPLOAD_TRAVEL_PACKAGE_IMAGES,
} from '../../../apollo/user/mutation';
import { packageImageUrl } from '../travelPackage/TravelPackageCard';

export interface PackageFormValues {
	packageTitle: string;
	packageCountry: string;
	packageCity: string;
	packageType: string;
	packageCurrency: string;
	packagePrice: string;
	packageDurationDays: string;
	packageMaxTravellers: string;
	packageAvailableSlots: string;
	packageDesc: string;
	packageStartDate: string;
	packageImages: string[];
	packageStatus: TravelPackageStatus;
}
const emptyValues: PackageFormValues = {
	packageTitle: '',
	packageCountry: '',
	packageCity: '',
	packageType: '',
	packageCurrency: 'USD',
	packagePrice: '',
	packageDurationDays: '',
	packageMaxTravellers: '',
	packageAvailableSlots: '',
	packageDesc: '',
	packageStartDate: '',
	packageImages: [],
	packageStatus: TravelPackageStatus.ACTIVE,
};
export function validatePackageForm(values: PackageFormValues): TravelPackageInput {
	const title = values.packageTitle.trim(),
		country = values.packageCountry.trim(),
		city = values.packageCity.trim();
	if (title.length < 5 || title.length > 120 || !country || !city)
		throw new Error('Enter a title of 5–120 characters, country, and city.');
	if (
		!Object.values(TravelPackageType).includes(values.packageType as TravelPackageType) ||
		!packageCurrencies.includes(values.packageCurrency as typeof packageCurrencies[number])
	)
		throw new Error('Choose a valid package type and currency.');
	const price = Number(values.packagePrice),
		duration = Number(values.packageDurationDays),
		capacity = Number(values.packageMaxTravellers),
		slots = Number(values.packageAvailableSlots);
	if (!values.packagePrice.trim() || !Number.isFinite(price) || price < 0)
		throw new Error('Price must be a nonnegative number.');
	for (const [value, minimum] of [
		[duration, 1],
		[capacity, 1],
		[slots, 0],
	])
		if (!Number.isInteger(value) || value < minimum || value > 2147483647)
			throw new Error(
				'Duration and capacity must be positive whole numbers; available slots must be a nonnegative whole number.',
			);
	if (
		!values.packageAvailableSlots.trim() ||
		!values.packageDurationDays.trim() ||
		!values.packageMaxTravellers.trim() ||
		slots > capacity
	)
		throw new Error('Available slots must not exceed maximum travellers.');
	const date = new Date(`${values.packageStartDate}:00.000Z`);
	if (
		!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(values.packageStartDate) ||
		!Number.isFinite(date.getTime()) ||
		date.toISOString().slice(0, 16) !== values.packageStartDate
	)
		throw new Error('Choose a valid departure date and time (UTC).');
	if (!values.packageImages.length) throw new Error('Add at least one package image.');
	return {
		packageTitle: title,
		packageCountry: country,
		packageCity: city,
		packageType: values.packageType as TravelPackageType,
		packageCurrency: values.packageCurrency,
		packagePrice: price,
		packageDurationDays: duration,
		packageMaxTravellers: capacity,
		packageAvailableSlots: slots,
		packageDesc: values.packageDesc,
		packageStartDate: date.toISOString(),
		packageImages: Array.from(new Set(values.packageImages)),
	};
}
function valuesFromPackage(item: TravelPackage): PackageFormValues {
	return {
		packageTitle: item.packageTitle,
		packageCountry: item.packageCountry,
		packageCity: item.packageCity,
		packageType: item.packageType,
		packageCurrency: item.packageCurrency,
		packagePrice: String(item.packagePrice),
		packageDurationDays: String(item.packageDurationDays),
		packageMaxTravellers: String(item.packageMaxTravellers),
		packageAvailableSlots: String(item.packageAvailableSlots),
		packageDesc: item.packageDesc ?? '',
		packageStartDate: new Date(item.packageStartDate).toISOString().slice(0, 16),
		packageImages: [...item.packageImages],
		packageStatus: item.packageStatus,
	};
}

const AddTravelPackage = () => {
	const router = useRouter(),
		user = useReactiveVar(userVar);
	const rawId = router.query.id,
		editing = rawId !== undefined;
	const id = typeof rawId === 'string' && /^[a-f\d]{24}$/i.test(rawId) ? rawId : '';
	const [values, setValues] = useState<PackageFormValues>({ ...emptyValues, packageImages: [] });
	const [original, setOriginal] = useState<PackageFormValues | null>(null);
	const [loadPage, setLoadPage] = useState(1);
	const [loaded, setLoaded] = useState(false);
	const [notOwned, setNotOwned] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [busy, setBusy] = useState(false);
	const [imageUrl, setImageUrl] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);
	const inquiry = { page: loadPage, limit: 20, sort: 'createdAt', direction: Direction.DESC, search: {} };
	const { data, loading, error } = useQuery<{ getAgentTravelPackages: TravelPackages }>(GET_AGENT_TRAVEL_PACKAGES, {
		context: { suppressErrorAlert: true },
		variables: { input: inquiry },
		skip: !router.isReady || !editing || !id || !user._id || user.memberType !== MemberType.AGENT || loaded || notOwned,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	useEffect(() => {
		if (!editing || !id || loading || !data || loaded || notOwned) return;
		const match = data.getAgentTravelPackages.list.find(
			(item) => item._id === id && item.memberId === user._id && item.packageStatus !== TravelPackageStatus.DELETE,
		);
		if (match) {
			const next = valuesFromPackage(match);
			setValues(next);
			setOriginal(next);
			setLoaded(true);
		} else if (loadPage * 20 < (data.getAgentTravelPackages.metaCounter?.[0]?.total ?? 0))
			setLoadPage((page) => page + 1);
		else setNotOwned(true);
	}, [data, loading, editing, id, loaded, notOwned, loadPage, user._id]);
	const [createPackage] = useMutation(CREATE_TRAVEL_PACKAGE, { context: { suppressErrorAlert: true } });
	const [updatePackage] = useMutation(UPDATE_TRAVEL_PACKAGE, { context: { suppressErrorAlert: true } });
	const [uploadImages] = useMutation(UPLOAD_TRAVEL_PACKAGE_IMAGES, { context: { suppressErrorAlert: true } });
	const change = (field: keyof PackageFormValues, value: string) => setValues({ ...values, [field]: value });
	const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		if (!files.length || busy) return;
		if (
			files.length > 10 ||
			files.some(
				(file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024,
			)
		) {
			setErrorMessage('Upload 1–10 JPEG, PNG, or WebP images, up to 5 MB each.');
			event.target.value = '';
			return;
		}
		setBusy(true);
		setErrorMessage('');
		try {
			const result = await uploadImages({ variables: { files } });
			const urls = result.data?.uploadTravelPackageImages as string[] | undefined;
			if (!urls?.length) throw new Error();
			setValues((previous) => ({ ...previous, packageImages: Array.from(new Set([...previous.packageImages, ...urls])) }));
		} catch {
			setErrorMessage('Image upload failed. Your existing images have been preserved. Please try again.');
		} finally {
			setBusy(false);
			if (inputRef.current) inputRef.current.value = '';
		}
	};
	const save = async (event: React.FormEvent) => {
		event.preventDefault();
		if (busy || user.memberType !== MemberType.AGENT || (editing && (!loaded || !original || !id))) return;
		let input: TravelPackageInput;
		try {
			input = validatePackageForm(values);
		} catch (err) {
			setErrorMessage(err instanceof Error ? err.message : 'Check the package fields.');
			return;
		}
		setBusy(true);
		setErrorMessage('');
		try {
			if (editing && original) {
				const baseline = {
						...original,
						packagePrice: Number(original.packagePrice),
						packageDurationDays: Number(original.packageDurationDays),
						packageMaxTravellers: Number(original.packageMaxTravellers),
						packageAvailableSlots: Number(original.packageAvailableSlots),
						packageStartDate: new Date(`${original.packageStartDate}:00.000Z`).toISOString(),
					},
					update: PackageUpdate = { _id: id };
				for (const key of Object.keys(input) as (keyof TravelPackageInput)[])
					if (JSON.stringify(input[key]) !== JSON.stringify(baseline[key]))
						Object.assign(update, { [key]: input[key] });
				if (values.packageStatus !== original.packageStatus) update.packageStatus = values.packageStatus;
				if (Object.keys(update).length > 1) await updatePackage({ variables: { input: update } });
			} else await createPackage({ variables: { input } });
			await router.push({ pathname: '/mypage', query: { category: 'myTravelPackages' } });
		} catch {
			setErrorMessage(
				'Unable to save this package. Check your agent access, ownership, and network connection, then try again.',
			);
		} finally {
			setBusy(false);
		}
	};
	if (user.memberType !== MemberType.AGENT)
		return <Alert severity="info">Only agents can create or edit travel packages.</Alert>;
	if (editing && (!id || notOwned || error))
		return <Alert severity="warning">This package is unavailable or is not owned by your account.</Alert>;
	if (editing && !loaded)
		return (
			<Stack role="status">
				<CircularProgress />
				<Typography>Loading your package…</Typography>
			</Stack>
		);
	return (
		<Stack component="form" className="travel-package-form" onSubmit={save}>
			<Typography component="h1" className="main-title">
				{editing ? 'Edit Travel Package' : 'Add Travel Package'}
			</Typography>
			{errorMessage && <Alert severity="error">{errorMessage}</Alert>}
			<Stack className="form-fields">
				{[
					['packageTitle', 'Package title'],
					['packageCountry', 'Country'],
					['packageCity', 'City'],
				].map(([field, label]) => (
					<TextField
						key={field}
						label={label}
						value={values[field as keyof PackageFormValues]}
						onChange={(e) => change(field as keyof PackageFormValues, e.target.value)}
						size="small"
					/>
				))}
				<TextField
					select
					label="Package type"
					value={values.packageType}
					onChange={(e) => change('packageType', e.target.value)}
					size="small"
				>
					{Object.values(TravelPackageType).map((type) => (
						<MenuItem key={type} value={type}>
							{type}
						</MenuItem>
					))}
				</TextField>
				<TextField
					select
					label="Currency"
					value={values.packageCurrency}
					onChange={(e) => change('packageCurrency', e.target.value)}
					size="small"
				>
					{packageCurrencies.map((currency) => (
						<MenuItem key={currency} value={currency}>
							{currency}
						</MenuItem>
					))}
				</TextField>
				{[
					['packagePrice', 'Price', 0, 'any'],
					['packageDurationDays', 'Duration (days)', 1, 1],
					['packageMaxTravellers', 'Maximum travellers', 1, 1],
					['packageAvailableSlots', 'Available slots', 0, 1],
				].map(([field, label, min, step]) => (
					<TextField
						key={field}
						label={label}
						type="number"
						value={values[field as keyof PackageFormValues]}
						onChange={(e) => change(field as keyof PackageFormValues, e.target.value)}
						inputProps={{ min, step }}
						size="small"
					/>
				))}
				<TextField
					label="Departure date/time (UTC)"
					type="datetime-local"
					value={values.packageStartDate}
					onChange={(e) => change('packageStartDate', e.target.value)}
					InputLabelProps={{ shrink: true }}
					size="small"
				/>
				{editing && (
					<TextField
						select
						label="Status"
						value={values.packageStatus}
						onChange={(e) => change('packageStatus', e.target.value)}
						size="small"
					>
						<MenuItem value={TravelPackageStatus.ACTIVE}>Active</MenuItem>
						<MenuItem value={TravelPackageStatus.SOLD_OUT}>Sold out</MenuItem>
					</TextField>
				)}
			</Stack>
			<TextField
				label="Package description"
				multiline
				minRows={4}
				value={values.packageDesc}
				onChange={(e) => change('packageDesc', e.target.value)}
			/>
			<Typography component="h2">Package images</Typography>
			<Typography variant="caption">JPEG, PNG, or WebP · up to 5 MB each · up to 10 files per upload</Typography>
			<input
				ref={inputRef}
				type="file"
				aria-label="Upload package images"
				accept="image/jpeg,image/png,image/webp"
				multiple
				disabled={busy}
				onChange={upload}
			/>
			<Stack className="image-url-row">
				<TextField label="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} size="small" />
				<Button
					type="button"
					disabled={busy}
					onClick={() => {
						if (!/^https?:\/\//i.test(imageUrl.trim())) {
							setErrorMessage('Enter a valid HTTP or HTTPS image URL.');
							return;
						}
						setValues({ ...values, packageImages: Array.from(new Set([...values.packageImages, imageUrl.trim()])) });
						setImageUrl('');
						setErrorMessage('');
					}}
				>
					Add image URL
				</Button>
			</Stack>
			<Stack className="gallery-box">
				{values.packageImages.map((image) => (
					<Stack key={image} className="image-box">
						<img src={packageImageUrl(image)} alt="Package preview" />
						<Button
							type="button"
							disabled={busy}
							onClick={() =>
								setValues({ ...values, packageImages: values.packageImages.filter((value) => value !== image) })
							}
						>
							Remove image
						</Button>
					</Stack>
				))}
			</Stack>
			<Button type="submit" variant="contained" disabled={busy}>
				{busy ? 'Working…' : 'Save package'}
			</Button>
		</Stack>
	);
};
export default AddTravelPackage;
