# AGENTS.md — Tripora Next Frontend Migration Rules

## 1. Purpose

This file is the single source of truth for the `tripora-next` frontend migration.

The project is being migrated from the existing Nestar frontend into Tripora.

The migration MUST preserve the current Nestar frontend architecture, folder organization, coding style, Apollo patterns, authentication flow, component structure, page structure, MUI usage, SCSS usage, and general business logic unless a change is explicitly required for the Tripora domain.

This is a migration, not a rewrite.

Do not redesign the frontend architecture.
Do not introduce a new framework structure.
Do not replace existing working patterns simply because another approach is newer.

The main goals are:

- migrate the real-estate domain into the Tripora travel-package domain;
- preserve the familiar Nestar code structure so the code remains easy to understand;
- update the design and visible product language for Tripora;
- integrate the TravelPackage backend contract correctly;
- implement TravelPackage filtering without changing the existing frontend architecture;
- keep unmigrated areas working during incremental migration;
- avoid broad refactors and unrelated cleanup.

---

# IMPORTANT OVERRIDE — CURRENT FRONTEND MIGRATION STRATEGY

The Tripora frontend migration is now **page-oriented**, not broad domain-oriented.

This section overrides any older migration instructions in this file that suggest migrating many pages or domains before finishing the current page.

The frontend must now be migrated and finalized **one page at a time**.

Do not begin substantial work on another page until the current page has been completed, tested, cleaned up, and reviewed.

The goal is no longer only to replace Property with TravelPackage.

The goal is to finish each Tripora page as a production-quality travel marketplace page before moving to the next one.

---

## 1. Page-by-Page Migration Rule

For every page, use this workflow:

```text
Inspect existing Nestar page
↓
Understand current logic and dependencies
↓
Adapt backend/data logic to Tripora
↓
Design the Tripora UI
↓
Implement UX and interactions
↓
Implement desktop and mobile behavior
↓
Replace SweetAlert usage on that page
↓
Remove legacy Property code made unused by that page
↓
Run TypeScript/build
↓
Test against the live backend
↓
Visually review the page
↓
Only then move to the next page
```

Do not migrate another page simply because its backend contract already exists.

Do not create unfinished placeholder implementations for later pages.

A page is either:

- currently being migrated/finalized; or
- left in its existing state until its turn.

---

## 2. Current Page Order

Unless explicitly changed by the user, use this order:

```text
1. Home page
2. TravelPackage marketplace
3. TravelPackage detail
4. Login / Signup
5. Member / Agent profile
6. My Page / Agent package management
7. Community
8. AI itinerary planner
9. Admin
10. Final global cleanup
```

Do not automatically continue to the next page after completing one.

Stop and report the completed page.

The user will review the page before the next one begins.

---

## 3. Definition of a Finished Page

A page is not complete merely because:

- TypeScript passes;
- GraphQL works;
- the backend responds;
- the page renders.

A migrated Tripora page is complete only when all applicable items are done:

- correct Tripora backend integration;
- correct TravelPackage/member/community data;
- final page-specific UI;
- final page-specific UX;
- responsive desktop behavior;
- responsive mobile behavior;
- loading state;
- error state;
- empty state;
- success feedback;
- authentication behavior where required;
- correct routing;
- correct images;
- correct filters/sorting/pagination where required;
- `react-hot-toast` feedback where appropriate;
- MUI confirmation dialogs for destructive actions;
- no obsolete Property UI still used by that page;
- unused page-specific legacy files cleaned up;
- TypeScript passes;
- production build passes;
- live API behavior tested when backend is available;
- visual layout inspected.

Do not call a page complete if it still looks like the old real-estate Nestar UI with only labels changed.

---

# DESIGN DIRECTION

## 4. Tripora Visual Identity

Tripora should look like a modern travel discovery and travel-package marketplace.

Use travel products such as KAYAK as **design inspiration**, especially for information hierarchy and search UX.

Do NOT copy:

- KAYAK branding;
- KAYAK logos;
- copyrighted visual assets;
- exact page layouts;
- exact component designs.

Create an original Tripora interface using the existing:

```text
MUI
+
SCSS
+
existing Pages Router architecture
```

Do not introduce another design system.

---

## 5. Travel Marketplace Design Principles

Tripora public pages should favor:

