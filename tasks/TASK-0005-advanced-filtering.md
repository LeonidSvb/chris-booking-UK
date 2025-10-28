---
description: Add advanced property filtering (price range, amenities, bedrooms)
globs: "bofe_react/src/**/*.{js,jsx}"
alwaysApply: false
---

id: "TASK-0005"
title: "Implement Advanced Property Filtering"
status: "planned"
priority: "P2"
labels: ["feature", "frontend", "ux"]
dependencies: []
created: "2025-10-28"

# 1) High-Level Objective

Add comprehensive filtering system for property search with price range, amenities, bedrooms, location, and availability filters to improve property discovery.

# 2) Background / Context

From PRD "Nice-to-have (Later)" section. Currently, users can only do basic search. Advanced filters will:
- Improve property discovery
- Reduce time to find suitable properties
- Increase booking conversion rate
- Match competitor features (Airbnb, VRBO)

# 3) Assumptions & Constraints

- ASSUMPTION: Backend API supports query parameters for filtering
- Constraint: Filters must work with existing TanStack Query caching
- Constraint: URL should reflect filter state for sharing/bookmarking
- ASSUMPTION: Filters are applied client-side first, then server-side for performance

# 4) Dependencies (Other Tasks or Artifacts)

- Backend API must support filter query params
- src/pages/Properties/PropertyList.jsx (existing)
- src/services/propertyService.js (existing)

# 5) Context Plan

**Beginning (add to model context):**

- bofe_react/src/pages/Properties/PropertyList.jsx
- bofe_react/src/services/propertyService.js
- bofe_react/package.json

**End state (must exist after completion):**

- bofe_react/src/components/properties/PropertyFilters.jsx (new)
- bofe_react/src/hooks/usePropertyFilters.js (new)
- bofe_react/src/utils/filterUtils.js (new)
- bofe_react/src/pages/Properties/PropertyList.jsx (updated)

# 6) Low-Level Steps

1. **Create usePropertyFilters custom hook**

   - File: `bofe_react/src/hooks/usePropertyFilters.js`
   - Exported API:
     ```js
     import { useState, useCallback } from 'react';
     import { useSearchParams } from 'react-router-dom';

     export function usePropertyFilters() {
       const [searchParams, setSearchParams] = useSearchParams();

       const filters = {
         minPrice: Number(searchParams.get('minPrice')) || 0,
         maxPrice: Number(searchParams.get('maxPrice')) || 10000,
         bedrooms: Number(searchParams.get('bedrooms')) || 0,
         amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || [],
         location: searchParams.get('location') || '',
         guests: Number(searchParams.get('guests')) || 1,
       };

       const updateFilters = useCallback((newFilters) => {
         const params = new URLSearchParams();
         Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
           if (value && value !== 0 && (!Array.isArray(value) || value.length > 0)) {
             params.set(key, Array.isArray(value) ? value.join(',') : String(value));
           }
         });
         setSearchParams(params);
       }, [filters, setSearchParams]);

       const resetFilters = useCallback(() => {
         setSearchParams({});
       }, [setSearchParams]);

       return { filters, updateFilters, resetFilters };
     }
     ```

2. **Create PropertyFilters component**

   - File: `bofe_react/src/components/properties/PropertyFilters.jsx`
   - Exported API:
     ```jsx
     import { useState } from 'react';

     const AMENITIES = [
       { id: 'wifi', label: 'WiFi' },
       { id: 'parking', label: 'Parking' },
       { id: 'pet-friendly', label: 'Pet Friendly' },
       { id: 'fireplace', label: 'Fireplace' },
       { id: 'garden', label: 'Garden' },
       { id: 'hot-tub', label: 'Hot Tub' },
     ];

     export function PropertyFilters({ filters, onFilterChange, onReset }) {
       const [isOpen, setIsOpen] = useState(false);

       return (
         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
           {/* Mobile toggle */}
           <button
             onClick={() => setIsOpen(!isOpen)}
             className="lg:hidden w-full flex justify-between items-center mb-4"
           >
             <span className="font-semibold">Filters</span>
             <svg className={`w-5 h-5 transform ${isOpen ? 'rotate-180' : ''}`}>
               {/* chevron icon */}
             </svg>
           </button>

           <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
             {/* Price Range */}
             <div className="mb-6">
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Price Range
               </label>
               <div className="flex gap-4">
                 <input
                   type="number"
                   placeholder="Min £"
                   value={filters.minPrice || ''}
                   onChange={(e) => onFilterChange({ minPrice: Number(e.target.value) })}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                 />
                 <input
                   type="number"
                   placeholder="Max £"
                   value={filters.maxPrice || ''}
                   onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                 />
               </div>
             </div>

             {/* Bedrooms */}
             <div className="mb-6">
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Bedrooms
               </label>
               <div className="flex gap-2">
                 {[1, 2, 3, 4, 5].map((num) => (
                   <button
                     key={num}
                     onClick={() => onFilterChange({ bedrooms: num })}
                     className={`px-4 py-2 rounded-lg border ${
                       filters.bedrooms === num
                         ? 'bg-exmoor-green text-white border-exmoor-green'
                         : 'bg-white text-gray-700 border-gray-300'
                     }`}
                   >
                     {num}+
                   </button>
                 ))}
               </div>
             </div>

             {/* Amenities */}
             <div className="mb-6">
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Amenities
               </label>
               <div className="grid grid-cols-2 gap-2">
                 {AMENITIES.map((amenity) => (
                   <label key={amenity.id} className="flex items-center">
                     <input
                       type="checkbox"
                       checked={filters.amenities.includes(amenity.id)}
                       onChange={(e) => {
                         const newAmenities = e.target.checked
                           ? [...filters.amenities, amenity.id]
                           : filters.amenities.filter((a) => a !== amenity.id);
                         onFilterChange({ amenities: newAmenities });
                       }}
                       className="mr-2 h-4 w-4 text-exmoor-green"
                     />
                     <span className="text-sm text-gray-700">{amenity.label}</span>
                   </label>
                 ))}
               </div>
             </div>

             {/* Reset Button */}
             <button
               onClick={onReset}
               className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
             >
               Reset Filters
             </button>
           </div>
         </div>
       );
     }
     ```

