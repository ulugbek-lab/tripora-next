import decodeJWT from 'jwt-decode';
import posthog from 'posthog-js';
import { initializeApollo } from '../../apollo/client';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';

export function getJwtToken(): any {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

export const logIn = async (nick: string, password: string): Promise<void> => {
	try {
		const { jwtToken } = await requestJwtToken({ nick, password });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
			posthog.capture('logged_in');
		}
	} catch (err) {
		void logOut();
		throw err;
	}
};

const requestJwtToken = async ({
	nick,
	password,
}: {
	nick: string;
	password: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	const result = await apolloClient.mutate({
		mutation: LOGIN,
		variables: { input: { memberNick: nick, memberPassword: password } },
		fetchPolicy: 'network-only',
		context: { suppressErrorAlert: true },
	});
	const accessToken = result.data?.login?.accessToken;
	if (!accessToken) throw new Error('Missing access token');
	return { jwtToken: accessToken };
};

export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	try {
		const { jwtToken } = await requestSignUpJwtToken({ nick, password, phone, type });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
			posthog.capture('signed_up');
		}
	} catch (err) {
		void logOut();
		throw err;
	}
};

const requestSignUpJwtToken = async ({
	nick,
	password,
	phone,
	type,
}: {
	nick: string;
	password: string;
	phone: string;
	type: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	const result = await apolloClient.mutate({
		mutation: SIGN_UP,
		variables: { input: { memberNick: nick, memberPassword: password, memberPhone: phone, memberType: type } },
		fetchPolicy: 'network-only',
		context: { suppressErrorAlert: true },
	});
	const accessToken = result.data?.signup?.accessToken;
	if (!accessToken) throw new Error('Missing access token');
	return { jwtToken: accessToken };
};

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
	window.localStorage.setItem('login', Date.now().toString());
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;

	const claims = decodeJWT<CustomJwtPayload>(jwtToken);
	userVar({
		_id: claims._id ?? '',
		memberType: claims.memberType ?? '',
		memberStatus: claims.memberStatus ?? '',
		memberAuthType: claims.memberAuthType,
		memberPhone: claims.memberPhone ?? '',
		memberNick: claims.memberNick ?? '',
		memberFullName: claims.memberFullName ?? '',
		memberImage:
			claims.memberImage === null || claims.memberImage === undefined
				? '/img/profile/defaultUser.svg'
				: `${claims.memberImage}`,
		memberAddress: claims.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? '',
		memberPackages: claims.memberPackages ?? 0,
		memberRank: claims.memberRank,
		memberArticles: claims.memberArticles,
		memberPoints: claims.memberPoints,
		memberLikes: claims.memberLikes,
		memberViews: claims.memberViews,
		memberWarnings: claims.memberWarnings,
		memberBlocks: claims.memberBlocks,
	});
	if (typeof window !== 'undefined' && claims._id) {
		posthog.identify(claims._id, { memberType: claims.memberType });
	}
};

export const logOut = async (): Promise<void> => {
	deleteStorage();
	deleteUserInfo();
	posthog.reset();
	try {
		const response = await fetch(process.env.REACT_APP_API_GRAPHQL_URL as string, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json', 'Apollo-Require-Preflight': 'true' },
			body: JSON.stringify({ query: 'mutation { logout }' }),
		});
		const result = await response.json();
		if (!response.ok || result.errors?.length) throw new Error('Logout failed');
	} catch {
		console.warn('Unable to clear the refresh cookie');
	}
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	window.localStorage.setItem('logout', Date.now().toString());
};


const deleteUserInfo = () => {
	userVar({
		_id: '',
		memberType: '',
		memberStatus: '',
		memberAuthType: '',
		memberPhone: '',
		memberNick: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberDesc: '',
		memberPackages: 0,
		memberRank: 0,
		memberArticles: 0,
		memberPoints: 0,
		memberLikes: 0,
		memberViews: 0,
		memberWarnings: 0,
		memberBlocks: 0,
	});
};
