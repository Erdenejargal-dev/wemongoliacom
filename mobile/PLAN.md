# WeMongolia Mobile — Implementation Plan

> Design reference: TRU by Brickclay (Design.md)  
> Stack: Expo 54 · React Native 0.81 · Expo Router v6  
> Target: iOS (iPhone 15 Pro primary) + Android  

---

## Audit: Current State vs Design Requirements

### Critical Gaps

| Area | Current State | Required |
|------|--------------|----------|
| Design tokens | `theme.ts` with wrong colors (`#0a7ea4`) | `#0085C9` primary, `#EFF7FD` page bg |
| Colors in MOBILE_DEV.md | Modified to `#38D4FF` cyan — **wrong** | Must revert to `#0085C9` per Design.md |
| Navigation | 2-tab boilerplate | 5-tab bottom nav (Home, AI, Map, Bookmark, More) |
| Font | System default | Nunito or Outfit (rounded geometric sans) |
| Components | None (stock Expo) | ~15 custom components per design system |
| API layer | None | Axios + interceptors + token refresh |
| State management | None | Zustand (auth/wishlist) + React Query (server) |
| Screens | 2 placeholder | 60+ screens across 15 flows |
| Assets | React logo placeholders | WeMongolia brand assets |
| Animations | None | Reanimated spring physics (350ms screen push, etc.) |
| Skeleton screens | None (no loading states) | Shimmer skeletons — zero spinners per design rules |

### Design.md Conflict — Needs Team Decision

Design.md Section 2 says: **"#0085C9 is the ONLY accent — no greens"**  
But Sections 8.7/8.9/8.10/8.11 use `#C5F135` lime for flights price, payment radio, map toggles, logout CTA.

**Resolution needed before building those screens.** Until confirmed: use `#0085C9` everywhere as default.

### Color Correction Required

`MOBILE_DEV.md` was modified to use `#38D4FF` cyan tint — this conflicts with Design.md.  
During Phase 0, `constants/Colors.ts` will be written from Design.md as source of truth.

---

## Architecture

```
mobile/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Auth group (no nav bar)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Main 5-tab group
│   │   ├── _layout.tsx           # Bottom nav config
│   │   ├── index.tsx             # Home / Dashboard
│   │   ├── ai.tsx                # AI Assistant
│   │   ├── map.tsx               # Location & Maps
│   │   ├── trips.tsx             # My Trips / Bookmarks
│   │   └── more.tsx              # Profile + settings grid
│   ├── destination/[slug].tsx    # Destination detail
│   ├── tour/[slug].tsx           # Tour detail
│   ├── stay/[slug].tsx           # Stay detail
│   ├── vehicle/[slug].tsx        # Vehicle detail
│   ├── booking/                  # Booking flow (stack)
│   │   ├── _layout.tsx
│   │   ├── select-dates.tsx
│   │   ├── travelers.tsx
│   │   ├── confirm.tsx
│   │   └── payment.tsx
│   ├── conversation/[id].tsx     # Messaging thread
│   ├── notifications.tsx
│   ├── wishlist.tsx
│   ├── account.tsx
│   └── _layout.tsx               # Root layout + providers
├── components/
│   ├── ui/                       # Design system primitives
│   │   ├── Button.tsx
│   │   ├── FilterPill.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Badge.tsx
│   │   ├── TextInput.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── StatsRow.tsx
│   │   ├── Skeleton.tsx          # Shimmer skeleton
│   │   └── BottomSheet.tsx
│   ├── cards/
│   │   ├── DestinationCard.tsx
│   │   ├── TripCard.tsx
│   │   ├── ListItem.tsx
│   │   └── AIBanner.tsx
│   └── layout/
│       ├── ScreenLayout.tsx      # Page bg + safe area
│       └── TabBar.tsx            # Custom 5-tab bottom nav
├── constants/
│   ├── Colors.ts                 # Design.md tokens
│   ├── Typography.ts             # Type scale from Design.md
│   └── Spacing.ts                # 4pt grid from Design.md
├── lib/
│   ├── api.ts                    # Axios instance + interceptors
│   └── queryClient.ts            # React Query client config
├── stores/
│   ├── auth.store.ts             # Zustand: user, tokens
│   └── wishlist.store.ts         # Zustand: saved items
├── hooks/
│   ├── useApi.ts                 # Typed React Query wrappers
│   └── useAuth.ts                # Auth state + actions
└── types/
    └── api.ts                    # API response types
```