- search-first layouts;
- clear destination discovery;
- prominent travel search controls;
- strong destination/package imagery;
- compact comparison-friendly package cards;
- clear price hierarchy;
- clear destination hierarchy;
- clear date/duration/traveller information;
- modern rounded surfaces;
- restrained borders;
- restrained shadows;
- generous but purposeful spacing;
- strong typography hierarchy;
- travel-oriented icons;
- responsive controls;
- useful hover/focus states;
- clean mobile layouts.

Avoid:

- generic admin-dashboard appearance;
- excessive boxed sections;
- excessive gradients;
- overly large decorative hero content with weak functionality;
- real-estate visual language;
- crowded cards;
- unnecessary animations;
- random colors;
- inconsistent border radii;
- duplicated search controls.

The UI should clearly communicate:

```text
travel
destination
package
date
duration
travellers
price
agent
```

before secondary engagement statistics.

---

## 6. Search-First Public Experience

For major travel discovery pages, especially Home and TravelPackage marketplace, search should have strong visual priority.

A typical Tripora search hierarchy can follow this conceptual pattern:

```text
Destination
Departure date
Duration
Travellers / capacity
Package type
Search
```

More advanced filters may remain behind:

```text
More filters
```

when appropriate.

Do not force every backend filter into the primary hero search.

The marketplace can expose the complete filter set.

---

## 7. Design Must Follow the Product Domain

Do not directly convert real-estate UI labels into travel labels without reconsidering the UX.

Example:

Bad migration:

```text
Property location → Package location
Bedrooms → Travellers
Square meters → Duration
```

Correct migration:

Design the travel interaction based on the TravelPackage backend domain.

Remove Property concepts that do not belong.

---

# CLEANUP POLICY

## 8. Legacy Property Cleanup

The earlier migration intentionally preserved legacy Property components to avoid breaking dependencies.

From this point forward, cleanup should happen **page by page**.

After a page is fully replaced with its Tripora implementation:

1. identify legacy Property components previously used only by that page;
2. search all repository imports/usages;
3. verify they are no longer used;
4. remove them if safe;
5. remove their unused SCSS;
6. remove unused exports/imports;
7. rerun TypeScript and build.

Do NOT leave clearly dead Property components indefinitely.

However, do NOT mass-delete Property files.

Deletion requires proof that the file has no remaining dependency.

Use this rule:

```text
zero imports
+
zero route dependencies
+
zero shared dependencies
=
safe cleanup candidate
```

If any dependency remains, keep the legacy file until that dependent page is migrated.

---

## 9. Cleanup Scope

When finalizing a page, cleanup may include:

- obsolete Property page components;
- obsolete Property cards;
- obsolete Property filters;
- unused page-specific Property SCSS;
- dead imports;
- dead helper functions;
- unused GraphQL operation imports;
- unused temporary migration components.

Do not use page cleanup as an excuse for unrelated repository-wide refactoring.

---

## 10. Homepage Cleanup Example

Once the Tripora homepage is finalized, inspect old files such as:

```text
HeaderFilter.tsx
TrendProperties.tsx
TrendPropertyCard.tsx
PopularProperties.tsx
PopularPropertyCard.tsx
TopProperties.tsx
TopPropertyCard.tsx
```

If they have no remaining imports or dependencies, remove them.

Do not preserve them merely because they belonged to Nestar.

---

# USER FEEDBACK SYSTEM

## 11. react-hot-toast

Tripora should use:

```text
react-hot-toast
```

for transient user feedback.

Use toast feedback for events such as:

- successful create;
- successful update;
- successful upload;
- successful login;
- successful profile update;
- recoverable request failure;
- like/favorite failure;
- network failure;
- validation summary when appropriate.

Examples:

```ts
toast.success('Travel package created');
toast.success('Changes saved');
toast.error('Unable to update travel package');
```

Do not introduce new SweetAlert usage.

---

## 12. SweetAlert Migration

SweetAlert/SweetAlert2 is legacy Nestar behavior.

When working on a page that uses SweetAlert:

### Replace transient alerts

Replace:

```text
SweetAlert success
SweetAlert error
SweetAlert info
```

with:

```text
react-hot-toast
```

### Replace destructive confirmations

Do NOT use toast for destructive confirmation.

Replace SweetAlert confirmation dialogs with the existing MUI dialog system:

```text
Dialog
DialogTitle
DialogContent
DialogActions
Button
```

or an existing reusable MUI confirmation dialog if the project already has one.

Examples requiring confirmation:

- delete package;
- soft-delete package;
- remove account/content;
- important status change.

