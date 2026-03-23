
BUSINESS_DASHBOARD_AUDIT.md(new)
+324
# Business Dashboard Audit**Scope:** `/dashboard/business` and provider workflows  **Date:** Based on current codebase inspection
Verifying audit details against the codebase:

Verifying the backend provider analytics route shape:

The audit document is saved at BUSINESS_DASHBOARD_AUDIT.md. Here's a condensed summary:

Audit Summary
Current state
Route	Status
/dashboard/business (Overview)	Partially real – provider profile from API; stats, charts, recent bookings are mock
/dashboard/business/bookings	Fully wired – list, confirm, complete, cancel
/dashboard/business/analytics	Mock – uses mock data instead of GET /provider/analytics
/dashboard/business/services	404 – no page
/dashboard/business/calendar	404 – no page
/dashboard/business/reviews	404 – no page
/dashboard/business/messages	404 – no page
/dashboard/business/payments	404 – no page
/dashboard/business/settings	404 – no page
Navigation: lib/provider-menu.ts links to 9 sections; 6 lead to 404s.

Backend support
Supported: Provider profile (GET/PUT), bookings (list + actions), analytics (GET)
Partial: Reviews (reply API exists, no provider reviews list), conversations (API exists, no Messages UI)
Missing: Tour/vehicle/accommodation CRUD, calendar/availability, payouts
Phased plan
Phase 1:

Wire Overview to real analytics + recent bookings
Wire Analytics page to fetchProviderAnalytics()
Add Business Profile / Settings page using PUT /provider/profile
Hide or fix dead sidebar links
Phase 2: Reviews page, Messages page, earnings summary

Phase 3: Listings management (when backend supports it), Calendar, full payouts

Main issues
Mock data on Overview and Analytics can mislead providers
Six sidebar links lead to 404
No way to manage listings (tours, vehicles, rooms)
No clear “what to do next” after onboarding
The full document includes detailed route/file mapping, backend coverage, recommended structure, UX/StoryBrand notes, and a more detailed phased plan. No code changes have been made; this is an audit and planning pass only.