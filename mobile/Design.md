# TRU — Design System for Claude Code
# Source: Brickclay / Behance · AI-Powered Travel Companion · 2026

TRU is an AI-powered travel companion app. Every UI decision must reflect its
core character: calm, curated, trustworthy — not loud or flashy. The lime accent
is purposeful, never decorative noise. Form follows function, function follows user.

Read this file completely before generating any UI code, component, or screen.

---

## 1. Project Identity

| Property     | Value                                      |
|--------------|--------------------------------------------|
| Platform     | iOS mobile app (iPhone 15 Pro target)      |
| Design Year  | 2026                                       |
| Aesthetic    | Nature-grounded, AI-first, calm precision  |
| Agency       | Brickclay                                  |
| Scope        | 60+ screens, 10+ flows                     |
| Flows        | Onboarding, Dashboard, AI Assistant, Search & Explore, |
|              | Destination Detail, Booking, Flights, Stays, Cars,     |
|              | Trains, Events, My Trips, Location & Maps, Payment,    |
|              | User Profile                               |

---

## 2. Color Tokens

### Primary Palette

| Token                  | Hex       | Usage                                              |
|------------------------|-----------|----------------------------------------------------|
| `color-blue-primary`   | `#0085C9` | THE main color: CTAs, active pills, AI tags, links |
| `color-blue-dark`      | `#005A90` | Hover/pressed state of primary blue                |
| `color-navy`           | `#003D5C` | Dark cards, nav bar dark, hero backgrounds         |
| `color-navy-deep`      | `#002030` | Deepest dark: full-bleed hero overlays             |
| `color-blue-light`     | `#D0ECFA` | Highlight tint, selected input fill                |
| `color-bg-page`        | `#EFF7FD` | Page background — cool blue-tinted, NOT pure white |
| `color-surface-white`  | `#FFFFFF` | Card surfaces, inputs, bottom sheets               |
| `color-border-default` | `#C5DCF0` | Subtle borders — 0.5px everywhere                  |
| `color-border-emphasis`| `#A8D0EE` | Hover/focused border state                         |

### Text Palette

| Token               | Hex       | Usage                           |
|---------------------|-----------|---------------------------------|
| `color-text-primary`| `#1A1A1A` | Headlines, labels, primary body |
| `color-text-muted`  | `#5C6D78` | Secondary body, descriptions    |
| `color-text-subtle` | `#A0B4C0` | Captions, placeholders, hints   |
| `color-text-inverse`| `#FFFFFF` | Text on dark navy backgrounds   |
| `color-text-accent` | `#7EC8F0` | Accent text on dark backgrounds |

### Semantic / Status

| Token              | Hex       | Usage                           |
|--------------------|-----------|---------------------------------|
| `color-success`    | `#1FAA70` | Confirmed badge, success states |
| `color-warning`    | `#F59B23` | Deals, urgency ("3 Days Left")  |
| `color-error`      | `#E84040` | Errors, cancellations           |

### Rules
- NEVER use pure black (`#000`) anywhere in the app UI.
- Page background is `#EFF7FD` — this cool blue tint is essential to the brand feel.
- `#0085C9` is the ONLY accent color. Do not introduce greens, purples, or warm tones as accents.
- On dark navy backgrounds (`#003D5C`), body text is `rgba(255,255,255,0.60)`, headings are `#FFFFFF`, accent highlights are `#7EC8F0`.
- Borders are always `0.5px solid #C5DCF0`. Never use `1px` borders except for selected/active states.
- "See All" links and interactive text use `#0085C9`, never underlined.

---

## 3. Typography

### Font Family
- **Primary UI font**: Nunito or Outfit (both rounded geometric sans-serifs)
  - In SwiftUI: use SF Pro Rounded (`.rounded` design variant)
  - In React Native / web: `'Nunito', 'Outfit', system-ui, sans-serif`
- **Brand wordmark**: Custom bubbly organic script (do not recreate — use SVG asset)

### Type Scale