---

## 13. SweetAlert Removal

Do NOT immediately remove the SweetAlert dependency globally.

Migrate it page by page.

Only remove the package after repository-wide verification shows:

```text
zero SweetAlert imports
```

Then remove:

- dependency;
- unused SweetAlert helpers;
- related imports.

Do not keep multiple notification libraries after migration is complete.

---

# ARCHITECTURE STILL REMAINS LOCKED

## 14. Architecture Preservation

The new page-by-page strategy does NOT permit architecture rewriting.

Continue to preserve:

- Next.js Pages Router;
- React;
- MUI;
- SCSS;
- Apollo Client;
- current auth architecture;
- current folder hierarchy;
- current layout architecture;
- current GraphQL organization;
- current routing conventions;
- current reactive variables;
- current project utilities where appropriate.

Do NOT introduce:

- App Router migration;
- Tailwind;
- shadcn/ui;
- Redux;
- Zustand;
- React Query;
- another GraphQL client;
- another styling framework;
- another toast library;
- a new global state architecture.

Design freedom applies to the UI and UX, not to rewriting the project's technical architecture.

---

# PAGE IMPLEMENTATION RULE

## 15. Before Editing a Page

Before changing any page:

1. inspect its page file;
2. inspect all directly used components;
3. inspect its GraphQL operations;
4. inspect its SCSS;
5. inspect desktop/mobile behavior;
6. identify Property-specific logic;
7. identify reusable generic logic;
8. identify legacy files that may become unused after migration.

Do not code before understanding those dependencies.

---

## 16. While Editing a Page

Make the page fully Tripora-specific.

This includes:

- domain terminology;
- UI layout;
- data fields;
- imagery;
- buttons;
- navigation;
- filters;
- empty states;
- errors;
- toast messaging;
- responsive behavior.

Do not preserve an old Nestar interaction merely because it already exists if it does not make sense for travel.

Preserve architecture, not inappropriate product UX.

---

## 17. After Editing a Page

Before finishing:

1. search for now-unused legacy components;
2. safely remove confirmed dead files;
3. remove unused SCSS;
4. remove unused imports;
5. verify no visible Property labels remain on the migrated page;
6. test TypeScript;
7. run production build;
8. test the real backend when available;
9. inspect desktop;
10. inspect mobile.

Then report:

```text
Created files
Modified files
Deleted legacy files
Logic changes
UI/design changes
Toast migration
Responsive behavior
Live API verification
TypeScript/build results
Remaining legacy dependencies
```

Stop after the page.

---

# CURRENT PRIORITY

## 18. Current Page

The current priority is:

```text
Home page /
```

Do not start another page until the Home page redesign/finalization is completed and reviewed by the user.

The Home page task now includes:

- final Tripora travel design;
- KAYAK-inspired search-first UX;
- TravelPackage homepage data;
- Tripora branding;
- responsive design;
- homepage toast migration if applicable;
- legacy Property homepage cleanup;
- live API validation.

After completion, stop.

Do not automatically begin `/travel-package`.

---

# FINAL PRINCIPLE

The frontend migration target is now:

```text
one finished Tripora page
↓
clean it
↓
test it
↓
review it
↓
move to the next page
```

not:

```text
migrate the whole Property domain
↓
clean everything later
```

Tripora should retain the understandable Nestar technical architecture while becoming a visually and functionally distinct travel marketplace.

## 2. Reference Project

Tripora frontend is based on the existing Nestar Next frontend.

Preserve the current project structure and patterns from the restored pre-migration baseline.

Do not use a previous experimental migration commit as the architectural reference.

The frontend migration must start from the clean Nestar-derived baseline after removing the two earlier migration commits.

Before changing a file:

1. inspect the existing Nestar/Tripora implementation;
2. understand how the same feature currently works;
3. change only what is required for Tripora;
4. preserve the same code organization where possible.

---

## 3. Absolute Architecture Rule

### DO NOT CHANGE FRONTEND ARCHITECTURE

Keep the existing frontend architecture.

In particular:

- keep the existing Next.js routing model already used by the project;
- keep the existing `pages`-based structure if that is what the restored project uses;
- do not migrate to Next.js App Router;
- keep MUI;
- keep the current SCSS structure;
- keep Apollo Client;
- keep the existing authentication/JWT flow unless the backend contract forces a specific compatibility fix;
- keep existing custom hooks;
- keep existing layouts;
- keep existing page/component separation;
- keep current shared utility patterns;
- keep existing router/query handling style;
- keep the existing pagination approach;
- keep the existing sorting approach;
- keep current `useQuery`, `useMutation`, `useReactiveVar`, `useState`, and related patterns where already used;
- keep the current component composition style.

