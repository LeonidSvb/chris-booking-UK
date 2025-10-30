---
description: Optimize loading states for better UX across all async operations
globs: "bofe_react/src/**/*.{js,jsx}"
alwaysApply: false
---

id: "TASK-0004"
title: "Optimize Loading States and Skeletons"
status: "planned"
priority: "P1"
labels: ["ux", "frontend", "performance"]
dependencies: ["TASK-0001"]
created: "2025-10-28"

# 1) High-Level Objective

Implement consistent, polished loading states with skeleton screens for all async operations to improve perceived performance and user experience.

# 2) Background / Context

Current loading states may be inconsistent or missing, leading to jarring user experience. Need:
- Skeleton screens for property listings
- Loading indicators for forms and mutations
- Smooth transitions between states
- Consistent loading UI across the app

Target: Perceived load time reduction by 30% through better loading UX.

# 3) Assumptions & Constraints

- ASSUMPTION: TanStack Query provides loading states via isLoading, isFetching
- Constraint: Skeleton screens must match actual content layout
- Constraint: Must work with existing Tailwind CSS styling
- ASSUMPTION: No additional animation library needed (use CSS transitions)

# 4) Dependencies (Other Tasks or Artifacts)

- TASK-0001 (Code Splitting) - LoadingFallback component created there
- src/pages/Properties/PropertyList.jsx (existing)
- src/pages/Home/Index.jsx (existing)

# 5) Context Plan

**Beginning (add to model context):**

- bofe_react/src/pages/Properties/PropertyList.jsx
- bofe_react/src/components/common/LoadingFallback.jsx
- bofe_react/package.json

**End state (must exist after completion):**

- bofe_react/src/components/common/Skeleton.jsx (new)
- bofe_react/src/components/properties/PropertyCardSkeleton.jsx (new)
- bofe_react/src/components/common/LoadingSpinner.jsx (new)
- All pages updated with appropriate loading states

# 6) Low-Level Steps

