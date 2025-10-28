---
description: Create analytics dashboard for property owners with booking metrics
globs: "bofe_react/src/**/*.{js,jsx}"
alwaysApply: false
---

id: "TASK-0007"
title: "Build Owner Analytics Dashboard"
status: "planned"
priority: "P2"
labels: ["feature", "frontend", "owner-portal"]
dependencies: []
created: "2025-10-28"

# 1) High-Level Objective

Create comprehensive analytics dashboard for property owners showing booking metrics, revenue, occupancy rates, and performance insights.

# 2) Background / Context

From PRD "Nice-to-have (Later)" section. Property owners need visibility into their property performance. Dashboard will show:
- Total bookings and revenue
- Occupancy rate over time
- Average booking value
- Popular booking periods
- Guest demographics
- Comparison with previous periods

# 3) Assumptions & Constraints

- ASSUMPTION: Backend API provides aggregated analytics data
- Constraint: Charts must be responsive and mobile-friendly
- Constraint: Data updates daily (not real-time)
- ASSUMPTION: Use lightweight charting library (Chart.js or Recharts)
- Constraint: Only authenticated owners can access their property data

# 4) Dependencies (Other Tasks or Artifacts)

- Owner authentication system must be implemented
- Backend analytics API endpoints
- Booking data must be stored with sufficient detail
- src/pages/Owner/OwnerLogin.jsx (existing)

# 5) Context Plan

**Beginning (add to model context):**

- bofe_react/src/pages/Owner/OwnerLogin.jsx
- bofe_react/package.json
- Backend analytics API (external)

**End state (must exist after completion):**

- bofe_react/src/pages/Owner/Dashboard.jsx (new)
- bofe_react/src/components/owner/MetricCard.jsx (new)
- bofe_react/src/components/owner/BookingChart.jsx (new)
- bofe_react/src/components/owner/OccupancyChart.jsx (new)
- bofe_react/src/services/analyticsService.js (new)
- bofe_react/src/hooks/useAnalytics.js (new)

# 6) Low-Level Steps

1. **Install charting library**

   - Run: `npm install recharts date-fns`
   - Use Recharts for React-specific charts

2. **Create analytics service**

   - File: `bofe_react/src/services/analyticsService.js`
   - Exported API:
     ```js
     import api from './api';

     export const analyticsService = {
       async getOwnerMetrics(ownerId, dateRange = 'last30days') {
         const response = await api.get(`/analytics/owner/${ownerId}/metrics`, {
           params: { range: dateRange },
         });
         return response.data;
       },

       async getBookingTrends(ownerId, dateRange = 'last30days') {
         const response = await api.get(`/analytics/owner/${ownerId}/bookings`, {
           params: { range: dateRange },
         });
         return response.data;
       },

       async getOccupancyRate(propertyId, dateRange = 'last30days') {
         const response = await api.get(`/analytics/property/${propertyId}/occupancy`, {
           params: { range: dateRange },
         });
         return response.data;
       },

       async getRevenueBreakdown(ownerId, dateRange = 'last30days') {
         const response = await api.get(`/analytics/owner/${ownerId}/revenue`, {
           params: { range: dateRange },
         });
         return response.data;
       },
     };
     ```

3. **Create useAnalytics custom hook**

   - File: `bofe_react/src/hooks/useAnalytics.js`
   - Exported API:
     ```js
     import { useQuery } from '@tanstack/react-query';
     import { analyticsService } from '../services/analyticsService';
     import { useAuth } from '../context/AuthContext';

     export function useAnalytics(dateRange = 'last30days') {
       const { user } = useAuth();

       const metricsQuery = useQuery({
         queryKey: ['analytics', 'metrics', user?.id, dateRange],
         queryFn: () => analyticsService.getOwnerMetrics(user.id, dateRange),
         enabled: !!user,
         staleTime: 5 * 60 * 1000, // 5 minutes
       });

       const bookingsQuery = useQuery({
         queryKey: ['analytics', 'bookings', user?.id, dateRange],
         queryFn: () => analyticsService.getBookingTrends(user.id, dateRange),
         enabled: !!user,
       });

       const revenueQuery = useQuery({
         queryKey: ['analytics', 'revenue', user?.id, dateRange],
         queryFn: () => analyticsService.getRevenueBreakdown(user.id, dateRange),
         enabled: !!user,
       });

       return {
         metrics: metricsQuery.data,
         bookings: bookingsQuery.data,
         revenue: revenueQuery.data,
         isLoading: metricsQuery.isLoading || bookingsQuery.isLoading,
         error: metricsQuery.error || bookingsQuery.error,
       };
     }
     ```

