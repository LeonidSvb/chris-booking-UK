---
description: Architectural Decision Records for The Best of Exmoor
globs:
alwaysApply: false
---

# Architecture Decision Log

<!--
ADR_AGENT_PROTOCOL v1.0

You (the agent) manage this file as the single source of truth for all ADRs.

INVARIANTS
- Keep this exact file structure and headings.
- All ADR entries use H2 headings: "## ADR-XXXX — <Title>" (4-digit zero-padded ID).
- Allowed Status values: Proposed | Accepted | Superseded
- Date format: YYYY-MM-DD
- New entries must be appended to the END of the file.
- The Index table between the INDEX markers must always reflect the latest state and be sorted by ID desc (newest on top).
- Each ADR MUST contain: Date, Status, Owner, Context, Decision, Consequences.
- Each ADR must include an explicit anchor `<a id="adr-XXXX"></a>` so links remain stable.

HOW TO ADD A NEW ADR
1) Read the whole file.
2) Compute next ID:
   - Scan for headings matching: ^## ADR-(\d{4}) — .+$
   - next_id = (max captured number) + 1, left-pad to 4 digits.
3) Create a new ADR section using the "New ADR Entry Template" below.
   - Place it AFTER the last ADR section in the file.
   - Add an `<a id="adr-XXXX"></a>` line immediately below the heading.
4) Update the Index (between the INDEX markers):
   - Insert/replace the row for this ADR keeping the table sorted by ID descending.
   - Title in the Index MUST link to the anchor: [<Title>](#adr-XXXX)
   - If this ADR supersedes another: set "Supersedes" in this row, and update that older ADR:
       a) Change its Status to "Superseded"
       b) Add "Superseded by: ADR-XXXX" in its Consequences block
       c) Update the older ADR's Index row "Superseded by" column to ADR-XXXX
5) Validate before saving:
   - Exactly one heading exists for ADR-XXXX
   - All required fields are present and non-empty
   - Index contains a row for ADR-XXXX and remains properly sorted
6) Concurrency resolution:
   - If a merge conflict or duplicate ID is detected after reading: recompute next_id from the current file state, rename your heading, anchor, and Index row accordingly, and retry once.

COMMIT MESSAGE SUGGESTION
- "ADR-XXXX: <Short Title> — <Status>"

END ADR_AGENT_PROTOCOL
-->

## Index

<!-- BEGIN:ADR_INDEX -->

