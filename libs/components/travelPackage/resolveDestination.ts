import { ApolloClient } from '@apollo/client';
import { GET_HOME_DESTINATIONS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { canonicalDestinationValues, countrySearchTerms, HomeDestination } from '../homepage/homeDestination';

// Resolve only matching destination metadata, never filter the marketplace result list in the browser.
export async function resolveDestination(
	client: ApolloClient<object>,
	value: string,
	field: keyof HomeDestination,
	countryList?: string[],
): Promise<string[]> {
	const destinations: HomeDestination[] = [];
	const terms = field === 'packageCountry' ? countrySearchTerms(value) : [value.trim()];
	for (const text of terms) {
		let page = 1;
		let total = 0;
		do {
			const { data } = await client.query<{
				getTravelPackages: { list: HomeDestination[]; metaCounter: { total: number }[] };
			}>({
				query: GET_HOME_DESTINATIONS,
				context: { suppressErrorAlert: true },
				fetchPolicy: 'network-only',
				variables: {
					input: {
						page,
						limit: 50,
						sort: 'createdAt',
						direction: Direction.DESC,
						search: { text, ...(countryList?.length ? { countryList } : {}) },
					},
				},
			});
			destinations.push(...data.getTravelPackages.list);
			total = data.getTravelPackages.metaCounter?.[0]?.total ?? 0;
			page += 1;
		} while ((page - 1) * 50 < total);
	}
	return canonicalDestinationValues(value, field, destinations);
}
