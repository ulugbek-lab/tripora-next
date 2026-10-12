import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_AGENTS = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
			list {
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
				memberWarnings
				memberBlocks
				memberPackages
				memberRank
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
				accessToken
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
			memberId
			createdAt
			updatedAt
			memberData {
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
				memberWarnings
				memberBlocks
				memberPackages
				memberRank
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
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
					memberWarnings
					memberBlocks
					memberPackages
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
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
					memberWarnings
					memberBlocks
					memberPackages
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/
/**************************
 *     TRAVEL-PACKAGE     *
 *************************/

const travelPackageFields = `
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
	memberData {
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
		memberWarnings
		memberBlocks
		memberPackages
		memberRank
		memberPoints
		memberLikes
		memberViews
		deletedAt
		createdAt
		updatedAt
	}
	meLiked {
		memberId
		likeRefId
		myFavorite
	}
`;

export const GET_TRAVEL_PACKAGES = gql`
	query GetTravelPackages($input: TravelPackagesInquiry!) {
		getTravelPackages(input: $input) {
			list {
				${travelPackageFields}
			}
			metaCounter { total }
		}
	}
`;

export const GET_AGENT_TRAVEL_PACKAGES = gql`
	query GetAgentTravelPackages($input: AgentTravelPackagesInquiry!) {
		getAgentTravelPackages(input: $input) {
			list {
				${travelPackageFields}
				packageDesc
			}
			metaCounter { total }
		}
	}
`;

export const GET_FAVORITE_TRAVEL_PACKAGES = gql`
	query GetFavoriteTravelPackages($input: OrdinaryInquiry!) {
		getFavoriteTravelPackages(input: $input) {
			list {
				${travelPackageFields}
			}
			metaCounter { total }
		}
	}
`;

export const GET_VISITED_TRAVEL_PACKAGES = gql`
	query GetVisitedTravelPackages($input: OrdinaryInquiry!) {
		getVisitedTravelPackages(input: $input) {
			list {
				${travelPackageFields}
			}
			metaCounter { total }
		}
	}
`;

export const GET_TRAVEL_PACKAGE = gql`
	query GetTravelPackage($input: String!) {
		getTravelPackage(packageId: $input) {
			${travelPackageFields}
			packageDesc
			memberData {
				meFollowed { followingId followerId myFollowing }
			}
		}
	}
`;

// Compact member selection used by TravelPackage comments.
export const GET_TRAVEL_PACKAGE_COMMENTS = gql`
	query GetTravelPackageComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData { _id memberNick memberImage memberType }
			}
			metaCounter { total }
		}
	}
`;

// Compact agent selection used by Home.
export const GET_TRAVEL_AGENTS = gql`
	query GetTravelAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
			list { _id memberType memberNick memberImage memberPackages }
			metaCounter { total }
		}
	}
`;

export const GET_TRAVEL_MEMBER = gql`
 query GetTravelMember($input: String!) {
  getMember(memberId: $input) {
   _id memberType memberStatus memberAuthType memberPhone memberNick memberFullName memberImage memberAddress memberDesc
   memberPackages memberArticles memberFollowers memberFollowings memberLikes memberViews memberRank
   createdAt updatedAt
   meFollowed { followingId followerId myFollowing }
  }
 }
`;

// Home uses only the community fields supported by the current Tripora contract.
export const GET_HOME_BOARD_ARTICLES = gql`
 query GetHomeBoardArticles($input: BoardArticlesInquiry!) {
  getBoardArticles(input: $input) {
   list { _id articleCategory articleTitle articleImage createdAt memberData { memberNick } }
   metaCounter { total }
  }
 }
`;

// Minimal metadata for Home destination resolution; package results stay server-filtered.
export const GET_HOME_DESTINATIONS = gql`
 query GetHomeDestinations($input: TravelPackagesInquiry!) {
  getTravelPackages(input: $input) {
   list { _id packageCountry packageCity }
   metaCounter { total }
  }
 }
`;

// Public profile connections: only fields used by the Tripora Member cards.
export const GET_PUBLIC_MEMBER_FOLLOWERS = gql`
 query PublicMemberFollowers($input: FollowInquiry!) {
  getMemberFollowers(input: $input) {
   list { _id meLiked { memberId likeRefId myFavorite } meFollowed { followingId followerId myFollowing }
    followerData { _id memberType memberNick memberFullName memberImage memberDesc memberAddress memberPackages memberLikes memberViews } }
   metaCounter { total }
  }
 }
`;
export const GET_PUBLIC_MEMBER_FOLLOWINGS = gql`
 query PublicMemberFollowings($input: FollowInquiry!) {
  getMemberFollowings(input: $input) {
   list { _id meLiked { memberId likeRefId myFavorite } meFollowed { followingId followerId myFollowing }
    followingData { _id memberType memberNick memberFullName memberImage memberDesc memberAddress memberPackages memberLikes memberViews } }
   metaCounter { total }
  }
 }
`;
export const GET_PUBLIC_MEMBER_ARTICLES = gql`
 query PublicMemberArticles($input: BoardArticlesInquiry!) {
  getBoardArticles(input: $input) {
   list { _id articleCategory articleTitle articleImage articleLikes articleViews createdAt meLiked { memberId likeRefId myFavorite } }
   metaCounter { total }
  }
 }
`;