| ID   | Title                                                        | Date       | Status   | Supersedes | Superseded by |
| ---- | ------------------------------------------------------------ | ---------- | -------- | ---------- | ------------- |
| 0010 | [Axios for HTTP Client](#adr-0010)                           | 2025-10-28 | Accepted | —          | —             |
| 0009 | [React Router v7 for Routing](#adr-0009)                     | 2025-10-28 | Accepted | —          | —             |
| 0008 | [CakePHP 5 Backend Framework](#adr-0008)                     | 2025-10-28 | Accepted | —          | —             |
| 0007 | [Playwright for E2E Testing](#adr-0007)                      | 2025-10-28 | Accepted | —          | —             |
| 0006 | [React Context for Global State](#adr-0006)                  | 2025-10-28 | Accepted | —          | —             |
| 0005 | [Tailwind CSS for Styling](#adr-0005)                        | 2025-10-28 | Accepted | —          | —             |
| 0004 | [TanStack Query for Server State Management](#adr-0004)      | 2025-10-28 | Accepted | —          | —             |
| 0003 | [React 19 as UI Framework](#adr-0003)                        | 2025-10-28 | Accepted | —          | —             |
| 0002 | [Vite as Build Tool](#adr-0002)                              | 2025-10-28 | Accepted | —          | —             |
| 0001 | [Monorepo Architecture](#adr-0001)                           | 2025-10-28 | Accepted | —          | —             |

<!-- END:ADR_INDEX -->

---

## New ADR Entry Template (copy for each new decision)

> Replace placeholders, keep section headers. Keep prose concise.

```markdown
## ADR-XXXX — <Short, specific title>

<a id="adr-XXXX"></a>
**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Superseded
**Owner**: <Name>

### Context

<1–3 sentences: what changed or what forces drive this decision now>

### Alternatives

<Quick bullet list of alternatives considered, and why they were rejected.>

### Decision

<Single clear decision in active voice; make it testable/verifiable>

### Consequences

* **Pros**: <benefit 1>, <benefit 2>
* **Cons / risks**: <cost 1>, <risk 1>
* **Supersedes**: ADR-NNNN (if any)
* **Superseded by**: ADR-MMMM (filled later if replaced)

### Compliance / Verification

<How we'll check this is honored: tests, checks, fitness functions, runbooks>
```

---

## ADR-0001 — Monorepo Architecture

<a id="adr-0001"></a>
**Date**: 2025-10-28
**Status**: Accepted
**Owner**: Development Team

### Context

The Best of Exmoor is a property rental platform requiring both a customer-facing frontend and a backend API for property management, bookings, and payments. The decision was made to structure the codebase to support both applications while maintaining clear separation of concerns.

### Alternatives

- **Separate Repositories**: Frontend and backend in completely separate Git repos
  - **Rejected**: Increases deployment complexity, harder to maintain version sync, duplicate tooling configuration
- **Micro-frontends with Multiple Services**: Break frontend into micro-apps
  - **Rejected**: Over-engineering for current scale, adds unnecessary complexity
- **Monolithic Full-Stack Framework**: Use Next.js or similar with API routes
  - **Rejected**: Team has existing CakePHP backend expertise, harder migration path

### Decision

We will use a monorepo structure with two main applications:
- `bofe_react/` - React frontend built with Vite
- `stage_exmoor/` - CakePHP 5 backend API

Both applications live in the same repository, share documentation (CLAUDE.md), but maintain independent dependency management and build processes.

### Consequences

- **Pros**: Single source of truth, easier coordination between frontend/backend changes, shared documentation, simplified CI/CD
- **Cons / risks**: Larger repository size, need clear boundaries to prevent coupling, requires discipline to maintain separation
- **Supersedes**: —
- **Superseded by**: —

### Compliance / Verification

- Each application has its own package.json/composer.json
- No cross-directory imports between bofe_react and stage_exmoor
- Separate build and deployment processes documented in CLAUDE.md

---

## ADR-0002 — Vite as Build Tool

<a id="adr-0002"></a>
**Date**: 2025-10-28
**Status**: Accepted
**Owner**: Development Team

### Context

The frontend application was migrated from Create React App (CRA) to a modern build tool. CRA is no longer actively maintained and has slower build times, while modern alternatives offer better performance and developer experience.

### Alternatives

- **Keep Create React App**: Stay with existing CRA setup
  - **Rejected**: No longer maintained, slow HMR, bloated config
- **Webpack 5 Custom Setup**: Build custom Webpack configuration
  - **Rejected**: Complex configuration, slower than Vite, more maintenance burden
- **Parcel**: Zero-config bundler
  - **Rejected**: Less mature ecosystem, fewer plugins than Vite
- **Turbopack/Next.js**: Use Next.js framework
  - **Rejected**: Don't need SSR, backend already exists in CakePHP

### Decision

We will use Vite 6.x as the build tool for the React frontend. Configuration stored in `vite.config.js` with React plugin, dev server on port 3000, and build output to `build/` directory for deployment.

### Consequences

- **Pros**: Extremely fast HMR (<100ms), native ES modules, smaller bundle sizes, better tree-shaking, simple configuration
- **Cons / risks**: Newer tool (less mature than Webpack), some legacy plugins may not be compatible, team needs to learn Vite-specific patterns
- **Supersedes**: —
- **Superseded by**: —

### Compliance / Verification

- `package.json` scripts use Vite commands: `vite`, `vite build`, `vite preview`
- Dev server starts in <2 seconds
- HMR updates in <200ms
- Production builds complete in <30 seconds

---

## ADR-0003 — React 19 as UI Framework

<a id="adr-0003"></a>
**Date**: 2025-10-28
**Status**: Accepted
**Owner**: Development Team

### Context

The frontend requires a modern, component-based UI framework that can handle complex state management, routing, and form handling for a property rental booking platform. React 19 offers the latest features and performance improvements.

### Alternatives

- **Vue 3**: Component-based framework with Composition API
  - **Rejected**: Team has stronger React expertise, smaller ecosystem for React Query equivalent
- **Svelte**: Compile-time framework with minimal runtime
  - **Rejected**: Smaller ecosystem, less third-party library support, team unfamiliar
- **Angular**: Full-featured framework
  - **Rejected**: Too opinionated, steeper learning curve, heavier bundle size
- **React 18**: Previous stable version
  - **Rejected**: Missing React 19 improvements (automatic batching, transitions, Suspense improvements)

### Decision

We will use React 19.1.1 as the UI framework for the frontend. All components will be functional components using hooks (no class components). Project uses modern React patterns including Context API, hooks, and Suspense.

### Consequences

- **Pros**: Massive ecosystem, excellent TypeScript support, React Query integration, team expertise, latest performance improvements
- **Cons / risks**: React 19 is relatively new, potential for breaking changes, larger bundle size than lighter frameworks, requires proper optimization (memo, lazy loading)
- **Supersedes**: —
- **Superseded by**: —

### Compliance / Verification

- package.json specifies `react@^19.1.1` and `react-dom@^19.1.1`
- No class components allowed (ESLint rule can enforce)
- All new components use functional components with hooks
- Code reviews check for proper React patterns

---

## ADR-0004 — TanStack Query for Server State Management

<a id="adr-0004"></a>
**Date**: 2025-10-28
**Status**: Accepted
**Owner**: Development Team

### Context

The application requires efficient data fetching, caching, and synchronization with the backend API for properties, bookings, and user data. Traditional useState/useEffect patterns lead to boilerplate code, race conditions, and poor caching strategies.

### Alternatives

- **Redux Toolkit Query (RTK Query)**: Redux-based data fetching
  - **Rejected**: Requires Redux setup, more boilerplate, team prefers lighter solution
- **SWR**: Lightweight data fetching library by Vercel
  - **Rejected**: Less feature-rich than React Query, smaller ecosystem
- **Apollo Client**: GraphQL client with caching
  - **Rejected**: Backend uses REST not GraphQL, unnecessary complexity
- **Manual fetch/axios with useState**: Traditional approach
  - **Rejected**: Too much boilerplate, no automatic caching, manual error/loading state management

### Decision

We will use TanStack Query (React Query) v5.90.2 for all server state management. Default staleTime of 5 minutes, automatic refetching on window focus, retry logic, and optimistic updates for mutations. API calls wrapped in service layer (propertyService.js, bookingService.js, etc).

### Consequences

- **Pros**: Automatic caching and invalidation, background refetching, optimistic updates, devtools for debugging, reduces boilerplate by 60-70%, handles loading/error states automatically
- **Cons / risks**: Learning curve for advanced features, cache invalidation complexity, devtools bundle size in development
- **Supersedes**: —
- **Superseded by**: —

### Compliance / Verification

- All API calls use React Query hooks (useQuery, useMutation)
- Service layer functions return promises, not direct API calls
- staleTime configured to 5 minutes minimum for static data
- React Query DevTools enabled in development mode

---

## ADR-0005 — Tailwind CSS for Styling

<a id="adr-0005"></a>
**Date**: 2025-10-28
**Status**: Accepted
**Owner**: Development Team

### Context

The application requires a responsive, customizable styling solution that matches the Exmoor brand (custom colors, fonts) and allows rapid UI development without writing extensive custom CSS.

### Alternatives

- **CSS Modules**: Scoped CSS with PostCSS
  - **Rejected**: More boilerplate, slower development, manual responsive design
- **Styled Components**: CSS-in-JS library
  - **Rejected**: Runtime overhead, larger bundle size, team prefers utility-first approach
- **Material-UI / Ant Design**: Component library with built-in styles
  - **Rejected**: Too opinionated, hard to customize to match Exmoor brand, heavier bundle
- **Plain CSS/SCSS**: Traditional stylesheets
  - **Rejected**: No utility classes, harder to maintain consistency, more code duplication

### Decision

We will use Tailwind CSS 3.4.17 as the primary styling framework. Custom theme defined in `tailwind.config.js` with Exmoor brand colors (exmoor-green: #84A286, exmoor-red: #FF5359, exmoor-dark: #2c3e50) and custom fonts (IM Fell English SC, Poppins, Quattrocento). Bootstrap 5 used minimally for specific legacy components.

### Consequences

- **Pros**: Rapid development with utility classes, small production bundle (tree-shaken), responsive design utilities, easy theme customization, no naming conflicts
- **Cons / risks**: HTML can become verbose with many classes, team needs to learn utility-first paradigm, potential Bootstrap/Tailwind conflicts
- **Supersedes**: —
- **Superseded by**: —

### Compliance / Verification

- tailwind.config.js contains custom theme with Exmoor brand colors
- All new components use Tailwind utilities first, custom CSS only when necessary
- Production CSS bundle < 50KB gzipped
- PurgeCSS configured to remove unused styles in production

---

## ADR-0006 — React Context for Global State

<a id="adr-0006"></a>
**Date**: 2025-10-28
**Status**: Accepted
**Owner**: Development Team

### Context

The application requires shared state across components for authentication status, booking flow data, device detection, and API configuration. This state needs to be accessible throughout the component tree without prop drilling.

### Alternatives

- **Redux Toolkit**: Full-featured state management
  - **Rejected**: Over-engineering for current needs, too much boilerplate, learning curve
- **Zustand**: Lightweight state management
  - **Rejected**: Another dependency, React Context sufficient for current scale
- **Recoil**: Atomic state management by Facebook
  - **Rejected**: Experimental API, smaller community, unnecessary complexity
- **Prop Drilling**: Pass props through component tree
  - **Rejected**: Becomes unmaintainable with deep nesting, verbose

### Decision

We will use React Context API for global state management with separate contexts for different concerns:
- `AuthContext.jsx` - User authentication state (user, login, logout)
- `BookingContext.jsx` - Booking flow state (dates, guests, selected property)
- `ApiContext.jsx` - API wrapper functions
- `DeviceContext.jsx` - Device detection (mobile/desktop)

Each context provides a custom hook (useAuth, useBooking, etc) for consuming components.

### Consequences

- **Pros**: No additional dependencies, built into React, simple API, sufficient for app scale, easy to test
- **Cons / risks**: Can cause unnecessary re-renders if not optimized, not suitable for very frequent updates, performance issues with large state trees (mitigated by splitting contexts)
- **Supersedes**: —
- **Superseded by**: —

### Compliance / Verification

- Each context file exports a Provider and custom hook
- Contexts split by domain (auth, booking, api, device) not one global context
- Use React.memo() for components consuming context to prevent unnecessary renders
- Context values use useMemo() to prevent reference changes

---

## ADR-0007 — Playwright for E2E Testing

<a id="adr-0007"></a>
**Date**: 2025-10-28
**Status**: Accepted
**Owner**: Development Team

### Context

The application requires end-to-end testing to verify critical user flows (property search, booking, payment) work correctly across different browsers. Tests need to be reliable, fast, and easy to debug.

### Alternatives

- **Cypress**: Popular E2E testing framework
  - **Rejected**: Runs inside browser (not true E2E), slower for multi-browser testing, network stubbing limitations
- **Selenium WebDriver**: Classic E2E framework
  - **Rejected**: More setup, slower execution, less developer-friendly API
- **Puppeteer**: Chrome DevTools Protocol automation
  - **Rejected**: Chrome-only (need multi-browser), lower-level API
- **TestCafe**: All-in-one E2E solution
  - **Rejected**: Smaller ecosystem than Playwright, slower development

### Decision

We will use Playwright for E2E testing with tests in `bofe_react/tests/` directory. Tests run on Chromium, Firefox, and WebKit with single worker (fullyParallel: false) to avoid race conditions. HTML reports generated in `test-results/` directory.

Test files:
- `property-comparison.spec.js` - Property listing validation
- `data-validation.spec.js` - Form and data validation

### Consequences

- **Pros**: True multi-browser testing, fast execution, excellent debugging (trace viewer), auto-wait for elements, built-in screenshots/videos, parallel execution support
- **Cons / risks**: Larger browser binaries (~1GB), tests can be flaky if not written carefully, requires app to be running
- **Supersedes**: —
- **Superseded by**: —

### Compliance / Verification

- Tests must pass on all three browsers before merging
- Test coverage for critical paths: property search, property detail, booking form
- Tests run in CI pipeline on every PR
- playwright.config.js configured with proper timeouts and retries

---

## ADR-0008 — CakePHP 5 Backend Framework

<a id="adr-0008"></a>
**Date**: 2025-10-28
**Status**: Accepted
**Owner**: Development Team

### Context

The backend API requires a robust, mature PHP framework to handle property data management, booking logic, payment processing, and database operations. The team has existing CakePHP expertise and PHP infrastructure.

### Alternatives

- **Laravel 10**: Modern PHP framework
  - **Rejected**: Team has CakePHP expertise, migration effort too high, existing codebase investment
- **Symfony 6**: Enterprise PHP framework
  - **Rejected**: More complex, steeper learning curve, heavier than needed
- **Slim Framework**: Micro-framework
  - **Rejected**: Too minimal, would need to build too much from scratch (ORM, auth, migrations)
- **Node.js/Express**: JavaScript backend
  - **Rejected**: Team PHP-focused, existing database schema, migration effort

### Decision

We will use CakePHP 5.1 as the backend framework with PHP 8.1+ and PSR-4 autoloading. Key components:
- `PropertiesController.php` - Property listing/search/booking API
- `HomeController.php` - Homepage content API
- Standard CakePHP structure in `src/Model/Table/` for database entities
- Composer scripts for testing (PHPUnit), code style (PHP CodeSniffer), static analysis (PHPStan)

### Consequences

- **Pros**: Team expertise, mature ecosystem, built-in ORM, migration system, conventions reduce decisions, strong security features (CSRF, SQL injection protection)
- **Cons / risks**: Smaller community than Laravel, conventions can be restrictive, framework overhead for simple APIs
- **Supersedes**: —
- **Superseded by**: —

### Compliance / Verification

- All controllers extend CakePHP AppController
- Use CakePHP ORM exclusively (no raw SQL)
- composer check passes (tests + code style)
- PHPStan level 6 minimum
- API endpoints follow RESTful conventions

---

## ADR-0009 — React Router v7 for Routing

<a id="adr-0009"></a>
**Date**: 2025-10-28
**Status**: Accepted
**Owner**: Development Team

### Context

The frontend requires client-side routing for multiple pages (home, property listings, property detail, booking, payment, owner portal) with dynamic route parameters (slugs, IDs) and protected routes for authenticated users.

### Alternatives

- **React Router v6**: Previous version
  - **Rejected**: v7 available with better TypeScript support and data loading patterns
- **TanStack Router**: Type-safe routing
  - **Rejected**: Too new, smaller ecosystem, overkill for current needs
- **Next.js App Router**: File-based routing
  - **Rejected**: Already committed to separate backend, don't need SSR
- **Reach Router**: Lightweight alternative
  - **Rejected**: Merged into React Router, no longer maintained separately

### Decision

We will use React Router v7.1.3 for client-side routing with route definitions in `src/routes/index.jsx`. All routes wrapped in `<Layout>` component (Header + Footer).

Route structure:
- `/` - Homepage
- `/:placesSlug/:propertySlug` - Property detail (dynamic)
- `/booking/:propertySlug` - Booking form
- `/payment/:bookingId/:userEmail` - Payment page
- `/owner/*` - Owner portal (protected)

### Consequences

- **Pros**: Industry standard, excellent documentation, nested routes, lazy loading support, TypeScript support, data loading patterns
- **Cons / risks**: v7 relatively new, API changes from v6, can be complex for advanced use cases
- **Supersedes**: —
- **Superseded by**: —

### Compliance / Verification

- All routes defined in single src/routes/index.jsx file
- Use React.lazy() for code splitting on route level
- Protected routes check authentication via useAuth() hook
- Route params validated before use

---

## ADR-0010 — Axios for HTTP Client

<a id="adr-0010"></a>
**Date**: 2025-10-28
**Status**: Accepted
**Owner**: Development Team

### Context

The frontend needs a reliable HTTP client to communicate with the CakePHP backend API for property data, bookings, payments, and user authentication. The client must support request/response interceptors for auth tokens and error handling.

### Alternatives

- **fetch API**: Native browser API
  - **Rejected**: No request/response interceptors, manual timeout handling, less convenient error handling
- **ky**: Modern fetch wrapper
  - **Rejected**: Smaller ecosystem, less familiar to team, fewer Stack Overflow solutions
- **superagent**: HTTP client library
  - **Rejected**: Older API style, less actively maintained than Axios
- **SWR/React Query native fetch**: Use library's built-in fetching
  - **Rejected**: Still need abstraction layer for auth tokens and error handling

### Decision

We will use Axios 1.12.2 as the HTTP client with base configuration in `src/services/api.js`. Axios instance configured with:
- Base URL from `VITE_API_URL` environment variable (default: http://localhost:3001/api/v1)
- Request interceptor to inject auth tokens from localStorage
- Response interceptor for 401 handling (automatic logout)
- Timeout: 10 seconds

Service layer wraps Axios calls:
- `propertyService.js` - Property API calls
- `bookingService.js` - Booking API calls
- `paymentService.js` - Payment API calls
- `userService.js` - Auth API calls

### Consequences

- **Pros**: Request/response interceptors, automatic JSON transformation, timeout support, cancel requests, progress tracking, wide browser support, excellent error handling
- **Cons / risks**: Larger bundle size than fetch (~13KB), another dependency, potential for interceptor bugs
- **Supersedes**: —
- **Superseded by**: —

### Compliance / Verification

- Single Axios instance exported from src/services/api.js
- All API calls go through service layer (never direct Axios calls in components)
- Auth token interceptor adds Authorization header
- 401 responses trigger logout and redirect to login
- Error responses transformed to consistent format

---

<!-- ADD MORE ADR ENTRIES HERE FOLLOWING THE SAME TEMPLATE PATTERN -->
