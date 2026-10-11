import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'], {
			...require('../../next-i18next.config'),
			reloadOnPrerender: process.env.NODE_ENV === 'development',
		})),
	},
});

const AdminHome: NextPage = (props: any) => {
	const router = useRouter();

	/** LIFECYCLES **/
	useEffect(() => {
		void router.replace('/_admin/users');
	}, []);
	return <></>;
};

export default withAdminLayout(AdminHome);