Do NOT introduce by default:

- shadcn/ui;
- Tailwind migration;
- Redux;
- Zustand;
- a second GraphQL client;
- a new global state architecture;
- GraphQL Code Generator if the current frontend does not already use it;
- React Query/TanStack Query;
- a new folder architecture;
- a new auth architecture;
- a BFF/proxy architecture;
- a second toast system;
- a broad TypeScript model rewrite;
- new service/repository abstractions around existing Apollo logic;
- large cross-project renames unrelated to Tripora;
- speculative performance abstractions;
- unnecessary `useMemo` or `useCallback`.

Do not convert working code just for stylistic consistency.

---

## 4. Core Domain Mapping

Tripora's main marketplace entity is:

`TravelPackage`

This replaces the Nestar real-estate `Property` concept.

Use:

- `TravelPackage`
- `travelPackage`
- `travelPackages`
- `TravelPackagesInquiry`
- `TravelPackageInput`
- `TravelPackageUpdate`
- `getTravelPackage`
- `getTravelPackages`
- `getFavoriteTravelPackages`
- `getVisitedTravelPackages`

Use the exact backend GraphQL names when they differ.

The migration should use TravelPackage terminology in all newly migrated package-related frontend code.

### Preferred naming

Examples:

```text
Property                  -> TravelPackage
Properties                -> TravelPackages
property                  -> travelPackage
properties                -> travelPackages
PropertyCard              -> TravelPackageCard
PropertyBigCard           -> TravelPackageBigCard
PropertyDetail            -> TravelPackageDetail
PropertiesInquiry         -> TravelPackagesInquiry
propertyId                -> travelPackageId or packageId
propertyType              -> packageType
propertyPrice             -> packagePrice
propertyImages            -> packageImages
propertyViews             -> packageViews
propertyLikes             -> packageLikes
propertyComments          -> packageComments
propertyRank              -> packageRank
```

Prefer backend field names exactly when the backend schema already establishes the final name.

Do not perform blind text replacement of the word `property`.

Generic JavaScript/TypeScript/CSS concepts such as object properties, component props, library APIs, CSS properties, or third-party types must not be renamed.

---

## 5. Route Naming

The marketplace route must use:

```text
/travel-package
```

not:

```text
/property
```

Package detail routes should remain consistent with the existing Pages Router structure, but use the TravelPackage domain.

Examples may include:

```text
/travel-package
/travel-package/detail?id=...
```

or the equivalent pattern already used by Nestar.

Do not invent a new routing architecture merely to create prettier URLs.

If the existing Nestar project uses query-based detail routes, preserve that approach unless there is a direct requirement to change it.

During migration:

- `/travel-package` becomes the canonical TravelPackage marketplace route;
- old `/property` entry points may redirect to `/travel-package` when safe;
- do not immediately delete Property code still required by unmigrated pages;
- remove old files only after confirming that no active page imports or depends on them.

Do not create duplicate competing package routes.

---

## 6. Folder Naming

For migrated TravelPackage functionality, prefer TravelPackage-specific folder names while preserving the same hierarchy as Nestar.

For example, if Nestar has:

```text
libs/components/property/
```

the migrated Tripora equivalent should normally be:

```text
libs/components/travelPackage/
```

or another TravelPackage naming form consistent with the existing repository conventions.

Do not reorganize unrelated folders.

Do not move:

- auth;
- member;
- mypage;
- community;
- article;
- layout;
- hooks;
- Apollo;
- utilities;
- shared components;

unless the migration specifically requires it.

The goal is:

```text
same structure
same hierarchy
same responsibilities
different Tripora domain
```

not:

```text
new frontend architecture
```

---

## 7. Incremental Migration Rule

The migration must be incremental.

Do not rename or delete every Property-related file at once.

Some Property code may still be used by:

- detail pages;
- My Page;
- favorites;
- visited/history;
- agent/member areas;
- admin pages;
- cards;
- home sections;
- other pages not yet migrated.

A migrated feature may use TravelPackage naming while an unmigrated dependency temporarily retains Property naming.

This temporary coexistence is acceptable.