### State Strategy

| Data Type | Tool | Persistence |
|-----------|------|-------------|
| Auth (user, tokens) | Zustand | expo-secure-store |
| Server data (listings, bookings) | React Query | in-memory cache |
| Wishlist (optimistic) | Zustand | AsyncStorage |
| UI state (sheets, tabs) | Local useState | — |

---

## Dependencies to Install

```bash
# Core
npx expo install expo-secure-store expo-image expo-font @expo-google-fonts/nunito

# API + State
npm install axios @tanstack/react-query zustand

# Forms
npm install react-hook-form zod @hookform/resolvers

# Navigation extras
npx expo install react-native-safe-area-context react-native-screens

# Maps
npx expo install react-native-maps expo-location

# Push notifications
npx expo install expo-notifications expo-device expo-constants

# Animations (already in expo but verify)
npx expo install react-native-reanimated react-native-gesture-handler

# Error tracking
npx expo install @sentry/react-native

# Haptics (tab bar)
npx expo install expo-haptics
```

---

## Phases

---

### Phase 0 — Foundation
**Duration: 3 days**  
**Deliverable: Skeleton app that renders correctly with design system wired up**

#### 0.1 Design Tokens
- [ ] Write `constants/Colors.ts` from Design.md Section 2 (exact hex values)
- [ ] Write `constants/Typography.ts` — 9-level type scale from Design.md Section 3
- [ ] Write `constants/Spacing.ts` — 4pt grid (4/8/12/16/20/24/32/48px) from Section 4

#### 0.2 Core Primitive Components
- [ ] `ui/Button.tsx` — Primary Blue, Primary Dark, Secondary Outline variants (Section 7.6)
- [ ] `ui/FilterPill.tsx` — Active/inactive states, pill radius (Section 7.1)
- [ ] `ui/SearchBar.tsx` — Pill shape, filter button trailing (Section 7.5)
- [ ] `ui/Badge.tsx` — All 5 badge variants from Section 7.12
- [ ] `ui/TextInput.tsx` — Label + focused state (Section 7.8)
- [ ] `ui/SectionHeader.tsx` — Title + "See All" link (Section 7.9)
- [ ] `ui/Skeleton.tsx` — Shimmer animation `#D0ECFA → #EFF7FD`, left-to-right, 1.2s loop
- [ ] `layout/ScreenLayout.tsx` — `#EFF7FD` page bg, safe area, 20px horizontal padding

#### 0.3 Navigation Shell
- [ ] Replace 2-tab layout with 5-tab bottom nav per Design.md Section 7.7
  - Tabs: Home, AI (sparkle), Map (globe), Trips (bookmark), More (grid)
  - Active: `#0085C9` rounded-square bg (10px radius), white icon
  - Inactive: `#EFF7FD` bg, `#A0B4C0` icon
  - Height: 72px, border-top: `0.5px solid #D5E8F5`
- [ ] Add `(auth)` group with no nav bar
- [ ] Root `_layout.tsx` — QueryClientProvider + Zustand hydration

#### 0.4 API Layer
- [ ] `lib/api.ts` — Axios instance, base URL from env, Bearer interceptor
- [ ] Token refresh interceptor — 401 → call `/auth/refresh` → retry
- [ ] `lib/queryClient.ts` — staleTime: 5min, retry: 2
- [ ] `stores/auth.store.ts` — user, accessToken, refreshToken, login/logout actions
- [ ] `hooks/useAuth.ts` — hydrate from SecureStore on app launch

#### 0.5 Assets
- [ ] Copy `wemongolia.svg`, `wemongolia.png`, `wemongolia-white.png` from `public/brand/` into `assets/images/`
- [ ] Replace Expo placeholder icon/splash with WeMongolia assets
- [ ] Install Nunito font via `@expo-google-fonts/nunito`
- [ ] Wire Nunito into root layout as default font

---

### Phase 1 — Auth Flow
**Duration: 2 days**  
**Deliverable: Register → Login → secure token storage → home redirect**

#### Screens
- [ ] `(auth)/login.tsx`
  - Full-bleed destination photo (placeholder ok for now)
  - Gradient overlay: `linear-gradient(to top, rgba(0,32,48,1) 0%, transparent 70%)`
  - Email + password inputs using `ui/TextInput`
  - Primary Blue CTA "Sign in"
  - "Forgot password?" link in `#0085C9`
  - Social auth buttons (Google) — outline style
  - "Create account" link

