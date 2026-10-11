import React from 'react';
import {
	Alert,
	Button,
	CircularProgress,
	IconButton,
	InputAdornment,
	MenuItem,
	Stack,
	TablePagination,
	TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'next-i18next';
interface SelectProps {
	disabled?: boolean;
	label: string;
	value: string;
	options: string[];
	onChange: (value: string) => void;
}
export const AdminSelect = ({ label, value, options, onChange, disabled }: SelectProps) => {
	const { t } = useTranslation('common');
	return (
		<TextField
			select
			disabled={disabled}
			size="small"
			label={t(`adminPage.${label}`)}
			value={value}
			onChange={(event) => onChange(event.target.value)}
		>
			{options.map((option) => (
				<MenuItem key={option} value={option}>
					{t(`adminPage.values.${option}`)}
				</MenuItem>
			))}
		</TextField>
	);
};
export const AdminSearch = ({
	label,
	value,
	onChange,
	onApply,
	onClear,
	disabled,
}: {
	disabled?: boolean;
	label: string;
	value: string;
	onChange: (value: string) => void;
	onApply: () => void;
	onClear: () => void;
}) => {
	const { t } = useTranslation('common');
	return (
		<Stack
			component="form"
			className="admin-search"
			onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
				event.preventDefault();
				onApply();
			}}
		>
			<TextField
				disabled={disabled}
				size="small"
				label={t(`adminPage.${label}`)}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				InputProps={{
					endAdornment: value ? (
						<InputAdornment position="end">
							<IconButton
								disabled={disabled}
								type="button"
								size="small"
								aria-label={t('adminPage.clear')}
								onClick={onClear}
							>
								<CloseIcon fontSize="small" />
							</IconButton>
						</InputAdornment>
					) : undefined,
				}}
			/>
			<Button disabled={disabled} type="submit" variant="outlined">
				{t('adminPage.search')}
			</Button>
		</Stack>
	);
};
export const AdminState = ({
	loading,
	error,
	empty,
	retry,
}: {
	loading: boolean;
	error?: boolean;
	empty: boolean;
	retry: () => void;
}) => {
	const { t } = useTranslation('common');
	if (loading)
		return (
			<Stack className="admin-state" role="status">
				<CircularProgress size={28} />
				<p>{t('adminPage.loading')}</p>
			</Stack>
		);
	if (error)
		return (
			<Alert severity="error" action={<Button onClick={retry}>{t('adminPage.retry')}</Button>}>
				{t('adminPage.loadError')}
			</Alert>
		);
	if (empty)
		return (
			<Stack className="admin-state">
				<p>{t('adminPage.empty')}</p>
			</Stack>
		);
	return null;
};
export const AdminPagination = ({
	total,
	page,
	limit,
	onChange,
	disabled,
}: {
	disabled?: boolean;
	total: number;
	page: number;
	limit: number;
	onChange: (page: number, limit: number) => void;
}) => {
	const { t } = useTranslation('common');
	return (
		<TablePagination
			SelectProps={{ disabled }}
			backIconButtonProps={disabled ? { disabled: true } : undefined}
			nextIconButtonProps={disabled ? { disabled: true } : undefined}
			component="div"
			count={total}
			page={page - 1}
			rowsPerPage={limit}
			rowsPerPageOptions={[10, 20, 50]}
			onPageChange={(_, next) => onChange(next + 1, limit)}
			onRowsPerPageChange={(event) => onChange(1, Number(event.target.value))}
			labelRowsPerPage={t('adminPage.rows')}
			labelDisplayedRows={({ from, to, count }) => t('adminPage.range', { from, to, count })}
			getItemAriaLabel={(type) => t(`marketplace.pagination.${type}`)}
		/>
	);
};