Correctness and understandable code are more important than forcing every rename in one phase.

Before deleting an old Property file:

1. search all imports;
2. search all route usage;
3. search GraphQL operation usage;
4. check dynamic imports;
5. check My Page;
6. check member/agent pages;
7. check admin pages;
8. verify build.

Never delete old code only because a new TravelPackage version exists.

---

## 8. Backend Is the Contract

The frontend must follow the current Tripora backend GraphQL schema.

Do not invent frontend fields.

Do not preserve real-estate fields that the backend removed.

The backend TravelPackage domain is the authority for:

- DTO/input names;
- enum names;
- field names;
- sorting;
- filtering;
- pagination;
- role behavior;
- like/favorite/history mutations and queries;
- package statistics;
- Cloudinary-backed package image fields where applicable;
- AI itinerary operations.

When a mismatch exists between old Nestar frontend types and the Tripora backend, adapt the frontend minimally.

Do not change backend APIs from the frontend migration unless separately requested.

---

## 9. TravelPackage Filters — Critical Migration Rule

Filter integration is a high-risk part of this migration.

Do not redesign the filter system.

Start from the existing Nestar Property filter flow and convert only the domain-specific fields required by `TravelPackagesInquiry`.

The canonical TravelPackage marketplace filters are:

- country;
- city;
- package type;
- currency;
- price range;
- duration;
- traveller capacity/count;
- start date;
- member/agent filter where required;
- text search where supported by the backend.

Use the exact backend input shape.

Typical conceptual mapping:

```text
Property location       -> package country/city
Property type           -> package type
Property price          -> package price
bedrooms/rooms          -> remove unless directly mapped to a TravelPackage field
area/square meters      -> remove
rent/barter             -> remove
duration                -> package duration
traveller count         -> package traveller/capacity filter
available/start date    -> package start-date filter
currency                -> package currency
```

### Filter implementation rules

1. Keep filtering server-side through GraphQL.
2. Never fetch all packages and apply a second client-side filter that can disagree with backend totals.
3. Preserve the existing inquiry + router/query + pagination pattern.
4. One user filter action should produce one predictable inquiry update.
5. Reset pagination to page 1 when a filter changes.
6. Preserve filters when sorting changes.
7. Preserve filters when pagination changes.
8. Keep URL/router query state consistent with the visible filter UI when the existing architecture already supports this pattern.
9. Do not send undefined/empty filter values unnecessarily.
10. Remove a filter field from the GraphQL input when the user clears that filter.
11. Do not send invalid enum strings.
12. Numeric ranges must be validated before sending.
13. Start-date filtering must use the backend's expected date representation.
14. Currency and price must stay logically connected.
15. Do not mix frontend-only currency conversion into backend price filtering unless explicitly implemented.
16. Traveller count must map to the backend TravelPackage capacity logic, not to old Property room/bed fields.
17. Country/city filters must use the backend field names exactly.
18. Avoid duplicate state sources for the same filter.
19. Avoid adding a new filter abstraction layer unless the existing code already has one.
20. Verify the actual GraphQL request after each filter integration.

### Filter verification

For every migrated filter, verify:

```text
UI value
   ↓
component state
   ↓
router/query state if used
   ↓
TravelPackagesInquiry
   ↓
GraphQL variables
   ↓
backend result
   ↓
pagination total
```

A filter is not considered complete only because the UI changes.

The backend request and returned result must also be correct.

---

## 10. Search, Sorting, and Pagination

Preserve the existing Nestar marketplace behavior and code style where possible.

Use backend-supported sorting only.

Do not invent sorting fields that are not accepted by the backend.

Sorting may include backend-supported package fields such as:

- created date;
- package price;
- package rank;
- package views;
- package likes;

only when they exist in the schema.

Pagination must remain tied to the backend query.

When filters or sorting change:

- reset the page when required;
- keep the current inquiry internally consistent;
- avoid stale results;
- avoid mixing previous TravelPackage results with a new inquiry;
- ensure Apollo refetch/query variables reflect the current state.

---

## 11. Apollo Client Rules

Keep the existing Apollo Client architecture.

Do not introduce another data-fetching system.

Use the same style currently used by Nestar:

- `useQuery`;
- `useMutation`;
- `useReactiveVar`;
- query variables;
- `refetch`;
- cache updates where already appropriate.

For TravelPackage entities:

- keep IDs stable;
- update like/favorite state after mutations;
- keep package counters synchronized with mutation responses;
- refetch the affected query when a direct cache update would create unnecessary complexity.