4. **Create MetricCard component**

   - File: `bofe_react/src/components/owner/MetricCard.jsx`
   - Exported API:
     ```jsx
     export function MetricCard({ title, value, subtitle, trend, icon }) {
       const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';

       return (
         <div className="bg-white rounded-lg shadow-md p-6">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
               <p className="text-3xl font-bold text-gray-900">{value}</p>
               {subtitle && (
                 <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
               )}
             </div>
             {icon && (
               <div className="bg-exmoor-green bg-opacity-10 p-3 rounded-lg">
                 {icon}
               </div>
             )}
           </div>

           {trend !== undefined && (
             <div className={`mt-4 flex items-center ${trendColor}`}>
               <svg className="w-4 h-4 mr-1" /* trend arrow icon */>
                 {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}
               </svg>
               <span className="text-sm font-medium">
                 {Math.abs(trend)}% vs last period
               </span>
             </div>
           )}
         </div>
       );
     }
     ```

5. **Create BookingChart component**

   - File: `bofe_react/src/components/owner/BookingChart.jsx`
   - Exported API:
     ```jsx
     import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
     import { format } from 'date-fns';

     export function BookingChart({ data }) {
       return (
         <div className="bg-white rounded-lg shadow-md p-6">
           <h3 className="text-lg font-semibold mb-4">Bookings Over Time</h3>
           <ResponsiveContainer width="100%" height={300}>
             <LineChart data={data}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis
                 dataKey="date"
                 tickFormatter={(date) => format(new Date(date), 'MMM d')}
               />
               <YAxis />
               <Tooltip
                 labelFormatter={(date) => format(new Date(date), 'PPP')}
                 formatter={(value) => [`${value} bookings`, 'Count']}
               />
               <Line
                 type="monotone"
                 dataKey="bookings"
                 stroke="#84A286"
                 strokeWidth={2}
                 dot={{ fill: '#84A286' }}
               />
             </LineChart>
           </ResponsiveContainer>
         </div>
       );
     }
     ```

6. **Create OccupancyChart component**

   - File: `bofe_react/src/components/owner/OccupancyChart.jsx`
   - Exported API:
     ```jsx
     import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

     export function OccupancyChart({ data }) {
       return (
         <div className="bg-white rounded-lg shadow-md p-6">
           <h3 className="text-lg font-semibold mb-4">Occupancy Rate by Month</h3>
           <ResponsiveContainer width="100%" height={300}>
             <BarChart data={data}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="month" />
               <YAxis tickFormatter={(value) => `${value}%`} />
               <Tooltip formatter={(value) => `${value}%`} />
               <Bar dataKey="occupancy" fill="#84A286" radius={[8, 8, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
         </div>
       );
     }
     ```

