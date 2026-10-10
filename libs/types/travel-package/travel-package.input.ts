import { TravelPackageStatus, TravelPackageType } from '../../enums/travel-package.enum';
import { Direction } from '../../enums/common.enum';

export interface TravelPackageInput {
	packageType: TravelPackageType;
	packageCountry: string;
	packageCity: string;
	packageTitle: string;
	packagePrice: number;
	packageCurrency: string;
	packageDurationDays: number;
	packageMaxTravellers: number;
	packageAvailableSlots: number;
	packageImages?: string[];
	packageDesc?: string;
	packageStartDate: Date | string;
}

// GraphQL Int bounds are nonnegative and inclusive; start must not exceed end.
export interface PriceRange {
	start: number;
	end: number;
}

export interface DurationRange {
	start: number;
	end: number;
}

// Strings must be ISO date-time values for the backend DateTime scalar.
export interface StartDateRange {
	start: Date | string;
	end: Date | string;
}

export interface TravelPackageSearch {
	memberId?: string;
	countryList?: string[];
	cityList?: string[];
	typeList?: TravelPackageType[];
	packageCurrency?: string;
	priceRange?: PriceRange;
	durationRange?: DurationRange;
	// Filters packageMaxTravellers, not available slots or requested party size.
	maxTravellersRange?: DurationRange;
	startDateRange?: StartDateRange;
	text?: string;
}

export interface TravelPackagesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: TravelPackageSearch;
}

export interface AgentTravelPackageSearch {
	packageStatus?: TravelPackageStatus;
}

export interface AgentTravelPackagesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AgentTravelPackageSearch;
}

export interface AdminTravelPackageSearch {
	packageStatus?: TravelPackageStatus;
	countryList?: string[];
}

export interface AllTravelPackagesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AdminTravelPackageSearch;
}

export interface OrdinaryInquiry {
	page: number;
	limit: number;
}