Do not perform a broad Apollo cache redesign during migration.

Do not change auth links, error links, or Apollo provider architecture unless required by the Tripora backend.

---

## 12. Authentication

Preserve the existing working Nestar/Tripora authentication flow.

Do not migrate auth merely because the reference specification suggested another approach.

Keep existing:

- JWT helper usage;
- Apollo auth behavior;
- reactive user state;
- login;
- signup;
- logout;
- protected UI behavior;
- role-aware rendering;

unless the Tripora backend contract requires a minimal compatibility change.

Do not redesign production authentication in this migration.

Frontend role checks are UI checks only.

Backend authorization remains authoritative.

---

## 13. Existing Domains to Preserve

Tripora is not only TravelPackage.

Preserve existing working domains and migrate them only when required:

- Member;
- Auth;
- Community;
- BoardArticle;
- Comment;
- Follow;
- Like;
- My Page;
- Admin;
- Socket/WebSocket if still used;
- AI itinerary planner;
- image upload infrastructure.

Do not remove features simply because the original Travel Frontend Specification did not include them.

However, do not add new booking, notice, or notification functionality during this migration.

---

## 14. Features Explicitly Out of Scope

Do NOT add during this frontend migration unless explicitly requested later:

- bookings;
- payment flow;
- notices;
- notifications;
- stored user itineraries;
- a new real-time architecture;
- unrelated Redis work;
- infrastructure redesign;
- new backend modules;
- external hotel inventory;
- external flight inventory;
- live visa guarantees;
- live reservation availability.

The TravelPackage marketplace presents curated package information.

It must not imply that package content is live airline or hotel inventory unless a real integration exists.

---

## 15. Cloudinary / Images

TravelPackage images may use the backend's Cloudinary integration.

Frontend responsibilities are limited to the backend contract.

Use the existing upload flow expected by the Tripora backend.

Do not expose Cloudinary secrets.

Do not create a new frontend upload architecture if the current backend upload operation already works.

Other domains may continue using the existing `/uploads` behavior if the backend still uses it.

Do not migrate all images to Cloudinary just because TravelPackage images use Cloudinary.

---

## 16. Home Page Migration

Migrate the Nestar homepage incrementally into Tripora.

Keep the existing component structure where possible.

Real-estate sections should become travel-oriented equivalents.

Examples:

```text
Popular Properties     -> Popular Travel Packages
Top Properties         -> Top Travel Packages
Destination/Location   -> Travel Destinations
Property Agent         -> Travel Agent
Property card          -> TravelPackage card
```

Do not redesign the entire homepage architecture.

Reuse existing:

- Swiper sections;
- layout containers;
- card patterns;
- responsive structure;
- data-fetching style;

and change content, domain fields, imagery, labels, and necessary GraphQL operations.

---

## 17. TravelPackage Cards

TravelPackage cards should follow the existing Nestar card architecture unless a small design adjustment is needed.

A card may display backend-supported fields such as:

- package image;
- package title;
- country;
- city;
- package type;
- package price;
- package currency;
- duration;
- start date;
- traveller/capacity information;
- agent/member;
- package views;
- package likes;
- favorite/liked state.

Do not overload every card with all fields.

Preserve the existing card responsibilities and visual hierarchy.

Like/favorite UI must update correctly in real time after a successful mutation.

Do not leave a situation where the server mutation succeeds but the icon/state remains visually stale.

---

## 18. Package Details

The TravelPackage detail page should evolve from the existing Property detail page structure.

Preserve the existing:

- page shell;
- detail layout;
- reusable components;
- member/agent presentation;
- comments;
- likes;
- follow interactions;
- related engagement logic;

where compatible.

Replace real-estate-specific content with TravelPackage content.

TravelPackage details can include backend-supported fields such as:

- title;
- images;
- country;
- city;
- type;
- price;
- currency;
- start/end dates;
- duration;
- capacity;
- available slots;
- itinerary;
- accommodation summary;
- transport summary;
- inclusions;
- exclusions;
- agent;
- counters;
- comments.

Do not invent fields that the backend does not expose.

---

## 19. Member / My Page

Preserve the existing My Page architecture.

Migrate only the domain-specific sections.

Examples:

```text
MyProperties         -> MyTravelPackages when the role/domain requires it
MyFavorites          -> favorite TravelPackages
RecentlyVisited      -> visited TravelPackages
AddProperty          -> AddTravelPackage for AGENT flow
```

