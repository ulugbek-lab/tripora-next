import { TravelPackageStatus, TravelPackageType } from '../../enums/travel-package.enum';

export interface TravelPackageUpdate {
	_id: string;
	packageStatus?: TravelPackageStatus;
	packageType?: TravelPackageType;
	packageCountry?: string;
	packageCity?: string;
	packageTitle?: string;
	packagePrice?: number;
	packageCurrency?: string;
	packageDurationDays?: number;
	packageMaxTravellers?: number;
	packageAvailableSlots?: number;
	packageImages?: string[];
	packageDesc?: string;
	packageStartDate?: Date | string;
}
