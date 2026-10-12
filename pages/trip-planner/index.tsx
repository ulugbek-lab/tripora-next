import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useReactiveVar } from '@apollo/client';
import { Alert, Button, CircularProgress, MenuItem, Skeleton, TextField } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import toast from 'react-hot-toast';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { GENERATE_TRAVEL_ITINERARY } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { packageCurrencies } from '../../libs/enums/travel-package.enum';
import withLayoutTripPlanner from '../../libs/components/layout/LayoutTripPlanner';

type BudgetEstimate = { amount: number; currency: string; label: string };
type Itinerary = {
	title: string;
	warning: string;
	estimatedTotalBudget: BudgetEstimate;
	days: {
		day: number;
		activities: { title: string; description: string }[];
		mealSuggestions?: string[] | null;
		accommodationSuggestions?: string[] | null;
		estimatedBudget: BudgetEstimate;
	}[];
};
export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'], {
			...require('../../next-i18next.config'),
			reloadOnPrerender: process.env.NODE_ENV === 'development',
		})),
	},
});
const TripPlanner = () => {
	const { t, i18n } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [form, setForm] = useState({
		destination: '',
		durationDays: '3',
		budget: '',
		currency: 'USD',
		travellerCount: '2',
		interests: '',
	});
	const [result, setResult] = useState<Itinerary | null>(null);
	const pending = useRef(false);
	const [destinationError, setDestinationError] = useState(false);
	const [generate, { loading }] = useMutation<{ generateTravelItinerary: Itinerary }>(GENERATE_TRAVEL_ITINERARY, {
		context: { suppressErrorAlert: true },
	});
	const change = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setForm({ ...form, [field]: event.target.value });
		if (field === 'destination') setDestinationError(!event.target.value.trim());
	};
	const money = (estimate: BudgetEstimate) =>
		new Intl.NumberFormat(
			({ en: 'en-US', kr: 'ko-KR', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN' } as Record<string, string>)[i18n.language] ??
				'en-US',
			{ style: 'currency', currency: estimate.currency },
		).format(estimate.amount);
	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (pending.current || loading) return;
		if (!form.destination.trim()) {
			setDestinationError(true);
			return;
		}
		setDestinationError(false);
		if (!user._id) {
			toast.error(t('tripPlanner.signIn'));
			return;
		}
		const interests = form.interests
			.split(',')
			.map((value) => value.trim())
			.filter(Boolean);
		const input = {
			destination: form.destination.trim(),
			durationDays: Number(form.durationDays),
			budget: Number(form.budget),
			currency: form.currency,
			travellerCount: Number(form.travellerCount),
			interests,
		};
		if (
			input.destination.length < 2 ||
			input.destination.length > 120 ||
			!form.budget.trim() ||
			!Number.isFinite(input.budget) ||
			input.budget < 0 ||
			input.budget > 1000000000 ||
			!Number.isInteger(input.durationDays) ||
			input.durationDays < 1 ||
			input.durationDays > 30 ||
			!Number.isInteger(input.travellerCount) ||
			input.travellerCount < 1 ||
			input.travellerCount > 100 ||
			interests.length > 20 ||
			interests.some((value) => value.length > 80)
		) {
			toast.error(t('tripPlanner.invalid'));
			return;
		}
		pending.current = true;
		setResult(null);
		try {
			const { data } = await generate({ variables: { input } });
			if (!data?.generateTravelItinerary) throw new Error();
			setResult(data.generateTravelItinerary);
		} catch {
			toast.error(t('tripPlanner.error'));
		} finally {
			pending.current = false;
		}
	};
	return (
		<main id="planner-main" className="planner-page">
			<header>
				<p className="planner-eyebrow">
					<AutoAwesomeIcon fontSize="small" />
					{t('tripPlanner.aiTitle')}
				</p>
				<h1>{t('tripPlanner.title')}</h1>
				<p>{t('tripPlanner.description')}</p>
			</header>
			<form className="planner-form" onSubmit={submit} aria-busy={loading} noValidate>
				<div className="planner-form-heading">
					<AutoAwesomeIcon />
					<h2>{t('tripPlanner.formTitle')}</h2>
				</div>
				<fieldset className="planner-fields" disabled={loading}>
					<TextField
						required
						label={t('tripPlanner.destination')}
						error={destinationError}
						helperText={destinationError ? t('tripPlanner.destinationRequired') : undefined}
						value={form.destination}
						onChange={change('destination')}
						inputProps={{ minLength: 2, maxLength: 120 }}
						className="planner-wide"
					/>
					<TextField
						required
						type="number"
						label={t('tripPlanner.duration')}
						value={form.durationDays}
						onChange={change('durationDays')}
						inputProps={{ min: 1, max: 30, step: 1 }}
					/>
					<TextField
						required
						type="number"
						label={t('tripPlanner.travellers')}
						value={form.travellerCount}
						onChange={change('travellerCount')}
						inputProps={{ min: 1, max: 100, step: 1 }}
					/>
					<TextField
						required
						type="number"
						label={t('tripPlanner.budget')}
						helperText={t('tripPlanner.groupBudget')}
						value={form.budget}
						onChange={change('budget')}
						inputProps={{ min: 0, max: 1000000000, step: 'any' }}
					/>
					<TextField select label={t('tripPlanner.currency')} value={form.currency} onChange={change('currency')}>
						{packageCurrencies.map((currency) => (
							<MenuItem key={currency} value={currency}>
								{currency}
							</MenuItem>
						))}
					</TextField>
					<TextField
						label={t('tripPlanner.interests')}
						helperText={t('tripPlanner.interestsHint')}
						value={form.interests}
						onChange={change('interests')}
						className="planner-wide"
					/>
				</fieldset>
				{!user._id && (
					<p>
						<Link href="/account/join?referrer=%2Ftrip-planner">{t('tripPlanner.signIn')}</Link>
					</p>
				)}
				<Button
					type="submit"
					variant="contained"
					disabled={loading}
					startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
				>
					{t(loading ? 'tripPlanner.loading' : 'tripPlanner.generate')}
				</Button>
				<p className="planner-note" role="status">
					{t(loading ? 'tripPlanner.loading' : 'tripPlanner.languageNote')}
				</p>
			</form>
			{loading && (
				<section className="planner-generating" aria-busy="true" aria-label={t('tripPlanner.planning')}>
					<p className="planner-eyebrow" role="status">
						<AutoAwesomeIcon fontSize="small" />
						{t('tripPlanner.planning')}
					</p>
					<p>{t('tripPlanner.building')}</p>
					<div className="planner-placeholder" aria-hidden="true">
						{[0, 1, 2].map((index) => (
							<div key={index}>
								<Skeleton width="40%" height={30} />
								<Skeleton width="90%" />
								<Skeleton width="70%" />
							</div>
						))}
					</div>
				</section>
			)}
			{result && (
				<section className="planner-result" aria-labelledby="planner-result-title">
					<p className="planner-eyebrow">{t('tripPlanner.suggestions')}</p>
					<h2 id="planner-result-title">{result.title}</h2>
					<Alert severity="info">{result.warning}</Alert>
					{result.days.map((day) => (
						<article className="planner-day" key={day.day}>
							<h3>{t('tripPlanner.day', { day: day.day })}</h3>
							<ul>
								{day.activities.map((activity, index) => (
									<li key={index}>
										<h4>{activity.title}</h4>
										<p>{activity.description}</p>
									</li>
								))}
							</ul>
							{(['mealSuggestions', 'accommodationSuggestions'] as const).map((field) =>
								day[field]?.length ? (
									<div key={field}>
										<h4>{t(`tripPlanner.${field}`)}</h4>
										<ul>
											{day[field]?.map((suggestion, index) => (
												<li key={index}>{suggestion}</li>
											))}
										</ul>
									</div>
								) : null,
							)}
							<p className="planner-estimate">
								{t('tripPlanner.estimatedBudget')}: <strong>{money(day.estimatedBudget)}</strong>
							</p>
							<p className="planner-note">{day.estimatedBudget.label}</p>
						</article>
					))}
					<div className="planner-total">
						<h3>{t('tripPlanner.totalBudget')}</h3>
						<strong>{money(result.estimatedTotalBudget)}</strong>
						<p>{result.estimatedTotalBudget.label}</p>
					</div>
					<p className="planner-note">{t('tripPlanner.reminder')}</p>
				</section>
			)}
		</main>
	);
};
export default withLayoutTripPlanner(TripPlanner);