| Role        | Size  | Weight | Line Height | Letter Spacing | Usage                        |
|-------------|-------|--------|-------------|----------------|------------------------------|
| Display     | 28px  | 700    | 1.15        | -0.5px         | Hero headlines               |
| Heading 1   | 22px  | 700    | 1.2         | -0.3px         | Screen titles                |
| Heading 2   | 18px  | 700    | 1.25        | -0.2px         | Section titles               |
| Heading 3   | 15px  | 600    | 1.3         | 0              | Card titles, list headers    |
| Body        | 13px  | 400    | 1.5         | 0              | Descriptions, body copy      |
| Label       | 13px  | 600    | 1.3         | 0              | Button text, strong labels   |
| Caption     | 11px  | 400    | 1.4         | 0              | Metadata, timestamps, hints  |
| Overline    | 10px  | 500    | 1.2         | +0.07em        | Section labels (UPPERCASE)   |
| Micro       | 9px   | 500    | 1.2         | 0              | Badges, nav labels           |

### Rules
- Use `700` for all headers. Use `600` for labels/buttons. Use `400` for body.
- Never use `font-weight: 300` — too light for this aesthetic.
- Negative letter spacing (`-0.2px` to `-0.5px`) on display/H1 only.
- Overline text is ALWAYS uppercase with `letter-spacing: 0.07em`.

---

## 4. Spacing & Layout

### Spacing Scale (4pt base grid)
```
4px   — Icon gaps, micro padding
8px   — Internal component gaps
12px  — Card internal padding (vertical)
16px  — Card internal padding (horizontal), standard gap
20px  — Screen horizontal padding (content safe area)
24px  — Section spacing
32px  — Large section breaks
48px  — Hero section padding
```

### Screen Layout
- **Horizontal page padding**: 20px on each side
- **Status bar height**: 54px (iPhone 15 Pro with Dynamic Island)
- **Bottom safe area**: 34px
- **Bottom nav height**: 72px total (icon area 44px + safe area 28px)
- **Content starts at**: 110px from top (status bar + nav header)

### Grid
- Destination cards: 2-column grid, gap 12px
- Category filters: horizontal scroll, gap 8px, no clip
- Stats row: 3-equal-column flex, dividers between

---

## 5. Border Radius Tokens

| Token      | Value    | Usage                                          |
|------------|----------|------------------------------------------------|
| `r-pill`   | 100px    | Filter pills, CTAs, badges, search bar         |
| `r-xl`     | 20px     | Large destination cards, bottom sheet tops     |
| `r-lg`     | 16px     | Standard cards, trip cards, AI banners         |
| `r-md`     | 12px     | Modals, preference sheets                      |
| `r-sm`     | 8px      | Text inputs, budget selectors, small cards     |
| `r-xs`     | 6px      | Badge chips, tag labels, AI overline tag       |

### Rules
- NEVER use sharp corners (0 radius) anywhere in TRU.
- The minimum radius for any visible container is `r-xs` (6px).
- Full-bleed images inside rounded cards: use `overflow: hidden` on the card.

---

## 6. Shadows & Elevation

TRU uses very subtle shadows — almost none. The design relies on background
color differentiation rather than shadows.

| Level  | Value                              | Usage                              |
|--------|------------------------------------|------------------------------------|
| None   | `none`                             | Most cards, inputs                 |
| Subtle | `0 1px 4px rgba(0,0,0,0.06)`       | Floating bottom sheet, modals      |
| Float  | `0 4px 16px rgba(0,0,0,0.10)`      | Active card lift, selected state   |

**Never use**: Heavy drop shadows, colored shadows, glow effects.

---

## 7. Components

### 7.1 Filter Pills (Tab Selector)
- Shape: `r-pill` (100px radius), height 34px
- Active state: `background: #0085C9`, `color: #FFFFFF`, `font-weight: 600`
- Inactive state: `background: #EFF7FD`, `color: #5C6D78`, `border: 0.5px solid #C5DCF0`
- Dark variant (on dark bg): `background: #003D5C`, `color: #7EC8F0`
- Padding: `8px 16px`
- Examples: "Trending", "Top Picks", "Nearby", "All", "Popular", "Saved", "Plans"