7. **Create Owner Dashboard page**

   - File: `bofe_react/src/pages/Owner/Dashboard.jsx`
   - Exported API:
     ```jsx
     import { useState } from 'react';
     import { useAnalytics } from '../../hooks/useAnalytics';
     import { MetricCard } from '../../components/owner/MetricCard';
     import { BookingChart } from '../../components/owner/BookingChart';
     import { OccupancyChart } from '../../components/owner/OccupancyChart';

     const DATE_RANGES = [
       { value: 'last7days', label: 'Last 7 Days' },
       { value: 'last30days', label: 'Last 30 Days' },
       { value: 'last90days', label: 'Last 90 Days' },
       { value: 'thisYear', label: 'This Year' },
     ];

     function Dashboard() {
       const [dateRange, setDateRange] = useState('last30days');
       const { metrics, bookings, revenue, isLoading } = useAnalytics(dateRange);

       if (isLoading) {
         return <div>Loading analytics...</div>;
       }

       return (
         <div className="container mx-auto px-4 py-8">
           {/* Header */}
           <div className="flex justify-between items-center mb-8">
             <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
             <select
               value={dateRange}
               onChange={(e) => setDateRange(e.target.value)}
               className="px-4 py-2 border border-gray-300 rounded-lg"
             >
               {DATE_RANGES.map((range) => (
                 <option key={range.value} value={range.value}>
                   {range.label}
                 </option>
               ))}
             </select>
           </div>

           {/* Metric Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
             <MetricCard
               title="Total Revenue"
               value={`£${metrics.totalRevenue.toLocaleString()}`}
               subtitle={`${metrics.totalBookings} bookings`}
               trend={metrics.revenueTrend}
               icon={<span className="text-2xl">💷</span>}
             />
             <MetricCard
               title="Occupancy Rate"
               value={`${metrics.occupancyRate}%`}
               subtitle={`${metrics.bookedDays} of ${metrics.totalDays} days`}
               trend={metrics.occupancyTrend}
               icon={<span className="text-2xl">📅</span>}
             />
             <MetricCard
               title="Avg Booking Value"
               value={`£${metrics.avgBookingValue}`}
               subtitle={`${metrics.avgStayDuration} nights avg`}
               trend={metrics.avgValueTrend}
               icon={<span className="text-2xl">💰</span>}
             />
             <MetricCard
               title="Total Guests"
               value={metrics.totalGuests}
               subtitle={`${metrics.returningGuests}% returning`}
               trend={metrics.guestsTrend}
               icon={<span className="text-2xl">👥</span>}
             />
           </div>

           {/* Charts */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
             <BookingChart data={bookings} />
             <OccupancyChart data={metrics.occupancyByMonth} />
           </div>

           {/* Revenue Breakdown */}
           <div className="bg-white rounded-lg shadow-md p-6">
             <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
             <div className="space-y-4">
               {revenue?.map((item) => (
                 <div key={item.property} className="flex justify-between items-center">
                   <div>
                     <p className="font-medium">{item.property}</p>
                     <p className="text-sm text-gray-600">{item.bookings} bookings</p>
                   </div>
                   <p className="text-lg font-semibold">£{item.revenue.toLocaleString()}</p>
                 </div>
               ))}
             </div>
           </div>
         </div>
       );
     }

     export default Dashboard;
     ```

8. **Add dashboard route**

   - File: `bofe_react/src/routes/index.jsx`
   - Add protected route:
     ```jsx
     import Dashboard from '../pages/Owner/Dashboard';

     <Route path="/owner/dashboard" element={
       <Layout>
         <ProtectedRoute>
           <Dashboard />
         </ProtectedRoute>
       </Layout>
     } />
     ```

9. **Backend: Create analytics endpoints**

   - File: `stage_exmoor/src/Controller/AnalyticsController.php`
   - Implement aggregation queries:
     ```php
     <?php
     namespace App\Controller;

     class AnalyticsController extends AppController
     {
         public function ownerMetrics($ownerId)
         {
             $this->request->allowMethod(['get']);
             $range = $this->request->getQuery('range', 'last30days');

             $dateFilter = $this->getDateFilter($range);

             $bookings = $this->Bookings->find()
                 ->where([
                     'owner_id' => $ownerId,
                     'created >=' => $dateFilter['start'],
                     'created <=' => $dateFilter['end'],
                 ])
                 ->contain(['Properties'])
                 ->all();

             $metrics = [
                 'totalRevenue' => $bookings->sumOf('total_price'),
                 'totalBookings' => $bookings->count(),
                 'occupancyRate' => $this->calculateOccupancy($bookings),
                 'avgBookingValue' => $bookings->avg('total_price'),
                 // ... more calculations
             ];

             return $this->response->withType('application/json')
                 ->withStringBody(json_encode($metrics));
         }

         private function calculateOccupancy($bookings)
         {
             // Calculate occupancy rate logic
         }
     }
     ```

# 8) Acceptance Criteria

- Dashboard displays key metrics: revenue, occupancy, avg booking value, guests
- Charts render correctly and are responsive on mobile
- Date range selector filters data properly
- Metrics show trend indicators (up/down vs previous period)
- Only authenticated owners can access dashboard
- Data refreshes when date range changes
- Charts use brand colors (exmoor-green)
- Loading states display while fetching data
- Backend API returns aggregated analytics data

# 9) Testing Strategy

- Visual testing: Verify charts render correctly with various data sets
- Data accuracy: Validate calculations match expected results
- Performance: Test with large datasets (100+ bookings)
- Responsive: Test on mobile, tablet, desktop
- Edge cases: Test with zero bookings, single property, multiple properties
- Access control: Verify owners can only see their own data

# 10) Notes / Links

- Recharts docs: https://recharts.org/
- Future enhancement: Export data to CSV/PDF
- Future enhancement: Custom date range picker
- Future enhancement: Email weekly summary reports
- Related: TASK-0006 for email integration with analytics summaries
