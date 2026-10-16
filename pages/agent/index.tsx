import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import {
	Alert,
	Button,
	CircularProgress,
	InputAdornment,
	IconButton,
	MenuItem,
	Pagination,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import toast from 'react-hot-toast';
import withLayoutAgents from '../../libs/components/layout/LayoutAgents';
import AgentCard from '../../libs/components/common/AgentCard';
import { Members } from '../../libs/types/member/member';
import { AgentsInquiry } from '../../libs/types/member/member.input';
import { Direction } from '../../libs/enums/common.enum';
import { GET_AGENTS } from '../../apollo/user/query';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'], {
			...require('../../next-i18next.config'),
			reloadOnPrerender: process.env.NODE_ENV === 'development',
		})),
	},
});

function parseInquiry(raw: unknown): AgentsInquiry {
	const fallback: AgentsInquiry = { page: 1, limit: 10, sort: 'createdAt', direction: Direction.DESC, search: {} };
	try {
		if (typeof raw !== 'string') return fallback;
		const value = JSON.parse(raw);
		if (!value || typeof value !== 'object') return fallback;
		return {
			page: Number.isInteger(value.page) && value.page > 0 && value.page <= 2147483647 ? value.page : 1,
			limit: Number.isInteger(value.limit) && value.limit > 0 && value.limit <= 50 ? value.limit : 10,
			sort: ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank'].includes(value.sort)
				? value.sort
				: 'createdAt',
			direction: value.direction === Direction.ASC ? Direction.ASC : Direction.DESC,
			search:
				typeof value.search?.text === 'string' && value.search.text.trim() ? { text: value.search.text.trim() } : {},
		};
	} catch {
		return fallback;
	}
}

const AgentList: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const inquiry = parseInquiry(router.query.input);
	const [searchText, setSearchText] = useState('');
	const [liking, setLiking] = useState('');
	useEffect(() => {
		setSearchText(inquiry.search?.text ?? '');
	}, [router.query.input]);
	const { data, loading, error, refetch } = useQuery<{ getAgents: Members }>(GET_AGENTS, {
		variables: { input: inquiry },
		skip: !router.isReady,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		context: { suppressErrorAlert: true },
	});
	const [likeMember] = useMutation(LIKE_TARGET_MEMBER, { context: { suppressErrorAlert: true } });
	const agents = data?.getAgents?.list ?? [];
	const total = data?.getAgents?.metaCounter?.[0]?.total ?? 0;
	const updateInquiry = async (next: AgentsInquiry) => {
		try {
			await router.push({ pathname: '/agent', query: { input: JSON.stringify(next) } }, undefined, { scroll: false });
		} catch {
			toast.error(t('agents.actionError'));
		}
	};
	const likeHandler = async (id: string) => {
		if (!user._id) {
			toast.error(t('agents.signIn'));
			return;
		}
		if (liking) return;
		setLiking(id);
		try {
			await likeMember({ variables: { input: id } });
			await refetch();
		} catch {
			toast.error(t('agents.actionError'));
		} finally {
			setLiking('');
		}
	};
	const sorts = [
		['createdAt:DESC', 'newest'],
		['createdAt:ASC', 'oldest'],
		['memberLikes:DESC', 'mostLiked'],
		['memberViews:DESC', 'mostViewed'],
	];
	const sortValue = `${inquiry.sort}:${inquiry.direction}`;
	return (
		<main id="agents-main" className="agents-area">
			<div className="agents-container">
				<header className="agents-heading">
					<p className="agents-eyebrow">{t('agents.eyebrow')}</p>
					<Typography component="h1">{t('agents.title')}</Typography>
					<p>{t('agents.description')}</p>
				</header>
				<Stack className="agents-toolbar">
					<Stack
						component="form"
						className="agents-search"
						onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
							event.preventDefault();
							void updateInquiry({ ...inquiry, page: 1, search: searchText.trim() ? { text: searchText.trim() } : {} });
						}}
					>
						<TextField
							label={t('agents.find')}
							placeholder={t('agents.searchPlaceholder')}
							value={searchText}
							onChange={(event) => setSearchText(event.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
								endAdornment: searchText ? (
									<InputAdornment position="end">
										<IconButton
											className="agent-search-clear"
											type="button"
											size="small"
											aria-label={t('agents.clearSearch')}
											onClick={() => {
												setSearchText('');
												const search = { ...inquiry.search };
												delete search.text;
												void updateInquiry({ ...inquiry, page: 1, search });
											}}
										>
											<CloseIcon fontSize="small" />
										</IconButton>
									</InputAdornment>
								) : undefined,
							}}
						/>
						<Button type="submit" variant="contained">
							{t('agents.search')}
						</Button>
					</Stack>
					<TextField
						className="agents-sort-control"
						select
						label={t('agents.sortBy')}
						value={sortValue}
						onChange={(event) => {
							const [sort, direction] = event.target.value.split(':');
							void updateInquiry({ ...inquiry, page: 1, sort, direction: direction as Direction });
						}}
					>
						{!sorts.some(([value]) => value === sortValue) && (
							<MenuItem value={sortValue}>{t('agents.ranked')}</MenuItem>
						)}
						{sorts.map(([value, key]) => (
							<MenuItem key={value} value={value}>
								{t(`agents.${key}`)}
							</MenuItem>
						))}
					</TextField>
				</Stack>
				{loading || !router.isReady ? (
					<Stack className="agents-state" role="status">
						<CircularProgress size={28} />
						<p>{t('agents.loading')}</p>
					</Stack>
				) : error ? (
					<Alert
						severity="error"
						action={
							<Button onClick={() => void refetch().catch(() => toast.error(t('agents.loadError')))}>
								{t('agents.retry')}
							</Button>
						}
					>
						{t('agents.loadError')}
					</Alert>
				) : (
					<>
						<p className="agents-result">{t('agents.results', { count: total })}</p>
						{agents.length ? (
							<div className="agents-grid agents-directory-grid">
								{agents.map((agent) => (
									<AgentCard key={agent._id} agent={agent} onLike={likeHandler} liking={Boolean(liking)} />
								))}
							</div>
						) : (
							<Stack className="agents-state">
								<p>{t('agents.empty')}</p>
							</Stack>
						)}
						{total > inquiry.limit && (
							<Pagination
								page={inquiry.page}
								count={Math.ceil(total / inquiry.limit)}
								onChange={(_, page) => void updateInquiry({ ...inquiry, page })}
								shape="rounded"
								getItemAriaLabel={(type, page, selected) =>
									type === 'page'
										? t(selected ? 'marketplace.pagination.current' : 'marketplace.pagination.page', { page })
										: t(`marketplace.pagination.${type}`)
								}
							/>
						)}
					</>
				)}
			</div>
		</main>
	);
};
export default withLayoutAgents(AgentList);