### 7.2 Destination Cards
- Radius: `r-lg` (16px)
- Image area: full-bleed, min-height 120px, `object-fit: cover`
- Arrow button (top-right of image): 28px circle, `background: rgba(0,0,0,0.45)`, white arrow icon
- Title: `font-size: 13px`, `font-weight: 600`, `color: #1A1A1A`
- Subtitle (city, country): `font-size: 11px`, `color: #5C6D78`
- Card background: `#FFFFFF`, `border: 0.5px solid #D5E8F5`
- Bottom padding: `10px 12px`
- Rating badge (when present): `background: rgba(0,0,0,0.55)`, `color: #fff`, pill shape, overlaid on image

### 7.3 Trip Planner Banner (Progress Card)
- Background: `#003D5C`
- Radius: `r-lg` (16px)
- Layout: trip name left, countdown badge ("5 Days Left") right
- Countdown badge: `background: #0085C9`, `color: #FFFFFF`, `font-weight: 700`, pill
- Trip name: `font-size: 13px`, `font-weight: 600`, `color: #FFFFFF`
- Progress label: `font-size: 11px`, `color: rgba(255,255,255,0.55)`, e.g. "68% Ready"
- Section label above: `font-size: 10px`, `color: #7EC8F0`, `font-weight: 500`, uppercase

### 7.4 AI Assistant Banner Card
- Background: `#003D5C`
- AI tag chip: `background: #0085C9`, `color: #FFFFFF`, `border-radius: 6px`, `font-size: 9px`, `font-weight: 700`, `padding: 3px 8px`, text: "AI ASSISTANT"
- Headline: `font-size: 14px`, `font-weight: 700`, `color: #FFFFFF`
- Sub-headline: `font-size: 12px`, `color: rgba(255,255,255,0.55)`
- CTA button: `background: #0085C9`, `color: #FFFFFF`, `border-radius: 100px`, `font-weight: 600`
- AI avatar icon: circular, `background: #0085C9`, with sparkle/robot icon in `#FFFFFF`

### 7.5 Search Bar
- Background: `#FFFFFF`
- Radius: `r-pill` (fully rounded)
- Border: `0.5px solid #C5DCF0`
- Height: 44px
- Leading icon: search icon (`#A0B4C0`, 18px)
- Placeholder: `color: #A0B4C0`
- Trailing filter button: 32px square with `r-sm` (8px), `background: #003D5C`, grid icon in `#7EC8F0`

### 7.6 Buttons

**Primary CTA (Blue)**
- Background: `#0085C9`
- Text: `#FFFFFF`, `font-weight: 600`, 14px
- Radius: `r-pill`
- Padding: `12px 24px`
- Height: 48px
- Pressed state: `background: #005A90`

**Primary CTA (Dark)**
- Background: `#003D5C`
- Text: `#7EC8F0`, `font-weight: 600`, 14px
- Radius: `r-pill`
- Padding: `12px 24px`
- Height: 48px

**Secondary / Outline**
- Background: `#FFFFFF`
- Border: `1.5px solid #003D5C`
- Text: `#003D5C`, `font-weight: 600`
- Radius: `r-pill`
- Height: 48px

**Minimum tap target**: 44×44pt (Apple HIG requirement — enforce strictly).

### 7.7 Bottom Navigation
- 5 items: Home, AI (sparkle), Globe/Map, Bookmark, Grid (more)
- Height: 72px total
- Background: `#FFFFFF`, `border-top: 0.5px solid #D5E8F5`
- Active icon: `background: #0085C9`, rounded square (10px radius), icon in `#FFFFFF`
- Inactive icon: `background: #EFF7FD`, icon in `#A0B4C0`
- Icon size: 22px
- Label: 9px, shown below icon for inactive, hidden for active

### 7.8 Text Inputs
- Background: `#FFFFFF`
- Border: `0.5px solid #C5DCF0`
- Focused border: `1px solid #0085C9`
- Radius: `r-sm` (8px)
- Height: 48px
- Label above: `font-size: 12px`, `color: #5C6D78`, `margin-bottom: 6px`
- Placeholder: `color: #A0B4C0`
- Padding: `0 14px`