- [ ] `(auth)/register.tsx`
  - Same photo/overlay background
  - Name + email + password inputs
  - Primary Blue CTA "Create account"

- [ ] `(auth)/forgot-password.tsx`
  - Email input
  - Send reset link CTA
  - Back to login link

#### Logic
- [ ] `stores/auth.store.ts` — persist tokens via expo-secure-store on login
- [ ] Route guard in root `_layout.tsx` — redirect unauthenticated users to `(auth)/login`
- [ ] Route guard redirect authenticated users away from auth screens

---

### Phase 2 — Home Dashboard
**Duration: 3 days**  
**Deliverable: Home screen with all 6 state variants, pulling live data**

#### Structure (top → bottom per Design.md 8.2)
- [ ] User header — avatar + "Your Location" + city + bell icon
- [ ] Filter pills row — Trending / Top Picks / Nearby (horizontal scroll, no clip)
- [ ] Search bar + filter button
- [ ] "Explore Cities" section header + sub-filter pills (All / Popular / Nearby / Top Picks)
- [ ] Destination card 2-column grid — `cards/DestinationCard.tsx`
- [ ] Categories horizontal scroll — icon chips
- [ ] AI banner (when no active trip) — `cards/AIBanner.tsx`
- [ ] Trip Planner card (when trip active) — `cards/TripCard.tsx`

#### Components to build
- [ ] `cards/DestinationCard.tsx` — 3:2 image, title, subtitle, arrow button, rating badge (Section 7.2)
- [ ] `cards/AIBanner.tsx` — navy bg, AI chip, headline, CTA (Section 7.4)
- [ ] `cards/TripCard.tsx` — navy bg, trip name, countdown badge, progress (Section 7.3)

#### Data
- [ ] `useQuery` hook for `/destinations` → populate card grid
- [ ] Skeleton grid (4 cards) while loading — no spinner
- [ ] 6 dashboard state variants:
  1. First launch — no user data
  2. Trending — default populated state
  3. Upcoming journey — trip booked, countdown visible
  4. Active journey — in-progress trip with progress %
  5. Saved places — wishlist mode
  6. Empty — fallback state

---

### Phase 3 — Search & Explore
**Duration: 2 days**  
**Deliverable: Search screen + filter bottom sheet + results list**

- [ ] `app/(tabs)/map.tsx` → redirect to search initially OR split screen
- [ ] `app/search.tsx` — search modal/screen triggered from home search bar
  - Search input (auto-focus)
  - Results: vertical list with `ui/ListItem` — thumbnail + name + location
  - "Why these?" explainer link (muted text)
  - Filter categories: Peaks / Forest / Historical / Island / Desert / Coastal

- [ ] `ui/BottomSheet.tsx` — handle bar, spring animation 350ms (Section 10)
- [ ] `FilterSheet.tsx` — price slider, category chips, full-width primary CTA (Section 7.14)

#### Data
- [ ] `useQuery` for `/search?q=&type=&page=&limit=`
- [ ] Debounce search input 300ms
- [ ] Skeleton list items while loading

---

### Phase 4 — Listing Detail Screens
**Duration: 3 days**  
**Deliverable: Tour / Stay / Vehicle detail screens navigable from home**

#### Destination Detail (`destination/[slug].tsx`)
- [ ] Full-bleed hero photo, gradient overlay
- [ ] Back button — circular ghost button (44×44 tap target)
- [ ] "X Travelers Joined" trip count badge
- [ ] Rating — star + numeric, bottom-left of image
- [ ] Dates chip — `#003D5C` pill
- [ ] Tab bar — Description / Tour Partners / Moments
- [ ] Tour partners — horizontal avatar stack + count
- [ ] Book CTA — Primary Blue, full width, sticky bottom

#### Tour Detail (`tour/[slug].tsx`)
- [ ] Similar hero structure
- [ ] Duration / group size / difficulty badges
- [ ] Departure dates — `useQuery` for `/tours/:slug/departures`
- [ ] Price + "Book Now" CTA

#### Stay Detail (`stay/[slug].tsx`)
- [ ] Photo gallery (horizontal scroll)
- [ ] Amenities list
- [ ] Host info with avatar
- [ ] Availability picker (simplified) + Book CTA

