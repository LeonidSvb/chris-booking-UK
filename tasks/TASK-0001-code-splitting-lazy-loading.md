---
description: Implement code splitting and lazy loading for optimal bundle size
globs: "bofe_react/src/**/*.{js,jsx}"
alwaysApply: false
---

id: "TASK-0001"
title: "Implement Code Splitting and Lazy Loading"
status: "planned"
priority: "P0"
labels: ["performance", "optimization", "frontend"]
dependencies: []
created: "2025-10-28"

# 1) High-Level Objective

Reduce initial bundle size by implementing route-based code splitting and lazy loading for heavy components to achieve <200KB main bundle and <2s initial page load.

# 2) Background / Context

Current bundle includes all routes and components upfront, leading to slower initial load. Target metrics from PRD:
- Current: ~3-4s initial load
- Target: <2s initial load
- Main bundle target: <200KB
- First Contentful Paint: <1s

# 3) Assumptions & Constraints

- ASSUMPTION: React.lazy() and Suspense are sufficient for code splitting
- Constraint: Must maintain existing routing structure in src/routes/index.jsx
- Constraint: Loading states must be consistent across all lazy-loaded components
- ASSUMPTION: Vite will automatically create chunks for dynamic imports

# 4) Dependencies (Other Tasks or Artifacts)

- TASK-0004 (Loading States Optimization) - should be done in parallel
- src/routes/index.jsx (existing)
- src/pages/** (existing components)

# 5) Context Plan

**Beginning (add to model context):**

- bofe_react/src/routes/index.jsx
- bofe_react/src/App.jsx
- bofe_react/package.json _(read-only)_
- bofe_react/vite.config.js _(read-only)_

**End state (must exist after completion):**

- bofe_react/src/routes/index.jsx (modified with lazy imports)
- bofe_react/src/components/common/LoadingFallback.jsx (new)
- bofe_react/vite.config.js (modified with build optimization)

# 6) Low-Level Steps

1. **Create reusable loading fallback component**

   - File: `bofe_react/src/components/common/LoadingFallback.jsx`
   - Exported API:
     ```jsx
     export function LoadingFallback({ message = "Loading..." }) {
       return (
         <div className="flex items-center justify-center min-h-screen">
           <div className="text-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-exmoor-green mx-auto"></div>
             <p className="mt-4 text-gray-600">{message}</p>
           </div>
         </div>
       );
     }
     ```
   - Details:
     - Use Tailwind CSS for styling
     - Centered spinner with brand color (exmoor-green)
     - Optional message prop for context-specific loading text

2. **Convert all route components to lazy imports**

   - File: `bofe_react/src/routes/index.jsx`
   - Replace static imports with React.lazy():
     ```jsx
     import React, { lazy, Suspense } from 'react';
     import { LoadingFallback } from '../components/common/LoadingFallback';

     // Lazy load all page components
     const Index = lazy(() => import('../pages/Home/Index'));
     const IndexExact = lazy(() => import('../pages/Home/IndexExact'));
     const About = lazy(() => import('../pages/Home/About'));
     const Contact = lazy(() => import('../pages/Home/Contact'));
     const SearchStays = lazy(() => import('../pages/Home/SearchStays'));
     const ThingsToDo = lazy(() => import('../pages/Home/ThingsToDo'));
     const PlacesToEat = lazy(() => import('../pages/Home/PlacesToEat'));
     const VillageGuide = lazy(() => import('../pages/Home/VillageGuide'));
     const PropertyList = lazy(() => import('../pages/Properties/PropertyList'));
     const SearchResults = lazy(() => import('../pages/Properties/SearchResults'));
     const OwnerLogin = lazy(() => import('../pages/Owner/OwnerLogin'));
     ```
   - Wrap Routes with Suspense:
     ```jsx
     <Suspense fallback={<LoadingFallback message="Loading page..." />}>
       <Routes>
         {/* all routes */}
       </Routes>
     </Suspense>
     ```

3. **Lazy load heavy third-party libraries**

   - File: `bofe_react/src/components/activities/PropertyCarousel.jsx` (if exists)
   - File: `bofe_react/src/pages/Home/Index.jsx`
   - Lazy load Swiper and React Slick only when needed:
     ```jsx
     const Swiper = lazy(() => import('swiper/react').then(mod => ({ default: mod.Swiper })));
     const SwiperSlide = lazy(() => import('swiper/react').then(mod => ({ default: mod.SwiperSlide })));
     ```

4. **Optimize Vite build configuration**

   - File: `bofe_react/vite.config.js`
   - Add build optimizations:
     ```js
     export default defineConfig({
       build: {
         rollupOptions: {
           output: {
             manualChunks: {
               'vendor-react': ['react', 'react-dom', 'react-router-dom'],
               'vendor-query': ['@tanstack/react-query'],
               'vendor-ui': ['swiper', 'react-slick', 'slick-carousel'],
             },
           },
         },
         chunkSizeWarningLimit: 600,
       },
     });
     ```

5. **Verify bundle size reduction**

   - Run `npm run build` and analyze output
   - Check build/assets/ for chunk sizes
   - Ensure main bundle < 200KB
   - Verify chunks are created for each route

# 7) Types & Interfaces

```jsx
// bofe_react/src/components/common/LoadingFallback.jsx
export interface LoadingFallbackProps {
  message?: string;
}
```

# 8) Acceptance Criteria

- All route components are lazy-loaded with React.lazy()
- LoadingFallback component displays during chunk loading
- Main bundle size < 200KB after build
- Separate chunks created for each route (verify in build/assets/)
- No runtime errors when navigating between routes
- Initial page load < 2 seconds (test on 4G throttling)

# 9) Testing Strategy

- Manual testing: Navigate to all routes and verify no errors
- Performance testing: Lighthouse audit shows improved metrics
- Bundle analysis: Use `npx vite-bundle-visualizer` to verify chunks
- Load testing: Test on slow 3G connection to verify progressive loading

# 10) Notes / Links

- React.lazy() docs: https://react.dev/reference/react/lazy
- Vite code splitting: https://vitejs.dev/guide/build.html#chunking-strategy
- Related: TASK-0004 (Loading States) for consistent UX during lazy loading
