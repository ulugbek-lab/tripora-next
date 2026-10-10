import { TravelPackageStatus, TravelPackageType } from '../../enums/travel-package.enum';
import { Member } from '../member/member';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TravelPackage {
	_id: string;
	packageType: TravelPackageType;
	packageStatus: TravelPackageStatus;
	packageCountry: string;
	packageCity: string;
	packageTitle: string;
	packagePrice: number;
	packageCurrency: string;
	packageDurationDays: number;
	packageMaxTravellers: number;
	packageAvailableSlots: number;
	packageImages: string[];
	packageDesc?: string | null;
	packageStartDate: Date | string;
	memberId: string;
	packageViews: number;
	packageLikes: number;
	packageComments: number;
	packageRank: number;
	soldOutAt?: Date | string | null;
	deletedAt?: Date | string | null;
	createdAt: Date | string;
	updatedAt: Date | string;
	meLiked?: MeLiked[] | null;
	memberData?: Member | null;
}

export interface TotalCounter {
	total: number | null;
}

export interface TravelPackages {
	list: TravelPackage[];
	metaCounter?: TotalCounter[] | null;
}
