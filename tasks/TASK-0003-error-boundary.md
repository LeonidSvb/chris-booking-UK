---
description: Implement error boundaries for graceful error handling
globs: "bofe_react/src/**/*.{js,jsx}"
alwaysApply: false
---

id: "TASK-0003"
title: "Implement Error Boundary Components"
status: "planned"
priority: "P1"
labels: ["error-handling", "frontend", "ux"]
dependencies: []
created: "2025-10-28"

# 1) High-Level Objective

Add React Error Boundaries to catch and handle runtime errors gracefully, preventing full app crashes and providing user-friendly error messages.

# 2) Background / Context

Currently, any runtime error causes the entire app to crash with a blank screen. Error boundaries will:
- Catch errors in component tree
- Display fallback UI instead of crashing
- Log errors for debugging
- Allow partial app recovery

# 3) Assumptions & Constraints

- ASSUMPTION: react-error-boundary library provides best practices
- Constraint: Error boundaries only catch errors in render/lifecycle, not in event handlers or async code
- Constraint: Must integrate with existing logging (console for now, future: Sentry)
- ASSUMPTION: Different error boundaries for different app sections (routes, queries, forms)

# 4) Dependencies (Other Tasks or Artifacts)

- src/App.jsx (existing)
- src/routes/index.jsx (existing)

# 5) Context Plan

**Beginning (add to model context):**

- bofe_react/src/App.jsx
- bofe_react/src/routes/index.jsx
- bofe_react/package.json

**End state (must exist after completion):**

- bofe_react/src/components/errors/ErrorBoundary.jsx (new)
- bofe_react/src/components/errors/RouteErrorBoundary.jsx (new)
- bofe_react/src/components/errors/ErrorFallback.jsx (new)
- bofe_react/src/utils/errorLogger.js (new)

# 6) Low-Level Steps

1. **Install react-error-boundary**

   - Run: `npm install react-error-boundary`
   - Update package.json

2. **Create error fallback UI component**

   - File: `bofe_react/src/components/errors/ErrorFallback.jsx`
   - Exported API:
     ```jsx
     export function ErrorFallback({ error, resetErrorBoundary }) {
       return (
         <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
           <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
             <div className="text-red-500 mb-4">
               <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
             </div>
             <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
             <p className="text-gray-600 mb-6">
               We're sorry for the inconvenience. An error occurred while loading this page.
             </p>
             {process.env.NODE_ENV === 'development' && (
               <pre className="text-left bg-gray-100 p-4 rounded text-sm overflow-auto mb-4">
                 {error.message}
               </pre>
             )}
             <div className="flex flex-col gap-3">
               <button
                 onClick={resetErrorBoundary}
                 className="w-full bg-exmoor-green text-white px-6 py-3 rounded-lg hover:bg-exmoor-dark transition-colors"
               >
                 Try Again
               </button>
               <a
                 href="/"
                 className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors inline-block"
               >
                 Go to Homepage
               </a>
             </div>
           </div>
         </div>
       );
     }
     ```

3. **Create route-specific error boundary**

   - File: `bofe_react/src/components/errors/RouteErrorBoundary.jsx`
   - Exported API:
     ```jsx
     import { ErrorBoundary } from 'react-error-boundary';
     import { ErrorFallback } from './ErrorFallback';
     import { logError } from '../../utils/errorLogger';

     export function RouteErrorBoundary({ children }) {
       const handleError = (error, errorInfo) => {
         logError(error, {
           componentStack: errorInfo.componentStack,
           type: 'route-error',
         });
       };

       return (
         <ErrorBoundary
           FallbackComponent={ErrorFallback}
           onError={handleError}
           onReset={() => window.location.reload()}
         >
           {children}
         </ErrorBoundary>
       );
     }
     ```