### 7.9 Section Headers
- Title: `font-size: 16px`, `font-weight: 700`, `color: #1A1A1A`
- "See All" link: `font-size: 12px`, `font-weight: 600`, `color: #0085C9`
- Bottom margin: 12px before content

### 7.10 Stats Row
- Container: `background: #FFFFFF`, `border-radius: 14px`, `border: 0.5px solid #D5E8F5`
- 3 equal columns, separated by `0.5px solid #D5E8F5` vertical dividers
- Number: `font-size: 18px`, `font-weight: 700`, `color: #1A1A1A`
- Label: `font-size: 10px`, `color: #A0B4C0`, uppercase
- Padding per cell: `12px 8px`

### 7.11 List Items (Trip, Flight, Search Result)
- Height: 64px minimum
- Leading: thumbnail (48×48, `r-sm`) or icon badge
- Title: `font-size: 14px`, `font-weight: 600`, `color: #1A1A1A`
- Subtitle: `font-size: 12px`, `color: #5C6D78`
- Trailing: chevron (`#A0B4C0`) or price badge
- Separator: `0.5px solid #EBF3FA`, inset 64px from left

### 7.12 Status Badges
| Badge      | Background | Text      | Usage                        |
|------------|------------|-----------|------------------------------|
| Confirmed  | `#1FAA70`  | `#FFFFFF` | Booked/confirmed trips       |
| Days Left  | `#0085C9`  | `#FFFFFF` | Trip countdown               |
| Economy    | `#003D5C`  | `#7EC8F0` | Flight class                 |
| Save %     | `#FFF3DC`  | `#B87B0A` | Promotional deal             |
| In Progress| `#D0ECFA`  | `#005A90` | Drafts, planning             |

All badges: `border-radius: 100px`, `font-size: 10px`, `font-weight: 700`, `padding: 3px 10px`

### 7.13 Budget Selector (Segmented)
- Active: `background: #003D5C`, `color: #7EC8F0`, `font-weight: 600`
- Inactive: `background: #EFF7FD`, `color: #5C6D78`, `border: 0.5px solid #C5DCF0`
- Options: Budget / Standard / Luxury

### 7.14 Filter Bottom Sheet
- Handle bar: 4×32px, `background: #C5DCF0`, centered at top
- Sliders: `accent-color: #0085C9`
- Filter tag chips: same as filter pills (inactive style by default)
- Primary CTA at bottom: full-width, `#0085C9`

### 7.15 Map Screen
- Map pins: circular, `background: #003D5C`, inner dot `#0085C9`
- Transport toggles: `tint: #0085C9`

---

## 8. Flows & Screen Inventory

### 8.1 Onboarding / Auth
- Sign Up / Sign In screen: full-bleed destination photo with `gradient overlay` from
  transparent to `#0D2016` (bottom 60%), white form card overlaid
- Social auth buttons: full-width, `border: 0.5px solid #D8DDD0`, icon left
- "Sign Up with Apple": use SF Symbol `apple.logo`, respect Apple guidelines

### 8.2 Dashboard (Home) — 6 state variants
States: First launch, Trending, Upcoming journey, Active journey, Saved places, Empty

Home screen structure (top to bottom):
1. **User header**: avatar (40px circle) + "Your Location" label + city name + bell icon
2. **Filter pills row**: Trending / Top Picks / Nearby (horizontal scroll)
3. **Continue Planning banner** (if trip in progress): dark green card, lime badge
4. **Search bar** + filter button
5. **"Explore Cities" section** + sub-filters (All/Popular/Nearby/Top Picks)
6. **Destination card grid** (2 columns)
7. **Categories** section: horizontal icon chips
8. **AI banner** (when no active trip)
9. **Trip Planner card** (when trip active)

### 8.3 AI Assistant
- Entry: banner CTA on dashboard → full AI chat screen
- Chat bubbles: User = `background: #1B3D28`, `color: #FFFFFF`, trailing
- AI response = `background: #FFFFFF`, `border: 0.5px solid #E0E4D8`, leading
- AI avatar: circular lime badge with sparkle icon
- Itinerary result card: rendered inline in chat, dark green card
- Input bar: search-bar style, "Type a message..." placeholder, send arrow button

