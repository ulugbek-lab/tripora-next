import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberPackages
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;


/**************************
 *     TRAVEL-PACKAGE     *
 *************************/

const travelPackageAdminMutationFields = `
	_id
	packageType
	packageStatus
	packageCountry
	packageCity
	packageTitle
	packagePrice
	packageCurrency
	packageDurationDays
	packageMaxTravellers
	packageAvailableSlots
	packageImages
	packageStartDate
	memberId
	packageViews
	packageLikes
	packageComments
	packageRank
	soldOutAt
	deletedAt
	createdAt
	updatedAt
	packageDesc
`;

export const UPDATE_TRAVEL_PACKAGE_BY_ADMIN = gql`
	mutation UpdateTravelPackageByAdmin($input: TravelPackageUpdate!) {
		updateTravelPackageByAdmin(input: $input) {
			${travelPackageAdminMutationFields}
		}
	}
`;

export const REMOVE_TRAVEL_PACKAGE_BY_ADMIN = gql`
	mutation RemoveTravelPackageByAdmin($input: String!) {
		removeTravelPackageByAdmin(packageId: $input) {
			${travelPackageAdminMutationFields}
		}
	}
`;