Use backend queries such as:

```text
getFavoriteTravelPackages
getVisitedTravelPackages
```

when those are the current backend contract.

Do not merge or redesign My Page navigation during this migration.

---

## 20. Agent Functionality

Tripora agents manage TravelPackages.

Preserve the existing member/agent management structure from Nestar and adapt it to TravelPackage.

An agent should only manage packages allowed by the backend.

Possible migrated actions:

- create TravelPackage;
- update owned TravelPackage;
- view own packages;
- manage package images;
- manage itinerary data;
- inspect package statistics.

Do not add a separate new dashboard architecture if the existing My Page/member structure already supports the feature.

---

## 21. Admin

Preserve the existing admin architecture.

Update Property references to TravelPackage where the admin screen is migrated.

Do not rebuild the admin system.

Admin screens should continue to use current:

- layouts;
- tables/cards;
- Apollo operations;
- pagination;
- search;
- moderation actions.

---

## 22. Community and Articles

Community/BoardArticle functionality is not part of the Property -> TravelPackage rename.

Keep it working.

Only adjust visible text or travel-specific category/content when required by Tripora.

Do not unnecessarily rename generic article/comment code.

---

## 23. AI Itinerary Planner

Tripora includes the AI itinerary feature already supported by the backend.

Frontend integration should use the current backend GraphQL operation.

The planner may collect fields such as:

- destination;
- duration;
- budget;
- currency;
- traveller count;
- interests;

according to the actual backend input.

Generated itinerary output must be clearly presented as AI-generated suggestions.

Do not present:

- live prices;
- confirmed reservations;
- guaranteed hotel availability;
- guaranteed flight availability;
- official visa/legal advice;
- safety guarantees.

Do not persist generated itineraries unless the backend later explicitly adds that feature.

Do not redesign frontend architecture for the AI planner.

---

## 24. Styling

Keep the existing MUI + SCSS styling system.

Do not migrate to Tailwind.
Do not migrate to shadcn/ui.

Tripora can receive a new visual identity while preserving the same styling architecture.

Allowed:

- update colors;
- update typography;
- update spacing;
- update images;
- update icons;
- update labels;
- adjust component styling;
- add Tripora-specific SCSS inside the existing organization;
- improve responsiveness where needed.

Not allowed:

- replacing the whole styling system;
- converting all SCSS to Tailwind;
- replacing MUI components solely for design reasons;
- creating a second parallel design system.

---

## 25. Tripora Branding

Use Tripora branding throughout migrated public UI.

Replace visible Nestar branding where appropriate.

Use the supplied Tripora logo asset unchanged unless the user explicitly requests image modification.

Do not wrap the supplied icon/logo in an unnecessary white frame or altered background.

Brand migration must not force architectural changes.

---

## 26. TypeScript and Type Safety

Keep the existing TypeScript approach.

Update types for the Tripora backend contract.

Do not perform a project-wide type-system redesign.

Remove old Property fields from a migrated type only when:

- they no longer exist in the backend; and
- the migrated component no longer needs them.

Temporary legacy Property types may remain while dependent pages are still unmigrated.

Avoid `any` when the correct existing/backend type is practical, but do not create large abstraction layers only to eliminate every `any` during this migration.

---

## 27. React State Rules

Keep state ownership simple.

Use:

- Apollo for GraphQL data;
- `useState` for local component state;
- existing reactive variables for existing global/session state;
- router/query state for filters when the existing page pattern uses it.

Do not add global state management for TravelPackage filters.

Do not keep the same filter simultaneously in multiple uncontrolled sources.

When local state and router/query both represent a filter, define a clear synchronization direction and preserve the existing Nestar approach.

---

## 28. Migration Quality Rules

Every migration change should be:

- small;
- traceable;
- easy to review;
- easy to revert;
- aligned with the old Nestar structure;
- directly related to Tripora.

Avoid giant mixed commits.

Do not combine:

- TravelPackage migration;
- auth redesign;
- styling-framework rewrite;
- folder architecture rewrite;
- dependency upgrades;
- unrelated bug fixing;

inside the same change.

Fix directly encountered bugs only when necessary for the migrated feature.

---

## 29. Validation After Every Phase

At minimum, validate:

```text
TypeScript
Next.js build
GraphQL operation parsing
imports
routes
main migrated page
pagination
sorting
filters
like/favorite behavior
responsive layout
```

