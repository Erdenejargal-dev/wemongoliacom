# WeMongolia Mobile — Developer Guide

> Expo 54 · React Native 0.81 · Expo Router v6  
> Backend: Express + Prisma + PostgreSQL on Neon  
> API Base: `http://localhost:4000/api/v1` (dev) → replace with prod URL

---

## 1. Quick Start

```bash
cd mobile
npm install
npx expo start          # iOS/Android/Web
npx expo start --ios    # iOS simulator
npx expo start --android
```

Get `.env` values from team lead (see Section 4).

---

## 2. Branding

### Logo Files

Located in `public/brand/` (web project root):

| File | Use |
|------|-----|
| `wemongolia.svg` | Primary — use on light backgrounds |
| `wemongolia.png` | PNG fallback — light backgrounds |
| `wemongolia-white.png` | White variant — dark/colored backgrounds |
| `icon.png` | App icon / favicon |

Copy needed assets into `mobile/assets/images/`.

### Color Palette

```ts
// constants/Colors.ts — use these exact values

export const Brand = {
  primary:   '#0285c9',   // Main brand blue
  primaryHover: '#0269a3',

  // Blue scale
  blue50:  '#e8f5fc',
  blue100: '#c5e5f7',
  blue200: '#95cff1',
  blue300: '#55b2e8',
  blue400: '#2d96d9',
  blue500: '#0285c9',   // ← primary
  blue600: '#0269a3',
  blue700: '#025180',
  blue800: '#024568',
  blue900: '#023857',
  blue950: '#0a283d',
};

export const Neutral = {
  white:          '#ffffff',
  background:     '#ffffff',
  foreground:     '#171717',
  card:           '#ffffff',
  muted:          '#f5f5f5',
  mutedForeground:'#737373',
  border:         '#e5e5e5',
  input:          '#e5e5e5',
};

export const Status = {
  destructive:    '#ef4444',
  success:        '#22c55e',
};

export const App = {
  light: {
    background:        '#ffffff',
    text:              '#0D2847',   // deep navy  ← mirrors 144425 dark green
    tint:              '#38D4FF',   // electric cyan  ← mirrors D3FA53 lime
    icon:              '#4D6E85',   // muted slate blue  ← mirrors 657D6E
    tabIconDefault:    '#4D6E85',
    tabIconSelected:   '#38D4FF',
    splashBg:          '#D5E8F2',   // pale sky blue  ← mirrors E4E9D5
  },
  dark: {
    background:        '#0D1C2E',   // deep navy dark
    text:              '#E8F3FA',   // icy white-blue  ← mirrors EDF2E9
    tint:              '#38D4FF',
    icon:              '#7A9BB0',   // lighter muted blue  ← mirrors 9BA1A6
    tabIconDefault:    '#7A9BB0',
    tabIconSelected:   '#38D4FF',
    splashBg:          '#0D2847',   // ← mirrors 0a283d deep forest
  },
};
```

### Typography

| Role | Font | Notes |
|------|------|-------|
| Body / UI | **Manrope** | Primary brand font |
| Code / Mono | **Geist Mono** | Secondary |

Install via expo-google-fonts or bundle manually.

```bash
npx expo install @expo-google-fonts/manrope expo-font
```

---

## 3. Project Structure

```
mobile/
├── app/                    # File-based routing (Expo Router)
│   ├── (tabs)/             # Bottom tab group
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # Home screen
│   │   └── explore.tsx
│   ├── modal.tsx
│   └── _layout.tsx         # Root layout + providers
├── assets/images/          # Icons, splash screens, logos
├── components/             # Shared UI components
│   ├── ui/                 # Primitives (collapsible, icons)
│   ├── themed-text.tsx
│   └── themed-view.tsx
├── constants/
│   ├── Colors.ts           # ← Brand colors go here
│   └── theme.ts
├── hooks/
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
└── MOBILE_DEV.md           # This file
```

---

## 4. Environment Setup

Create `mobile/.env` (never commit this file):

```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=<get from team>
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=<get from team>
EXPO_PUBLIC_SENTRY_DSN=<get from team>
```

> **All secrets** (JWT keys, DB URLs, Cloudinary secret, SMTP password) live on the backend only. Mobile app never touches them directly.

---

## 5. Backend API Reference

**Base URL:** `EXPO_PUBLIC_API_URL` from env  
**Auth:** JWT Bearer token  
**Format:** `Authorization: Bearer <access_token>`

### 5.1 Authentication

| Method | Endpoint | Body | Auth? |
|--------|----------|------|-------|
| POST | `/auth/register` | `{name, email, password}` | No |
| POST | `/auth/login` | `{email, password}` | No |
| POST | `/auth/refresh` | `{refreshToken}` | No |
| POST | `/auth/forgot-password` | `{email}` | No |
| POST | `/auth/reset-password` | `{token, password}` | No |
| GET  | `/auth/me` | — | Yes |

**Login response:**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { "id", "name", "email", "role", "avatar" }
}
```

Store `accessToken` in memory, `refreshToken` in SecureStore.

### 5.2 Destinations

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/destinations` | List all destinations |
| GET | `/destinations/:slug` | Single destination detail |

