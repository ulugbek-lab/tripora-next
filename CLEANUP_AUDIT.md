# Tripora final cleanup audit

Scope: frontend obsolete-file cleanup. Backend source was not changed. Prior Agent-detail deletions are excluded from the counts below.

## Deleted files

96 files deleted: 66 public assets and 30 source/style files.

### Routes/components

- `libs/components/Footer.tsx`
- `libs/components/Top.tsx`
- `libs/components/common/PropertyBigCard.tsx`
- `libs/components/cs/Inquiry.tsx`
- `libs/components/layout/LayoutBasic.tsx`
- `libs/components/layout/LayoutFull.tsx`
- `libs/components/property/Filter.tsx`
- `libs/components/property/PropertyCard.tsx`
- `libs/components/property/Review.tsx`
- `pages/property/detail.tsx`
- `pages/property/index.tsx`

### Types/enums

- `libs/enums/like.enum.ts`
- `libs/enums/notice.enum.ts`
- `libs/enums/notification.enum.ts`
- `libs/enums/property.enum.ts`
- `libs/enums/view.enum.ts`
- `libs/types/board-article/board-article.update.ts`
- `libs/types/comment/comment.update.ts`
- `libs/types/follow/follow.input.ts`
- `libs/types/like/like.input.ts`
- `libs/types/like/like.ts`
- `libs/types/member/member.update.ts`
- `libs/types/property/property.input.ts`
- `libs/types/property/property.ts`
- `libs/types/property/property.update.ts`
- `libs/types/view/view.input.ts`
- `libs/types/view/view.ts`

### SCSS

- `scss/mobile/general.scss`
- `scss/pc/property/detail.scss`
- `scss/pc/property/property.scss`

### Assets

- `public/img/apartmentMain.png`
- `public/img/banner/types/apartment.webp`
- `public/img/banner/types/house.webp`
- `public/img/banner/types/villa.webp`
- `public/img/events/BUSAN.webp`
- `public/img/events/DAEGU.webp`
- `public/img/events/INCHEON.webp`
- `public/img/events/SEOUL.webp`
- `public/img/flag/langen.png`
- `public/img/flag/langkr.png`
- `public/img/flag/langru.png`
- `public/img/icons/Vector.svg`
- `public/img/icons/arrowBig.svg`
- `public/img/icons/bed.svg`
- `public/img/icons/brands/logitech.svg`
- `public/img/icons/call.svg`
- `public/img/icons/chat.svg`
- `public/img/icons/chatWhite.svg`
- `public/img/icons/discovery.svg`
- `public/img/icons/discoveryWhite.svg`
- `public/img/icons/electricity.svg`
- `public/img/icons/expand.svg`
- `public/img/icons/followers.png`
- `public/img/icons/followings.png`
- `public/img/icons/fullscreen.svg`
- `public/img/icons/home.svg`
- `public/img/icons/homeWhite.svg`
- `public/img/icons/icoAlert.svg`
- `public/img/icons/like.svg`
- `public/img/icons/likeWhite.svg`
- `public/img/icons/logout.svg`
- `public/img/icons/logoutWhite.svg`
- `public/img/icons/newTab.svg`
- `public/img/icons/reset.svg`
- `public/img/icons/review.svg`
- `public/img/icons/reviewWhite.svg`
- `public/img/icons/rightup.svg`
- `public/img/icons/room.svg`
- `public/img/icons/search.svg`
- `public/img/icons/searchWhite.svg`
- `public/img/icons/search_icon.png`
- `public/img/icons/search_menu.svg`
- `public/img/icons/search_white.svg`
- `public/img/icons/share.svg`
- `public/img/icons/shower.svg`
- `public/img/icons/tune.svg`
- `public/img/icons/user.svg`
- `public/img/icons/userWhite.svg`
- `public/img/icons/whiteTab.svg`
- `public/img/logo/logoText.svg`
- `public/img/logo/logoWhite.svg`
- `public/img/property/bigImage.png`
- `public/img/property/floorPlan.png`
- `public/img/property/girlBrunette.png`
- `public/img/property/sub1.png`
- `public/img/property/sub2.png`
- `public/img/property/sub3.png`
- `public/img/property/sub4.png`
- `public/img/travel/city-travel-poster.jpg`
- `public/img/travel/coastal-exploration-poster.jpg`
- `public/img/travel/scenic-exploration-poster.jpg`
- `public/next.svg`
- `public/vercel.svg`
- `public/video/city-travel.mp4`
- `public/video/coastal-exploration.mp4`
- `public/video/scenic-exploration.mp4`

## Empty folders removed

- `pages/property`
- `libs/components/property`
- `libs/types/property`
- `libs/types/like`
- `libs/types/view`
- `scss/pc/property`
- `public/img/property`
- `public/img/banner/types`
- `public/img/events`
- `public/img/flag`
- `public/img/icons/brands`
- `public/img/icons`

## Apollo exports removed

- `apollo/user/query.ts`: `GET_MEMBER`, `GET_PROPERTY`, `GET_PROPERTIES`, `GET_AGENT_PROPERTIES`, `GET_FAVORITES`, `GET_VISITED`, `GET_MEMBER_FOLLOWERS`, `GET_MEMBER_FOLLOWINGS`.
- `apollo/user/mutation.ts`: `CREATE_PROPERTY`, `UPDATE_PROPERTY`, `LIKE_TARGET_PROPERTY`, `UPDATE_BOARD_ARTICLE`.
- `apollo/admin/query.ts`: `GET_COMMENTS`.
- `apollo/admin/mutation.ts`: `REMOVE_COMMENT_BY_ADMIN`.

## Other cleanup

- Shared MeLiked/TotalCounter imports now use identical existing TravelPackage types, allowing the obsolete Property types to be deleted.
- Removed three unused like helper functions and Property-only configuration constants.
- Removed unused PROPERTY/COMMENT members from CommentGroup. Current ARTICLE, MEMBER and TRAVEL_PACKAGE values remain.
- Removed 20 obsolete flat legacy translation keys from each of en, kr, ru, ja and zh. Active nested resources and dynamic key families were kept.
- Removed the dead PropertyBigCard selector block; shared Community and other uncertain styles were kept.
- Home uses only the active beach video/poster. Inactive comparison configuration and source notes were removed; the CSS fallback now uses the beach poster too.
- Corrected old Nestar/real-estate SEO metadata in _document.tsx without changing layout.

## Intentional retention

- My Page myProperties/addProperty aliases still map old URLs to active TravelPackage sections.
- Chat is still imported by Home and TravelPackage detail. SweetAlert helpers/dependency remain required by Chat and Apollo error handling.
- Dynamic city assets, all profile/fallback images, favicon, and potentially data-referenced imagery were kept.
- Shared card variants, helpers, styles, runtime enums and active Apollo operations were kept where consumers or uncertainty remain.
- Package identity, README and CHANGELOG historical Nestar references were retained; changing package metadata/dependencies was not needed.
- Uncertain or still-referenced files were kept.

## Verification

- Frontend TypeScript: passed.
- Frontend production build: passed after the final CSS fallback correction (87 static pages generated).
- Backend build: passed; no backend source cleanup.
- Literal public asset references: no missing paths after fallback correction.
- Import sanity: TypeScript/build resolve remaining imports; dynamic asset construction and navigation references were inspected.
- Production routes retain all active Tripora pages and omit Property, Agent detail and About.

Deletion discipline: the broad initial deletion was rejected by automatic approval review; no files were removed by that attempt. Usage checks were expanded, and cleanup then proceeded in verified dependency order.
