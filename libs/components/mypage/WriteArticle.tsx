import React from 'react';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
const TuiEditor = dynamic(() => import('../community/Teditor'), { ssr: false });
const WriteArticle = () => {
	const { t } = useTranslation('common');
	return (
		<Stack className="mypage-write-article">
			<h2>{t('myPage.writeArticle')}</h2>
			<TuiEditor />
		</Stack>
	);
};
export default WriteArticle;