4. **Create main app error boundary**

   - File: `bofe_react/src/components/errors/ErrorBoundary.jsx`
   - Exported API:
     ```jsx
     import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
     import { logError } from '../../utils/errorLogger';

     export function AppErrorBoundary({ children }) {
       const handleError = (error, errorInfo) => {
         logError(error, {
           componentStack: errorInfo.componentStack,
           type: 'app-error',
           critical: true,
         });
       };

       const ErrorFallback = ({ error, resetErrorBoundary }) => (
         <div className="min-h-screen flex items-center justify-center bg-gray-50">
           <div className="text-center">
             <h1 className="text-4xl font-bold text-gray-900 mb-4">
               Application Error
             </h1>
             <p className="text-gray-600 mb-6">
               The application encountered an unexpected error.
             </p>
             <button
               onClick={() => window.location.href = '/'}
               className="bg-exmoor-green text-white px-8 py-3 rounded-lg"
             >
               Reload Application
             </button>
           </div>
         </div>
       );

       return (
         <ReactErrorBoundary
           FallbackComponent={ErrorFallback}
           onError={handleError}
         >
           {children}
         </ReactErrorBoundary>
       );
     }
     ```

5. **Create error logger utility**

   - File: `bofe_react/src/utils/errorLogger.js`
   - Exported API:
     ```js
     export function logError(error, context = {}) {
       const errorLog = {
         message: error.message,
         stack: error.stack,
         timestamp: new Date().toISOString(),
         userAgent: navigator.userAgent,
         url: window.location.href,
         ...context,
       };

       // Log to console in development
       if (process.env.NODE_ENV === 'development') {
         console.error('Error Log:', errorLog);
       }

       // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
       // Example: sendToSentry(errorLog);

       return errorLog;
     }

     export function logWarning(message, context = {}) {
       const warningLog = {
         message,
         timestamp: new Date().toISOString(),
         type: 'warning',
         ...context,
       };

       console.warn('Warning:', warningLog);
       return warningLog;
     }
     ```

6. **Wrap App with AppErrorBoundary**

   - File: `bofe_react/src/App.jsx`
   - Add top-level error boundary:
     ```jsx
     import { AppErrorBoundary } from './components/errors/ErrorBoundary';

     function App() {
       return (
         <AppErrorBoundary>
           <HelmetProvider>
             <QueryClientProvider client={queryClient}>
               {/* existing providers */}
             </QueryClientProvider>
           </HelmetProvider>
         </AppErrorBoundary>
       );
     }
     ```

7. **Wrap routes with RouteErrorBoundary**

   - File: `bofe_react/src/routes/index.jsx`
   - Wrap each route:
     ```jsx
     import { RouteErrorBoundary } from '../components/errors/RouteErrorBoundary';

     const AppRoutes = () => {
       return (
         <Routes>
           <Route path="/" element={
             <Layout>
               <RouteErrorBoundary>
                 <IndexExact />
               </RouteErrorBoundary>
             </Layout>
           } />
           {/* Repeat for all routes */}
         </Routes>
       );
     };
     ```

8. **Add error boundary for React Query**

   - File: `bofe_react/src/App.jsx`
   - Configure QueryClient with error handling:
     ```jsx
     const queryClient = new QueryClient({
       defaultOptions: {
         queries: {
           useErrorBoundary: true, // Throw errors to nearest error boundary
           retry: 1,
           staleTime: 5 * 60 * 1000,
         },
       },
     });
     ```

# 7) Types & Interfaces

```jsx
// bofe_react/src/components/errors/ErrorFallback.jsx
export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// bofe_react/src/utils/errorLogger.js
export interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  componentStack?: string;
  type?: string;
  critical?: boolean;
}
```

# 8) Acceptance Criteria

- AppErrorBoundary wraps entire App in src/App.jsx
- RouteErrorBoundary wraps each route in src/routes/index.jsx
- ErrorFallback component displays user-friendly error message
- Error details shown only in development mode
- Errors are logged with context (timestamp, URL, stack trace)
- "Try Again" button successfully resets error boundary
- React Query errors are caught by error boundaries
- No console errors during normal app usage

# 9) Testing Strategy

- Manual testing: Throw test errors in components to verify boundaries catch them
- Test error recovery: Click "Try Again" and verify app recovers
- Test React Query errors: Simulate API failures and verify error UI
- Test production mode: Verify error details are hidden in production
- Cross-browser testing: Test error boundaries in Chrome, Firefox, Safari

# 10) Notes / Links

- react-error-boundary: https://github.com/bvaughn/react-error-boundary
- React Error Boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- Future: Integrate with Sentry for production error tracking
- Related: Consider adding TASK-0008 for comprehensive logging system
