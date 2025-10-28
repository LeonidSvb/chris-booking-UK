# Best of Exmoor - Product Requirements Document

A modern property rental booking platform for Exmoor vacation properties, migrated from legacy PHP to React with improved performance, user experience, and maintainability.

---

## Users & Value

- **Primary user / persona:** Vacation travelers and property owners in the Exmoor region (25-65 years old, seeking quality accommodations and property management)
- **Jobs-to-be-done (JTBD):**
  - When I search for vacation properties, I want to quickly find available accommodations with clear pricing and photos, so I can book my stay efficiently.
  - When I manage my rental property, I want to easily update availability and pricing, so I can maximize bookings without manual overhead.

---

## Success Metrics

- **Primary Goal:** Reduce page load time by 50% and improve booking conversion rate by 30% through modern React architecture
- **Success Criteria:** Property search results load in <2 seconds, booking flow completion rate >75%

---

## Scope

| Must-have (MVP) | Nice-to-have (Later) | Explicitly Out (Not now) |
| --------------- | -------------------- | ------------------------ |
| Property search and listing | Advanced filtering (price range, amenities) | Multi-language support |
| Property detail pages with photos | Virtual tours / 360° images | Mobile native apps |
| Multi-step booking flow | Instant booking confirmation | Social login (Google, Facebook) |
| Payment processing integration | Email notifications for bookings | Review and rating system |
| Owner portal for property management | Analytics dashboard for owners | Property comparison tool |
| Google Maps integration | Calendar sync (Airbnb, VRBO) | Chat support system |

- **Definition of Done (MVP):**
  - [ ] Users can search properties by location, dates, and guest count
  - [ ] Property detail pages display all info (photos, pricing, amenities, location)
  - [ ] Booking flow completes successfully with payment processing
  - [ ] Owners can login and manage their property listings
  - [ ] Page load times <2 seconds on 4G connection
  - [ ] All E2E tests pass on Chromium, Firefox, WebKit

---

## Tech Stack

### Frontend:

- React 19 with JavaScript (functional components + hooks)
- Vite 6 for build tool and development server
- Tailwind CSS for styling with custom Exmoor theme
- TanStack Query (React Query v5) for server state management

### Backend:

- CakePHP 5 API for property management and booking logic
- Axios 1.12.2 for HTTP client with auth interceptors
- Google Maps API for property location mapping
- Payment gateway API for booking transactions

### Database:

- MySQL/PostgreSQL for property data and booking records
- Redis cache for frequently accessed property listings (5-minute staleTime)

---

## Architecture

### Monorepo Structure:
- `bofe_react/` - React frontend (this application)
- `stage_exmoor/` - CakePHP 5 backend API
- `docs/` - Shared documentation (ADR, CHANGELOG)
- `scripts/` - Deployment and utility scripts

### Frontend Architecture:

**Core Libraries:**
- React Router v7 for client-side routing
- React Context API for global state (auth, booking, device detection)
- React Hook Form for form validation
- date-fns for date calculations
- Swiper + React Slick for image carousels

**Key Directories:**
- `src/pages/` - Route components (Home, Properties, Owner)
- `src/components/` - Reusable UI components
- `src/services/` - API service layer (propertyService, bookingService)
- `src/hooks/` - Custom React hooks
- `src/context/` - Context providers
- `src/utils/` - Helper functions

**State Management:**
- **Server State:** TanStack Query handles all API data fetching, caching, and synchronization
- **Client State:** React Context for auth, booking flow, device detection
- **Form State:** React Hook Form for booking and owner forms

### API Integration:

**Base URL:** `VITE_API_URL` (default: http://localhost:3001/api/v1)

**Key Endpoints:**
- `GET /properties` - List all properties
- `GET /properties/:slug` - Property details
- `POST /bookings` - Create booking
- `POST /payments` - Process payment
- `POST /auth/login` - Owner login
- `GET /owner/properties` - Owner's properties

**Authentication:**
- JWT tokens stored in localStorage
- Axios interceptors inject auth headers
- 401 responses trigger automatic logout

### Testing:

**E2E Testing:** Playwright
- Tests run on Chromium, Firefox, WebKit
- Coverage: property search, property detail, booking flow
- Reports generated in `test-results/`

**Unit Testing:** (To be implemented)
- Jest + React Testing Library
- Coverage target: 70% for critical components

---

## Migration Status

### Completed:
- [x] Migrated from Create React App to Vite
- [x] React 19 upgrade
- [x] Tailwind CSS integration with custom theme
- [x] TanStack Query integration
- [x] React Router v7 setup
- [x] Axios HTTP client with interceptors
- [x] Property listing and search pages
- [x] Property detail pages
- [x] Booking flow
- [x] Payment processing
- [x] Owner portal
- [x] Google Maps integration
- [x] Playwright E2E testing setup

### In Progress:
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] SEO improvements (meta tags, Open Graph)
- [ ] Error boundary implementation
- [ ] Loading states optimization

### Future Enhancements:
- [ ] Advanced property filtering
- [ ] Email notifications
- [ ] Owner analytics dashboard
- [ ] Calendar integration with external platforms
- [ ] Review and rating system
- [ ] Mobile app (React Native)

---

## Performance Goals

### Current Baseline:
- Initial page load: ~3-4 seconds
- Property search: ~2-3 seconds
- HMR (dev): <100ms

### Target Metrics:
- Initial page load: <2 seconds
- Property search: <1.5 seconds
- Time to Interactive (TTI): <3 seconds
- First Contentful Paint (FCP): <1 second
- Lighthouse score: 90+ (Performance)

### Optimization Strategies:
- Code splitting with React.lazy() on route level
- Image optimization (lazy loading, WebP format)
- TanStack Query caching (5-minute staleTime for static data)
- Tailwind CSS tree-shaking (production bundle <50KB)
- Bundle size monitoring (main bundle <200KB)

---

## Security Requirements

- CSRF protection via CakePHP framework
- SQL injection prevention using CakePHP ORM
- XSS protection (input sanitization)
- JWT token authentication
- Secure payment processing (PCI compliance)
- HTTPS required in production
- Environment variables for sensitive config

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

---

## Deployment

### Development:
```bash
cd bofe_react
npm install
npm run dev  # Vite dev server on port 3000
```

### Production:
```bash
npm run build  # Output to build/ directory
npm run preview  # Preview production build
```

### Environment Variables:
- `VITE_API_URL` - Backend API base URL
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `VITE_PAYMENT_GATEWAY_KEY` - Payment gateway API key

---

## Dependencies

### Production Dependencies:
- react@^19.1.1
- react-dom@^19.1.1
- react-router-dom@^7.1.3
- @tanstack/react-query@^5.90.2
- axios@^1.12.2
- react-hook-form@^7.64.0
- date-fns@^4.1.0
- swiper@^11.1.15
- react-slick@^0.31.0

### Dev Dependencies:
- vite@^6.0.7
- @vitejs/plugin-react@^4.3.4
- tailwindcss@^3.4.17
- autoprefixer@^10.4.20
- postcss@^8.4.49

---

## Documentation References

- [ADR.md](./ADR.md) - All architectural decisions and rationale
- [CHANGELOG.md](./CHANGELOG.md) - Project change history
- [GOOGLE_MAPS_SETUP.md](../bofe_react/GOOGLE_MAPS_SETUP.md) - Google Maps integration guide
- [README.md](../bofe_react/README.md) - Project setup and development guide

---

## Contact & Ownership

**Project Owner:** Chris (Best of Exmoor)
**Development Team:** External development team
**Repository:** Monorepo structure with frontend and backend
**Version:** 0.1.0 (Initial documentation release)