### 8.4 Search & Explore
- Search results: vertical list with thumbnail, name, location pin icon
- "Why these?" explainer link in muted text
- Filter panel: bottom sheet (see 7.14)
- Filter categories: Peaks / Forest / Historical / Island / Desert / Coastal

### 8.5 Destination Detail
- Hero: full-bleed photo, gradient overlay, back button (circular ghost)
- Trip count badge: "23 Travelers Joined This Trip"
- Rating: star + numeric, overlaid on image bottom-left
- Dates chip: dark green pill (e.g. "08 Feb – 10 Feb")
- Tab: Description / Tour Partners / Moments
- Tour partners: horizontal avatar stack with count

### 8.6 Booking Flow
- Date picker: calendar grid, `selected: #1B3D28 bg + #FFFFFF text`, `available: #F2F3EC`
- Today dot indicator: `#C5F135`
- Travel Type selector: pill group (Solo / Couple / Family / Group)
- Promo banner: destination photo + "20% OFF" badge + price in white

### 8.7 Flights
- Sort tabs: Lowest / Optimal / Fastest (pill group)
- Price calendar: horizontal scroll, selected date in dark green
- Flight row: airline logo + name / route (LHR → DXB) / time / duration / price
- Price badge: `background: #C5F135`, `color: #0D2016`, `font-weight: 700`
- "Track Price" toggle: `tint: #C5F135`
- "TRU Premium" upsell: small banner at bottom, dark green bg

### 8.8 My Trips
- Tab bar: Saved / Plans (pill style, full width)
- Sub-filter: All / Upcoming / Saved / Past
- Stats row: Countries / Saved Places / Upcoming (see 7.10)
- Trip card: full-bleed image, gradient overlay, "Confirmed" badge top-left,
  trip name, date range, airport + departure time, "View Itinerary" CTA

### 8.9 Location & Maps
- Map fills screen edge-to-edge
- Preference card floats over bottom 40% of map
- Map style: Map / Hybrid toggle (pill)
- Transportation Routes: toggle `on = #C5F135 tint`
- Flight Routes: toggle

### 8.10 Payment
- Card number display: styled card mockup, `background: #1B3D28`
- Card type logo (Mastercard/Visa): bottom right of card
- Payment methods list: PayPal / Card / Bank Transfer / Crypto Wallet
- Selected method: radio with `#C5F135` fill
- Pay button: lime, full-width

### 8.11 User Profile
- Avatar: 72px circle, online indicator dot
- Profile completion: "Travel AI Profile — 85% complete"
- Settings list: chevron rows (`#A8AFA0` trailing chevron)
- Logout: lime CTA button
- Cancel: secondary outline button

---

## 9. Iconography

- **Icon library**: Custom line icons, consistent 1.5px stroke weight, rounded line caps
- **Icon size**: 22px standard, 18px in lists/inputs, 28px in nav (active)
- **Icon color on light**: `#1B3D28` (active), `#A8AFA0` (inactive)
- **Icon color on dark**: `#C5F135` (active), `rgba(255,255,255,0.50)` (inactive)
- Icon categories in-app: Home, AI (sparkle), Globe, Bookmark, Grid, Search,
  Bell, Flights (airplane), Stays (building), Cars, Trains, Events,
  Calendar, Users, Arrow-up-right, Bookmark, Share, Back-chevron
- Arrow button on cards: ALWAYS `arrow-up-right` (northeast diagonal), not right arrow

---

## 10. Motion & Animation

### Principles
- Calm, purposeful — never flashy or distracting
- All animations feel "organic" not mechanical
- Match Apple HIG spring physics

### Specs
| Interaction              | Duration | Curve                        |
|--------------------------|----------|------------------------------|
| Screen push/pop          | 350ms    | Spring (response: 0.35, damping: 0.75) |
| Modal present (bottom)   | 400ms    | Spring (response: 0.40, damping: 0.80) |
| Pill tab switch          | 200ms    | ease-in-out                  |
| Card press (scale)       | 120ms    | ease-in (scale 0.97)         |
| Card release             | 200ms    | spring bounce back           |
| Banner slide in          | 300ms    | ease-out                     |
| Filter bottom sheet      | 350ms    | Spring (response: 0.38, damping: 0.78) |