#### Vehicle Detail (`vehicle/[slug].tsx`)
- [ ] Vehicle photos
- [ ] Specs (seats, fuel, transmission)
- [ ] Pickup/dropoff date inputs
- [ ] Daily rate + Book CTA

---

### Phase 5 — Booking Flow
**Duration: 3 days**  
**Deliverable: End-to-end booking from listing → confirmation**

Navigation: stack inside `app/booking/`

- [ ] `booking/select-dates.tsx`
  - Calendar grid
  - Selected state: `#003D5C` bg + white text (per Design.md 8.6)
  - Today indicator dot
  - Travel type pills: Solo / Couple / Family / Group

- [ ] `booking/travelers.tsx`
  - Adult / child / infant counters
  - Budget selector: Budget / Standard / Luxury (Section 7.13)
  - Special requests text input

- [ ] `booking/confirm.tsx`
  - Booking summary card
  - Promo code input
  - Price breakdown
  - "Proceed to Payment" CTA

- [ ] `booking/payment.tsx`
  - Styled card mockup — navy bg (Section 8.10)
  - Payment methods list: PayPal / Card / Bank Transfer
  - `POST /payments/initiate` on confirm
  - Status polling: `GET /payments/:id/status`

#### Booking Requests (non-payable listings)
- [ ] Separate `booking/request.tsx` — inquiry form → `POST /booking-requests`

---

### Phase 6 — My Trips
**Duration: 2 days**  
**Deliverable: Trip history, saved places, stats**

- [ ] `app/(tabs)/trips.tsx`
  - Tab bar: Saved / Plans (full-width pill style)
  - Sub-filter: All / Upcoming / Saved / Past
  - Stats row — Countries / Saved Places / Upcoming (Section 7.10)
  - Trip cards — full-bleed image, gradient, Confirmed badge, dates, airport, "View Itinerary" CTA

- [ ] `app/wishlist.tsx`
  - Grid of saved destinations/listings
  - Remove from wishlist swipe action
  - Data: `GET /wishlist`, `DELETE /wishlist/:id`

- [ ] `app/notifications.tsx`
  - `GET /notifications`
  - `POST /notifications/read/:id`
  - List items with unread dot indicator

---

### Phase 7 — AI Assistant
**Duration: 2 days**  
**Deliverable: Conversational AI screen accessible from bottom tab 2**

> Note: This screen connects to the `/conversations` backend endpoint, not a direct AI API call. The backend handles AI routing.

- [ ] `app/(tabs)/ai.tsx`
  - Chat history — scrollable
  - User bubbles: trailing, `#1A2E4A` bg (dark navy), white text
  - AI bubbles: leading, `#FFFFFF` bg, `0.5px solid #C5DCF0` border
  - AI avatar: circular `#0085C9` bg with sparkle icon
  - Inline itinerary result cards: navy bg, formatted trip plan
  - Input bar: search-bar style, send arrow button

- [ ] Connect to `GET/POST /conversations` and `POST /conversations/:id/messages`
- [ ] "AI ASSISTANT" chip tag on entry banner (Section 7.4 spec)
- [ ] Skeleton message bubbles on load

---

### Phase 8 — Location & Maps
**Duration: 2 days**  
**Deliverable: Full-screen map with destination pins**

- [ ] `app/(tabs)/map.tsx`
  - `react-native-maps` full-screen map
  - Map pins: circular, `#003D5C` outer, `#0085C9` inner dot (Section 7.15)
  - Map / Hybrid toggle pill (overlay, top)
  - Preference card floating over bottom 40% of screen
  - Transportation Routes toggle
  - `expo-location` for user location

- [ ] `GET /geo` for location hints
- [ ] Tap pin → navigate to destination detail

---

### Phase 9 — Account & Profile
**Duration: 2 days**  
**Deliverable: Profile, settings, messaging inbox**

- [ ] `app/account.tsx`
  - 72px avatar circle, online dot
  - "Travel AI Profile — X% complete" progress bar
  - Settings rows with chevron (`ui/ListItem` style)
  - Logout CTA (confirm alert before logout — destructive action rule)
  - Data: `GET/PATCH /account`

- [ ] `app/(tabs)/more.tsx`
  - Grid of app sections (settings, help, saved, trips, notifications)
  - Link to account, wishlist, notifications