3. **Create filter utilities**

   - File: `bofe_react/src/utils/filterUtils.js`
   - Exported API:
     ```js
     export function applyFilters(properties, filters) {
       return properties.filter((property) => {
         // Price filter
         if (filters.minPrice && property.price < filters.minPrice) return false;
         if (filters.maxPrice && property.price > filters.maxPrice) return false;

         // Bedrooms filter
         if (filters.bedrooms && property.bedrooms < filters.bedrooms) return false;

         // Guests filter
         if (filters.guests && property.maxGuests < filters.guests) return false;

         // Amenities filter
         if (filters.amenities.length > 0) {
           const hasAllAmenities = filters.amenities.every((amenity) =>
             property.amenities?.includes(amenity)
           );
           if (!hasAllAmenities) return false;
         }

         // Location filter
         if (filters.location) {
           const locationMatch = property.location
             ?.toLowerCase()
             .includes(filters.location.toLowerCase());
           if (!locationMatch) return false;
         }

         return true;
       });
     }

     export function buildFilterQueryString(filters) {
       const params = new URLSearchParams();

       Object.entries(filters).forEach(([key, value]) => {
         if (value && value !== 0) {
           if (Array.isArray(value) && value.length > 0) {
             params.set(key, value.join(','));
           } else if (!Array.isArray(value)) {
             params.set(key, String(value));
           }
         }
       });

       return params.toString();
     }

     export function getActiveFilterCount(filters) {
       let count = 0;
       if (filters.minPrice > 0) count++;
       if (filters.maxPrice < 10000) count++;
       if (filters.bedrooms > 0) count++;
       if (filters.amenities.length > 0) count += filters.amenities.length;
       if (filters.location) count++;
       if (filters.guests > 1) count++;
       return count;
     }
     ```

4. **Update PropertyList with filters**

   - File: `bofe_react/src/pages/Properties/PropertyList.jsx`
   - Integrate filters:
     ```jsx
     import { PropertyFilters } from '../../components/properties/PropertyFilters';
     import { usePropertyFilters } from '../../hooks/usePropertyFilters';
     import { applyFilters, getActiveFilterCount } from '../../utils/filterUtils';

     function PropertyList() {
       const { filters, updateFilters, resetFilters } = usePropertyFilters();

       const { data: properties, isLoading } = useQuery({
         queryKey: ['properties', filters],
         queryFn: () => propertyService.getAll(filters),
       });

       const filteredProperties = properties ? applyFilters(properties, filters) : [];
       const activeFilterCount = getActiveFilterCount(filters);

       return (
         <Layout>
           <div className="container mx-auto px-4 py-8">
             <div className="lg:flex gap-6">
               {/* Filters sidebar */}
               <aside className="lg:w-1/4">
                 <PropertyFilters
                   filters={filters}
                   onFilterChange={updateFilters}
                   onReset={resetFilters}
                 />
               </aside>

               {/* Property list */}
               <main className="lg:w-3/4">
                 <div className="mb-4 flex justify-between items-center">
                   <h2 className="text-2xl font-bold">
                     {filteredProperties.length} Properties Found
                     {activeFilterCount > 0 && (
                       <span className="ml-2 text-sm text-gray-600">
                         ({activeFilterCount} filters active)
                       </span>
                     )}
                   </h2>
                 </div>

                 {/* Property grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {filteredProperties.map((property) => (
                     <PropertyCard key={property.id} property={property} />
                   ))}
                 </div>
               </main>
             </div>
           </div>
         </Layout>
       );
     }
     ```

5. **Update propertyService for server-side filtering**

   - File: `bofe_react/src/services/propertyService.js`
   - Add filter params:
     ```js
     import { buildFilterQueryString } from '../utils/filterUtils';

     export const propertyService = {
       async getAll(filters = {}) {
         const queryString = buildFilterQueryString(filters);
         const url = queryString ? `/properties?${queryString}` : '/properties';
         const response = await api.get(url);
         return response.data;
       },

       // ... other methods
     };
     ```

# 8) Acceptance Criteria

- PropertyFilters component renders with all filter options
- Filters update URL query params for sharing/bookmarking
- Property list updates in real-time as filters change
- Active filter count displays correctly
- Reset button clears all filters
- Filters work with TanStack Query caching
- Mobile-responsive filter panel with toggle
- No performance issues with large property lists
- Backend API receives proper filter query params

# 9) Testing Strategy

- Manual testing: Apply various filter combinations and verify results
- URL testing: Verify filters persist in URL and work when shared
- Performance testing: Test with 100+ properties to ensure smooth filtering
- Mobile testing: Verify filter panel works on mobile devices
- Edge cases: Test empty results, invalid filter values, extreme price ranges

# 10) Notes / Links

- Future enhancement: Add map view with filtered results
- Future enhancement: Save filter presets
- Future enhancement: Filter by availability dates
- Related: Consider TASK-0009 for property comparison feature