For TravelPackage marketplace/filter work, manually verify the GraphQL variables for each filter.

Do not claim a filter migration is complete merely because compilation succeeds.

Verify actual behavior.

---

## 30. Forbidden Migration Behaviors

Do NOT:

- redesign architecture;
- change Pages Router to App Router;
- replace MUI;
- replace SCSS;
- add Tailwind migration;
- add shadcn migration;
- add Redux/Zustand;
- rewrite Apollo architecture;
- rewrite auth;
- move unrelated folders;
- perform repository-wide Property replacement;
- delete legacy code before checking usage;
- implement client-only TravelPackage filtering that disagrees with backend pagination;
- invent backend filters;
- invent enum values;
- add bookings;
- add notifications;
- add notices;
- add payment;
- change backend contracts;
- add unnecessary abstractions;
- rewrite working code simply to make it “cleaner”;
- change package manager or lockfile without need;
- upgrade major dependencies during migration;
- introduce another toast/UI framework without approval.

---

## 31. Preferred Migration Sequence

Use this order unless a specific task says otherwise.

### Phase 0 — Baseline verification

- confirm restored pre-migration frontend state;
- inspect existing structure;
- inspect Apollo setup;
- inspect auth;
- inspect Property domain;
- inspect current GraphQL operations;
- compare them with Tripora backend schema;
- make no architecture changes.

### Phase 1 — Core domain types and GraphQL compatibility

- add/update TravelPackage enums/types;
- add/update TravelPackage GraphQL queries/mutations;
- keep existing Apollo organization;
- avoid UI redesign;
- ensure backend contract works.

### Phase 2 — TravelPackage marketplace

- migrate `/property` marketplace behavior into `/travel-package`;
- create/migrate TravelPackage list/card components;
- integrate TravelPackagesInquiry;
- integrate filters carefully;
- sorting;
- pagination;
- liking/favorites where applicable;
- preserve old structure.

### Phase 3 — TravelPackage detail

- migrate Property detail into TravelPackage detail;
- keep existing detail structure;
- migrate engagement;
- agent/member info;
- itinerary and Tripora fields.

### Phase 4 — Home sections

- migrate Property-focused homepage sections;
- retain Swiper/component patterns;
- update visible design/content.

### Phase 5 — My Page / Agent

- favorites;
- history;
- owned packages;
- create/update TravelPackage;
- images;
- itinerary editing.

### Phase 6 — Community and remaining domain cleanup

- update remaining direct Property references only where necessary;
- keep generic modules unchanged.

### Phase 7 — AI itinerary frontend

- integrate existing backend AI itinerary operation;
- keep architecture unchanged.

### Phase 8 — Admin cleanup

- migrate Property admin references to TravelPackage;
- retain existing admin architecture.

---

## 32. Definition of Done for a Migrated Feature

A migrated frontend feature is complete only when:

- the UI uses Tripora/TravelPackage terminology;
- the backend operation uses the current Tripora schema;
- no removed Property field is still being sent;
- the feature preserves the existing frontend architecture;
- Apollo queries/mutations work;
- loading and error states still work;
- pagination still works;
- sorting still works where relevant;
- filters work against the backend where relevant;
- like/favorite state visually updates correctly;
- imports are valid;
- TypeScript passes;
- Next.js build passes;
- no unnecessary architecture/library changes were introduced;
- unmigrated pages were not accidentally broken.

---

## 33. Agent Working Rule

When asked to implement a migration phase:

1. Read this `AGENTS.md`.
2. Inspect the current files before editing.
3. Follow existing Nestar patterns first.
4. Check the current Tripora backend GraphQL contract.
5. Make the minimum necessary changes.
6. Preserve architecture and folder hierarchy.
7. Do not rename unrelated code.
8. Handle TravelPackage filters cautiously.
9. Run validation.
10. Report exactly what changed and what was deliberately left unchanged.

If there is a choice between:

```text
A. preserving an existing working Nestar pattern
```

and:

```text
B. introducing a new architecture or abstraction
```

choose **A** unless the user explicitly requests B.

---

## 34. Final Principle

Tripora frontend should feel like Tripora to the user while still feel like the original Nestar codebase to the developer.

The migration target is:

```text
Nestar frontend architecture
+
Tripora TravelPackage domain
+
Tripora visual identity
+
Tripora backend integration
```

not:

```text
new frontend architecture
```