### Rules
- ALL tappable elements must have a pressed-state visual response (scale, color shift, or opacity).
- NO loading spinners — use skeleton screens with animated shimmer (`#E8EDE0` → `#F2F3EC`).
- Skeleton shimmer direction: left to right, 1.2s loop.
- Page transitions: horizontal push for drill-down, bottom-up for modals/sheets.

---

## 11. Imagery Guidelines

- **Photography style**: Natural light, travel photography, real destinations
- **Preferred palettes in photos**: Warm greens, golden light, blues — aligns with brand
- **Aspect ratios**:
  - Destination cards: `3:2` (landscape)
  - Hero/detail screens: `4:3` or full-bleed
  - Avatar/profile: `1:1` (circle crop)
- **Gradient overlays on photos**:
  - Card bottom overlay: `linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)`
  - Hero screen overlay: `linear-gradient(to top, #0D2016 0%, transparent 70%)`
- NEVER use stock illustration or cartoon art — real photography only

---

## 12. Accessibility (Apple HIG)

- Minimum tap target: **44×44pt** — non-negotiable
- Color contrast: all text must meet **WCAG AA** (4.5:1 for normal text, 3:1 for large)
  - `#C5F135` on `#1B3D28` passes (ratio ~7.1:1) ✓
  - `#1A1A18` on `#F2F3EC` passes ✓
  - `#6B7065` on `#FFFFFF` passes ✓
- Support Dynamic Type — use relative units (sp/pt), not fixed px
- All icons must have `accessibilityLabel`
- Destructive actions require confirmation (`Alert` with red confirm button)
- VoiceOver: all interactive elements must be focusable and labeled

---

## 13. Claude Code Instructions

When building any TRU screen or component:

1. **Read this file first** — all color values, radii, and component specs are defined here
2. **Page background is `#EFF7FD`** — never white or green as the base page color
3. **`#0085C9` is your ONLY accent** — don't introduce greens, oranges, or warm tones
4. **Border radius is always rounded** — minimum 6px, never 0
5. **Borders are always `0.5px`** — never `1px` unless it's a selected/active state
6. **Typography**: Use SF Pro Rounded in SwiftUI (`Font.system(.body, design: .rounded)`)
7. **Bottom nav**: Always 5 items, `#0085C9` active icon bg with white icon, consistent across all screens
8. **Cards**: White surface on `#EFF7FD` page background — no card shadows needed
9. **Dark cards**: Use `#003D5C` with `#7EC8F0` accents and `rgba(255,255,255,0.6)` body text
10. **CTA hierarchy**: Blue button = primary, Navy = secondary CTA, Outline = tertiary
11. **AI elements**: Always use `#0085C9` chip tag "AI ASSISTANT" before AI-powered features
12. **Filter pills**: Horizontal scroll container, no page-level wrapping
13. **Minimum sprint for any new screen**: header + content + bottom nav — never skip the nav
14. **Confirmed state**: Always use `#1FAA70` green badge — not blue, not navy

---

## 14. Anti-Patterns (Never Do These)

- ❌ Pure white `#FFFFFF` as page background
- ❌ Green, orange, or purple as accent colors — `#0085C9` only
- ❌ Sharp corners (0 border-radius)
- ❌ Heavy drop shadows
- ❌ All-caps button labels (sentence case: "Start planning", not "START PLANNING")
- ❌ More than 2 font weights on a single screen
- ❌ Centered body copy (left-aligned only, except hero overlays)
- ❌ Hamburger/sidebar navigation — bottom tabs only
- ❌ Floating action button (FAB)
- ❌ Loading spinners — use skeleton screens with `#D0ECFA` → `#EFF7FD` shimmer
- ❌ Illustrations or cartoons — photography only
- ❌ Dark mode as a theme (navy cards are components, not a dark mode)