import React, { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Tab, Tabs, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'next-i18next';

const FAQ_CATEGORIES = {
	account: ['create', 'signIn'],
	packages: ['find', 'save'],
	agents: ['become', 'contact'],
	community: ['post', 'privacy'],
};
const Faq = () => {
	const { t } = useTranslation('common');
	const [category, setCategory] = useState<keyof typeof FAQ_CATEGORIES>('account');
	const [expanded, setExpanded] = useState<string | false>(false);
	return (
		<Stack className="faq-content">
			<Tabs
				value={category}
				variant="scrollable"
				scrollButtons="auto"
				allowScrollButtonsMobile
				aria-label={t('csPage.categoriesLabel')}
				onChange={(_, value: keyof typeof FAQ_CATEGORIES) => {
					setCategory(value);
					setExpanded(false);
				}}
			>
				{Object.keys(FAQ_CATEGORIES).map((key) => (
					<Tab key={key} value={key} label={t(`csPage.categories.${key}`)} />
				))}
			</Tabs>
			<div className="cs-faq-list">
				{FAQ_CATEGORIES[category].map((key) => {
					const id = `faq-${category}-${key}`;
					return (
						<Accordion
							key={id}
							disableGutters
							elevation={0}
							expanded={expanded === id}
							onChange={(_, open) => setExpanded(open ? id : false)}
						>
							<AccordionSummary expandIcon={<ExpandMoreIcon />} id={`${id}-header`} aria-controls={`${id}-answer`}>
								<Typography component="h3">{t(`csPage.faq.${category}.${key}.question`)}</Typography>
							</AccordionSummary>
							<AccordionDetails id={`${id}-answer`}>
								<Typography>{t(`csPage.faq.${category}.${key}.answer`)}</Typography>
							</AccordionDetails>
						</Accordion>
					);
				})}
			</div>
		</Stack>
	);
};
export default Faq;