### 5.3 Tours

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/tours` | List tours (supports filters) |
| GET | `/tours/:slug` | Tour detail |
| GET | `/tours/:slug/departures` | Available departure dates |

Query params for list: `?destination=&minPrice=&maxPrice=&duration=&page=&limit=`

### 5.4 Vehicles

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/vehicles` | List rentals |
| GET | `/vehicles/:slug` | Vehicle detail |

### 5.5 Stays (Accommodations)

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/stays` | List accommodations |
| GET | `/stays/:slug` | Stay detail |

### 5.6 Search

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/search` | Cross-category search |

Query: `?q=&type=tour|vehicle|stay&page=&limit=`

### 5.7 Bookings

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/bookings` | Yes | Create booking |
| GET  | `/bookings` | Yes | Traveler's bookings |
| GET  | `/bookings/:id` | Yes | Booking detail |
| POST | `/bookings/:id/confirm` | Yes | Confirm booking |
| POST | `/bookings/:id/cancel` | Yes | Cancel booking |

### 5.8 Booking Requests (non-payable listings)

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/booking-requests` | Yes |
| GET  | `/booking-requests` | Yes |
| GET  | `/booking-requests/:id` | Yes |

### 5.9 Reviews

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET  | `/reviews?listingId=&type=` | No | Get reviews |
| POST | `/reviews` | Yes | Create review |

### 5.10 Wishlist

| Method | Endpoint | Auth |
|--------|----------|------|
| GET  | `/wishlist` | Yes |
| POST | `/wishlist` | Yes |
| DELETE | `/wishlist/:id` | Yes |

### 5.11 Conversations (Messaging)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET  | `/conversations` | Yes |
| POST | `/conversations` | Yes |
| GET  | `/conversations/:id` | Yes |
| POST | `/conversations/:id/messages` | Yes |

### 5.12 Notifications

| Method | Endpoint | Auth |
|--------|----------|------|
| GET  | `/notifications` | Yes |
| POST | `/notifications/read/:id` | Yes |

### 5.13 Account (Traveler Profile)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET  | `/account` | Yes |
| PATCH | `/account` | Yes |
| PATCH | `/account/settings` | Yes |

### 5.14 Media Upload

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/media/upload` | Yes | Cloudinary upload |

Returns: `{ url, publicId }`

### 5.15 Geo & FX

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/geo` | No | Location hints |
| GET | `/fx` | No | Exchange rates display |

### 5.16 Payments

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/payments/initiate` | Yes |
| GET  | `/payments/:id/status` | Yes |

---

## 6. Auth Flow (Mobile)

```
1. Login → receive accessToken (15m) + refreshToken (7d)
2. Store accessToken in memory (React context / Zustand)
3. Store refreshToken in expo-secure-store
4. Attach accessToken to every request header
5. On 401 → call /auth/refresh → get new accessToken
6. On refresh fail → force logout, clear store
```

```bash
npx expo install expo-secure-store
```

---

## 7. Recommendations

### Architecture

- **State:** Zustand for auth + wishlist + cart. React Query (TanStack) for server data.
- **API client:** Single `lib/api.ts` with axios interceptor for token refresh.
- **Navigation:** Expo Router tabs — add screens as needed, don't diverge from file-router pattern.
- **Forms:** React Hook Form + Zod (already on web, keep consistent).

### Must-Have for MVP

- [ ] Auth screens (login, register, forgot password)
- [ ] Home feed (featured tours, destinations)
- [ ] Search + filter
- [ ] Listing detail (tour / stay / vehicle)
- [ ] Booking flow
- [ ] Booking history
- [ ] Profile / account settings
- [ ] Wishlist
- [ ] Push notifications (Expo Notifications)

### Dependencies to Add

```bash
# API + State
npx expo install axios @tanstack/react-query zustand

# Auth storage
npx expo install expo-secure-store

# Fonts
npx expo install @expo-google-fonts/manrope expo-font

# Maps
npx expo install react-native-maps

# Push notifications
npx expo install expo-notifications expo-device expo-constants

# Image handling
npx expo install expo-image expo-image-picker

# Forms
npm install react-hook-form zod @hookform/resolvers

# Error tracking
npm install @sentry/react-native
```

### Branding Alignment Fixes Needed

1. Update `constants/theme.ts` tint from `#0a7ea4` → `#0285c9`
2. Replace default Expo assets in `assets/images/` with WeMongolia brand assets
3. Update `app.json` splash color `#E6F4FE` (already correct)
4. Configure Manrope as default font in root `_layout.tsx`

### API Integration Pattern

```ts
// lib/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Add 401 interceptor for token refresh here

export default api;
```

### Security

- Never store raw passwords or JWT secrets in mobile
- Use `expo-secure-store` for all tokens (not AsyncStorage)
- Validate all user input with Zod before sending to API
- Enable certificate pinning before production release

---

## 8. EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build preview (internal testing)
eas build --platform all --profile preview

# Production build
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

EAS project: `erdenejargal-dev` (app.json `owner` field)  
Project ID: `d6075663-8718-43fb-addf-f7435cee2121`

---

## 9. Contacts

| Role | Contact |
|------|---------|
| Backend / API | Get from team lead |
| Design / Branding | Get from team lead |
| Expo / EAS account | eegiitomah@gmail.com |
