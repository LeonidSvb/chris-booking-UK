---
description: Add SEO meta tags for all pages with Open Graph and Twitter Cards
globs: "bofe_react/src/**/*.{js,jsx}"
alwaysApply: false
---

id: "TASK-0002"
title: "Implement SEO Meta Tags and Open Graph"
status: "planned"
priority: "P1"
labels: ["seo", "frontend", "marketing"]
dependencies: []
created: "2025-10-28"

# 1) High-Level Objective

Add comprehensive SEO meta tags, Open Graph tags, and Twitter Cards to all pages for better search engine visibility and social media sharing.

# 2) Background / Context

Current application lacks meta tags for SEO and social sharing. Need proper meta tags for:
- Search engines (Google, Bing)
- Social media platforms (Facebook, Twitter, LinkedIn)
- Property detail pages with dynamic content
- Structured data for property listings

# 3) Assumptions & Constraints

- ASSUMPTION: Using react-helmet-async for meta tag management
- Constraint: Must work with client-side routing (React Router v7)
- Constraint: Property images must be absolute URLs for Open Graph
- ASSUMPTION: Backend API provides property meta data (title, description, images)

# 4) Dependencies (Other Tasks or Artifacts)

- src/pages/** (all page components)
- Backend API must provide property metadata

# 5) Context Plan

**Beginning (add to model context):**

- bofe_react/src/App.jsx
- bofe_react/src/pages/Home/IndexExact.jsx
- bofe_react/src/pages/Properties/PropertyList.jsx
- bofe_react/package.json

**End state (must exist after completion):**

- bofe_react/src/components/common/SEO.jsx (new)
- bofe_react/src/utils/seo.js (new - SEO helpers)
- bofe_react/public/og-default.jpg (default Open Graph image)
- All page components updated with SEO component

# 6) Low-Level Steps

1. **Install react-helmet-async**

   - Run: `npm install react-helmet-async`
   - Update package.json with new dependency

2. **Create reusable SEO component**

   - File: `bofe_react/src/components/common/SEO.jsx`
   - Exported API:
     ```jsx
     import { Helmet } from 'react-helmet-async';

     export function SEO({
       title,
       description,
       keywords,
       image,
       url,
       type = 'website',
       author = 'Best of Exmoor',
     }) {
       const siteUrl = import.meta.env.VITE_SITE_URL || 'https://bestofexmoor.co.uk';
       const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
       const fullImage = image || `${siteUrl}/og-default.jpg`;
       const fullTitle = title ? `${title} | Best of Exmoor` : 'Best of Exmoor - Vacation Rentals';

       return (
         <Helmet>
           {/* Basic Meta Tags */}
           <title>{fullTitle}</title>
           <meta name="description" content={description} />
           {keywords && <meta name="keywords" content={keywords} />}
           <meta name="author" content={author} />

           {/* Open Graph */}
           <meta property="og:type" content={type} />
           <meta property="og:title" content={fullTitle} />
           <meta property="og:description" content={description} />
           <meta property="og:image" content={fullImage} />
           <meta property="og:url" content={fullUrl} />
           <meta property="og:site_name" content="Best of Exmoor" />

           {/* Twitter Card */}
           <meta name="twitter:card" content="summary_large_image" />
           <meta name="twitter:title" content={fullTitle} />
           <meta name="twitter:description" content={description} />
           <meta name="twitter:image" content={fullImage} />

           {/* Canonical URL */}
           <link rel="canonical" href={fullUrl} />
         </Helmet>
       );
     }
     ```

3. **Wrap App with HelmetProvider**

   - File: `bofe_react/src/App.jsx`
   - Add HelmetProvider:
     ```jsx
     import { HelmetProvider } from 'react-helmet-async';

     function App() {
       return (
         <HelmetProvider>
           <QueryClientProvider client={queryClient}>
             {/* existing providers */}
           </QueryClientProvider>
         </HelmetProvider>
       );
     }
     ```

4. **Add SEO to homepage**

   - File: `bofe_react/src/pages/Home/IndexExact.jsx`
   - Add SEO component:
     ```jsx
     import { SEO } from '../../components/common/SEO';

     function IndexExact() {
       return (
         <>
           <SEO
             title="Vacation Rentals & Holiday Cottages"
             description="Discover beautiful vacation rentals and holiday cottages in Exmoor. Book your perfect getaway with stunning views and luxury amenities."
             keywords="exmoor, vacation rentals, holiday cottages, accommodation"
             url="/"
           />
           {/* page content */}
         </>
       );
     }
     ```

5. **Add dynamic SEO for property pages**

   - File: `bofe_react/src/pages/Properties/PropertyList.jsx`
   - Add dynamic SEO based on property data:
     ```jsx
     import { SEO } from '../../components/common/SEO';

     function PropertyList() {
       const { data: properties } = useQuery(...);

       return (
         <>
           <SEO
             title="Browse Properties"
             description="Explore our collection of luxury vacation rentals in Exmoor. Find the perfect property for your stay."
             url="/properties"
           />
           {/* page content */}
         </>
       );
     }
     ```

6. **Add SEO helper utilities**

   - File: `bofe_react/src/utils/seo.js`
   - Export helper functions:
     ```js
     export function generatePropertySchema(property) {
       return {
         "@context": "https://schema.org",
         "@type": "LodgingBusiness",
         "name": property.name,
         "description": property.description,
         "address": {
           "@type": "PostalAddress",
           "addressLocality": property.location,
           "addressCountry": "GB"
         },
         "image": property.images.map(img => img.url),
         "priceRange": `£${property.minPrice} - £${property.maxPrice}`,
       };
     }

     export function truncateDescription(text, maxLength = 160) {
       if (text.length <= maxLength) return text;
       return text.slice(0, maxLength - 3) + '...';
     }
     ```

7. **Add default Open Graph image**

   - File: `bofe_react/public/og-default.jpg`
   - Use existing Best of Exmoor logo or create 1200x630px image
   - Should represent brand and Exmoor landscape

8. **Add environment variable for site URL**

   - File: `bofe_react/.env`
   - Add: `VITE_SITE_URL=https://bestofexmoor.co.uk`
   - File: `bofe_react/.env.example`
   - Document the variable

# 7) Types & Interfaces

```jsx
// bofe_react/src/components/common/SEO.jsx
export interface SEOProps {
  title?: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
}
```

# 8) Acceptance Criteria

- SEO component exported from `src/components/common/SEO.jsx`
- All major pages (home, properties, about, contact) have SEO tags
- Open Graph tags validate at https://developers.facebook.com/tools/debug/
- Twitter Card tags validate at https://cards-dev.twitter.com/validator
- Canonical URLs are correct for all pages
- Property pages have dynamic meta tags based on property data
- Default og-default.jpg exists in public/ folder

# 9) Testing Strategy

- Manual testing: View page source and verify meta tags
- Validation: Use Facebook and Twitter validators for sharing previews
- SEO audit: Run Lighthouse SEO audit (score >90)
- Test sharing: Share pages on social media to verify images/descriptions

# 10) Notes / Links

- react-helmet-async docs: https://github.com/staylor/react-helmet-async
- Open Graph protocol: https://ogp.me/
- Twitter Cards: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
- Schema.org LodgingBusiness: https://schema.org/LodgingBusiness