- [ ] `app/conversation/[id].tsx`
  - Messaging thread view
  - `GET /conversations/:id`
  - `POST /conversations/:id/messages`
  - Real-time feel via polling (5s interval) or future WebSocket upgrade

---

### Phase 10 — Polish & Production Readiness
**Duration: 3 days**  
**Deliverable: Shippable build**

#### Animations (react-native-reanimated)
- [ ] Screen push/pop: 350ms spring (response: 0.35, damping: 0.75)
- [ ] Modal bottom-up: 400ms spring (response: 0.40, damping: 0.80)
- [ ] Filter pill switch: 200ms ease-in-out
- [ ] Card press scale: 120ms ease-in → 0.97 → 200ms spring release
- [ ] Bottom sheet: 350ms spring (response: 0.38, damping: 0.78)
- [ ] ALL tappable elements have pressed-state (scale or opacity)

#### Skeleton Screens
- [ ] Audit all loading states — replace any ActivityIndicator with shimmer skeletons
- [ ] Shimmer: `#D0ECFA → #EFF7FD`, left-to-right, 1.2s loop, using Reanimated

#### Accessibility
- [ ] Verify all tap targets ≥ 44×44pt
- [ ] All icons have `accessibilityLabel`
- [ ] Color contrast audit (WCAG AA) against Design.md palette
- [ ] Destructive actions have Alert confirmation
- [ ] VoiceOver pass on auth + home + booking flows

#### Error States
- [ ] Network error screens per major flow
- [ ] Empty state designs for trips/wishlist/search
- [ ] Form validation errors (react-hook-form + zod)

#### Sentry
- [ ] `@sentry/react-native` init in root layout
- [ ] Capture unhandled exceptions + navigation breadcrumbs

#### EAS Build
- [ ] Update `app.json` — bundle ID, version, correct icon/splash assets
- [ ] `eas.json` — preview profile (internal) + production profile
- [ ] `eas build --platform all --profile preview` — test build

---

## Screen Inventory (60+ total)

| Flow | Screens | Phase |
|------|---------|-------|
| Auth | Login, Register, Forgot Password | 1 |
| Home | Dashboard (6 state variants) | 2 |
| Search | Search, Filter sheet | 3 |
| Listings | Destination, Tour, Stay, Vehicle detail | 4 |
| Booking | Dates, Travelers, Confirm, Payment, Request | 5 |
| My Trips | Trips list, Wishlist, Notifications | 6 |
| AI | AI chat | 7 |
| Maps | Map screen | 8 |
| Account | Profile, Settings, More, Conversation | 9 |

---

## Timeline Estimate

| Phase | Focus | Days |
|-------|-------|------|
| 0 | Foundation, design tokens, nav, API layer | 3 |
| 1 | Auth flow | 2 |
| 2 | Home dashboard | 3 |
| 3 | Search + filters | 2 |
| 4 | Listing detail screens | 3 |
| 5 | Booking flow | 3 |
| 6 | My Trips + Wishlist | 2 |
| 7 | AI Assistant | 2 |
| 8 | Maps | 2 |
| 9 | Account + Messaging | 2 |
| 10 | Polish + EAS build | 3 |
| **Total** | | **~27 dev days** |

---

## Open Questions (Team Decision Required)

1. **Lime accent conflict**: Design.md says no greens, but uses `#C5F135` in Flights/Payment/Maps sections. Which rule wins? → Affects Phase 5, 8.
2. **AI backend**: Does `/conversations` already route to an AI model, or is a direct Claude/Google AI call needed from mobile?
3. **Flights flow**: No `/flights` endpoint exists in backend. Build it, use a 3rd-party API (Amadeus?), or cut from MVP?
4. **Real-time messaging**: Polling or WebSocket upgrade needed for conversations?
5. **Push notifications**: Backend sends via what service? Need APNs/FCM config and Expo push token registration flow.
6. **Trains/Events flows**: Mentioned in Design.md but no backend routes. Cut from MVP or add to backend first?

---

## First Commit Scope (Phase 0 Day 1)

Start here:

```bash
# 1. Install all deps
# 2. Write constants/Colors.ts, Typography.ts, Spacing.ts
# 3. Write ui/Button.tsx, ui/FilterPill.tsx, ui/ScreenLayout.tsx
# 4. Replace 2-tab nav with 5-tab
# 5. Install + wire Nunito font
# 6. Write lib/api.ts + stores/auth.store.ts
```

Everything else gates on Phase 0 being solid.
