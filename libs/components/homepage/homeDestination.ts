export interface HomeDestination {
	packageCountry: string;
	packageCity: string;
}
// Equivalence groups, not canonical spellings. Values sent to the backend always come from its data.
const countryAliases = [
	['us', 'usa', 'united states', 'united states of america'],
	['south korea', 'republic of korea', 'kr'],
	['uk', 'united kingdom', 'great britain'],
];
export const destinationKey = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, ' ');
export function countrySearchTerms(value: string): string[] {
	const key = destinationKey(value);
	return countryAliases.find((group) => group.includes(key)) ?? [value.trim()];
}
export function canonicalDestinationValues(
	value: string,
	field: keyof HomeDestination,
	destinations: HomeDestination[],
): string[] {
	const keys = field === 'packageCountry' ? countrySearchTerms(value).map(destinationKey) : [destinationKey(value)];
	return Array.from(
		new Set(destinations.map((item) => item[field]).filter((stored) => keys.includes(destinationKey(stored)))),
	);
}
