# Changelog

**RULES: Follow [Keep a Changelog](https://keepachangelog.com/) standard strictly. Only 6 categories: Added/Changed/Deprecated/Removed/Fixed/Security. Be concise, technical, no fluff.**

**[Unreleased] Section:** Always maintain "Next Session Plan" with 3-5 priority tasks. Link to active sprint in docs/sprints/ for detailed implementation. Update after each session.

## [Unreleased]

### Next Session Plan
**Sprint:** Initial Documentation & Architecture

**Priority Tasks:**
1. Complete improved CLAUDE.md with security guidelines and API documentation
2. Document database schema in ADR
3. Add payment integration details to documentation
4. Set up CI/CD pipeline documentation

**Goal:** Establish comprehensive project documentation for onboarding and development

**Completed This Session:**
- Created ADR.md with 10 architectural decisions
- Created CHANGELOG.md for project tracking
- Analyzed existing CLAUDE.md for improvements

**Known Issues (WIP):**
- CLAUDE.md missing security guidelines
- API endpoints not fully documented
- No deployment instructions yet

---

## [0.1.0] - 2025-10-28 - Current State Documentation

### Added
- Architecture Decision Records (ADR.md) documenting all major technical decisions
- CHANGELOG.md for tracking project changes
- Monorepo structure with `bofe_react/` and `stage_exmoor/` applications
- React 19 frontend with Vite build tool
- CakePHP 5 backend API
- TanStack Query for server state management with 5-minute caching
- React Router v7 for client-side routing
- Tailwind CSS with custom Exmoor theme (colors: exmoor-green, exmoor-red, exmoor-dark)
- Custom fonts: IM Fell English SC, Poppins, Quattrocento
- React Context providers for auth, booking, API, and device detection
- Playwright E2E testing framework for Chromium, Firefox, WebKit
- Axios HTTP client with request/response interceptors
- Property search and listing functionality
- Property detail pages with dynamic routing
- Booking flow with multi-step forms
- Payment processing integration
- Owner portal for property management
- Google Maps integration for property locations
- Service layer architecture (propertyService, bookingService, paymentService, userService)
- Utility functions for date handling, price calculation, and validation
- Image processing with fallback handling for property photos

### Changed
- Migrated from Create React App to Vite for faster builds and HMR
- Dev server port from 3000 to 3001 (Vite auto-adjusted due to port conflict)

### Security
- Axios interceptors for automatic auth token injection
- 401 response handling with automatic logout
- CSRF protection via CakePHP framework
- SQL injection prevention using CakePHP ORM

---

## Historical Context

This CHANGELOG begins at version 0.1.0, representing the current state of the project as of 2025-10-28. Previous development history before this date is documented in:
- `ADR.md` - Architectural decisions and rationale
- `CLAUDE.md` - Project structure and development workflows
- Migration documentation files (if present in bofe_react/)

For future changes, all updates must be logged here following Keep a Changelog format.