1. **Create base Skeleton component**

   - File: `bofe_react/src/components/common/Skeleton.jsx`
   - Exported API:
     ```jsx
     export function Skeleton({ className, variant = 'rectangular', animation = 'pulse' }) {
       const baseClasses = 'bg-gray-200 rounded';
       const animationClasses = {
         pulse: 'animate-pulse',
         wave: 'animate-shimmer',
       };

       const variantClasses = {
         rectangular: '',
         circular: 'rounded-full',
         text: 'h-4 rounded',
       };

       return (
         <div
           className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
         />
       );
     }

     export function SkeletonText({ lines = 3, className }) {
       return (
         <div className={className}>
           {Array.from({ length: lines }).map((_, i) => (
             <Skeleton
               key={i}
               variant="text"
               className={`mb-2 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
             />
           ))}
         </div>
       );
     }
     ```

2. **Create PropertyCardSkeleton component**

   - File: `bofe_react/src/components/properties/PropertyCardSkeleton.jsx`
   - Exported API:
     ```jsx
     import { Skeleton, SkeletonText } from '../common/Skeleton';

     export function PropertyCardSkeleton() {
       return (
         <div className="bg-white rounded-lg shadow-md overflow-hidden">
           {/* Image skeleton */}
           <Skeleton className="w-full h-48" />

           <div className="p-4">
             {/* Title skeleton */}
             <Skeleton className="h-6 w-3/4 mb-2" />

             {/* Description skeleton */}
             <SkeletonText lines={2} className="mb-4" />

             {/* Price and details */}
             <div className="flex justify-between items-center">
               <Skeleton className="h-8 w-24" />
               <Skeleton className="h-8 w-32" variant="rectangular" />
             </div>
           </div>
         </div>
       );
     }

     export function PropertyListSkeleton({ count = 6 }) {
       return (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {Array.from({ length: count }).map((_, i) => (
             <PropertyCardSkeleton key={i} />
           ))}
         </div>
       );
     }
     ```

3. **Create LoadingSpinner component**

   - File: `bofe_react/src/components/common/LoadingSpinner.jsx`
   - Exported API:
     ```jsx
     export function LoadingSpinner({ size = 'md', color = 'exmoor-green', className }) {
       const sizes = {
         sm: 'h-4 w-4',
         md: 'h-8 w-8',
         lg: 'h-12 w-12',
         xl: 'h-16 w-16',
       };

       return (
         <div className={`inline-block ${className}`}>
           <div
             className={`${sizes[size]} border-4 border-gray-200 border-t-${color} rounded-full animate-spin`}
           />
         </div>
       );
     }

     export function LoadingOverlay({ message }) {
       return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-8 text-center">
             <LoadingSpinner size="lg" className="mb-4" />
             {message && <p className="text-gray-700">{message}</p>}
           </div>
         </div>
       );
     }
     ```

4. **Update PropertyList with skeleton loading**

   - File: `bofe_react/src/pages/Properties/PropertyList.jsx`
   - Add skeleton state:
     ```jsx
     import { PropertyListSkeleton } from '../../components/properties/PropertyCardSkeleton';

     function PropertyList() {
       const { data: properties, isLoading } = useQuery({
         queryKey: ['properties'],
         queryFn: propertyService.getAll,
       });

       if (isLoading) {
         return (
           <Layout>
             <div className="container mx-auto px-4 py-8">
               <PropertyListSkeleton count={6} />
             </div>
           </Layout>
         );
       }

       return (
         <Layout>
           {/* Actual content */}
         </Layout>
       );
     }
     ```

5. **Add loading states for mutations**

   - File: `bofe_react/src/pages/Owner/OwnerLogin.jsx`
   - Add button loading state:
     ```jsx
     import { LoadingSpinner } from '../../components/common/LoadingSpinner';

     function OwnerLogin() {
       const { mutate: login, isPending } = useMutation({
         mutationFn: authService.login,
       });

       return (
         <form onSubmit={handleSubmit}>
           <button
             type="submit"
             disabled={isPending}
             className="btn-primary relative"
           >
             {isPending ? (
               <>
                 <LoadingSpinner size="sm" className="mr-2" />
                 Logging in...
               </>
             ) : (
               'Login'
             )}
           </button>
         </form>
       );
     }
     ```

6. **Add shimmer animation to Tailwind config**

   - File: `bofe_react/tailwind.config.js`
   - Add custom animation:
     ```js
     module.exports = {
       theme: {
         extend: {
           keyframes: {
             shimmer: {
               '0%': { backgroundPosition: '-1000px 0' },
               '100%': { backgroundPosition: '1000px 0' },
             },
           },
           animation: {
             shimmer: 'shimmer 2s infinite linear',
           },
         },
       },
     };
     ```

7. **Add stale data indicators**

   - File: `bofe_react/src/pages/Properties/PropertyList.jsx`
   - Show subtle indicator when refetching:
     ```jsx
     function PropertyList() {
       const { data, isLoading, isFetching } = useQuery(...);

       return (
         <Layout>
           {isFetching && !isLoading && (
             <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
               Updating...
             </div>
           )}
           {/* content */}
         </Layout>
       );
     }
     ```

8. **Add error state components**

   - File: `bofe_react/src/components/common/ErrorState.jsx`
   - Exported API:
     ```jsx
     export function ErrorState({ message, onRetry }) {
       return (
         <div className="text-center py-12">
           <div className="text-red-500 mb-4">
             <svg className="w-16 h-16 mx-auto" /* error icon */ />
           </div>
           <h3 className="text-xl font-semibold text-gray-900 mb-2">
             Something went wrong
           </h3>
           <p className="text-gray-600 mb-6">{message}</p>
           {onRetry && (
             <button
               onClick={onRetry}
               className="bg-exmoor-green text-white px-6 py-2 rounded-lg hover:bg-exmoor-dark"
             >
               Try Again
             </button>
           )}
         </div>
       );
     }

     export function EmptyState({ message, icon, action }) {
       return (
         <div className="text-center py-12">
           {icon}
           <h3 className="text-xl font-semibold text-gray-900 mb-2">
             {message}
           </h3>
           {action}
         </div>
       );
     }
     ```

# 7) Types & Interfaces

```jsx
// bofe_react/src/components/common/Skeleton.jsx
export interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  animation?: 'pulse' | 'wave';
}

// bofe_react/src/components/common/LoadingSpinner.jsx
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}
```

# 8) Acceptance Criteria

- Skeleton components created and match actual content layout
- PropertyList shows skeleton during initial load
- Forms show loading spinners on submit buttons during mutations
- Refetching shows subtle indicator without disrupting content
- All async operations have clear loading states
- Smooth transitions between loading/loaded/error states
- No layout shift when transitioning from skeleton to content
- Loading states are accessible (ARIA labels)

# 9) Testing Strategy

- Visual testing: Manually verify skeletons match actual content
- Performance testing: Measure perceived load time improvement
- Accessibility testing: Verify screen readers announce loading states
- Cross-browser testing: Ensure animations work consistently
- Slow network simulation: Test with throttled connection to verify UX

# 10) Notes / Links

- Skeleton design patterns: https://www.nngroup.com/articles/skeleton-screens/
- Tailwind animations: https://tailwindcss.com/docs/animation
- React Query loading states: https://tanstack.com/query/latest/docs/react/guides/queries#query-status
- Related: TASK-0001 for route-level loading with Suspense
