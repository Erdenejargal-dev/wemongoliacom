# WeMongolia — Backend Architecture

> **Status:** Documentation only. Frontend UI is complete. Backend implementation pending.  
> **Stack assumption:** Node.js · Next.js API Routes or Express · MongoDB (Mongoose) · JWT auth

---

## 1. Platform Overview

WeMongolia is a dual-sided travel marketplace:

| Side | Role | Key actions |
|------|------|-------------|
| **Traveler** | Discovers and books experiences | Browse tours, book, message host, leave reviews |
| **Provider** | Lists and manages services | Onboard, create listings, manage bookings, view analytics |

Providers can offer one or more service types: **tour_operator**, **car_rental**, **accommodation**.

---

## 2. Database Models

### 2.1 User

Core authentication record for both travelers and providers.

```
Model: User

Fields:
  _id           ObjectId  (PK)
  name          String    required
  email         String    required, unique, indexed
  passwordHash  String    required (bcrypt)
  avatar        String    (URL)
  phone         String
  country       String
  role          Enum      ['traveler', 'provider', 'admin']  default: 'traveler'
  emailVerified Boolean   default: false
  createdAt     Date
  updatedAt     Date

Relationships:
  hasOne  Provider    (if role === 'provider')
  hasMany Booking     (as traveler)
  hasMany Review      (as author)
  hasMany Conversation

Indexes:
  email (unique)
```

---

### 2.2 Provider

Business profile attached to a User. One user → one provider record.

```
Model: Provider

Fields:
  _id            ObjectId
  userId         ObjectId  ref: User  (unique)
  name           String    required
  slug           String    unique, indexed  (e.g. "gobi-adventure-tours")
  description    String
  providerTypes  [Enum]    ['tour_operator', 'car_rental', 'accommodation']
  location       String
  phone          String
  email          String
  website        String
  logo           String    (URL)
  coverImage     String    (URL)
  languages      [String]
  rating         Number    default: 0
  reviewCount    Number    default: 0
  verified       Boolean   default: false
  completedOnboarding Boolean default: false
  createdAt      Date
  updatedAt      Date

Relationships:
  belongsTo User
  hasMany   Tour
  hasMany   Vehicle
  hasMany   Accommodation
  hasMany   Booking       (as provider side)
  hasMany   Review        (received)
  hasMany   Conversation

Indexes:
  userId (unique)
  slug (unique)
  providerTypes
  location
```

---

### 2.3 Tour

A bookable tour or experience listed by a tour_operator provider.

```
Model: Tour

Fields:
  _id            ObjectId
  providerId     ObjectId  ref: Provider  indexed
  title          String    required
  slug           String    unique, indexed
  description    String
  shortDesc      String    (for cards)
  category       String    (e.g. "Adventure", "Cultural", "Wildlife")
  location       String    indexed
  region         String    (e.g. "Gobi", "Khuvsgul", "Ulaanbaatar")
  price          Number    required  (per person, USD)
  duration       String    (e.g. "3 days")
  durationDays   Number    (numeric, for filtering)
  maxGuests      Number
  minGuests      Number    default: 1
  images         [String]  (URLs)
  coverImage     String    (URL)
  highlights     [String]
  included       [String]  (what's included)
  excluded       [String]  (what's not)
  itinerary      [{
    day:   Number
    title: String
    desc:  String
  }]
  meetingPoint   String
  languages      [String]
  difficulty     Enum      ['Easy', 'Moderate', 'Challenging']
  rating         Number    default: 0
  reviewCount    Number    default: 0
  status         Enum      ['draft', 'published', 'archived']  default: 'draft'
  featured       Boolean   default: false
  createdAt      Date
  updatedAt      Date

Relationships:
  belongsTo Provider
  hasMany   Booking
  hasMany   Review

Indexes:
  providerId
  slug (unique)
  location
  category
  status
  featured
  price
  durationDays
  rating
```

---

### 2.4 Vehicle

A rentable vehicle listed by a car_rental provider.

```
Model: Vehicle

Fields:
  _id          ObjectId
  providerId   ObjectId  ref: Provider  indexed
  name         String    required  (e.g. "Toyota Land Cruiser 200")
  slug         String    unique
  type         Enum      ['SUV', 'Van', 'Minibus', 'Sedan', '4x4']
  description  String
  images       [String]
  seats        Number
  pricePerDay  Number    (USD)
  transmission Enum      ['Manual', 'Automatic']
  withDriver   Boolean   default: false
  features     [String]  (e.g. "GPS", "AC", "Roof Rack")
  location     String
  status       Enum      ['available', 'rented', 'maintenance', 'archived']
  rating       Number    default: 0
  reviewCount  Number    default: 0
  createdAt    Date
  updatedAt    Date

Relationships:
  belongsTo Provider
  hasMany   Booking
  hasMany   Review

Indexes:
  providerId
  status
  type
```

---

### 2.5 Accommodation

A property listed by an accommodation provider (camps, lodges, hotels).

```
Model: Accommodation

Fields:
  _id          ObjectId
  providerId   ObjectId  ref: Provider  indexed
  name         String    required
  slug         String    unique
  type         Enum      ['ger_camp', 'hotel', 'lodge', 'hostel', 'resort']
  description  String
  images       [String]
  location     String    indexed
  region       String
  pricePerNight Number   (USD)
  maxGuests    Number
  amenities    [String]  (e.g. "WiFi", "Hot Shower", "Restaurant")
  checkInTime  String
  checkOutTime String
  rating       Number    default: 0
  reviewCount  Number    default: 0
  status       Enum      ['draft', 'published', 'archived']
  createdAt    Date
  updatedAt    Date

Relationships:
  belongsTo Provider
  hasMany   Booking
  hasMany   Review

Indexes:
  providerId
  location
  status
```

---

### 2.6 Booking

Unified booking record that references the booked resource (Tour, Vehicle, or Accommodation).

```
Model: Booking

Fields:
  _id              ObjectId
  bookingRef       String    unique, indexed  (e.g. "WM-2026-00142")
  travelerId       ObjectId  ref: User
  providerId       ObjectId  ref: Provider

  # Polymorphic reference to the booked item
  listingType      Enum      ['tour', 'vehicle', 'accommodation']
  listingId        ObjectId  (ref to Tour | Vehicle | Accommodation)

  # Snapshot of booked item at time of booking (in case listing changes)
  listingSnapshot  {
    title:    String
    location: String
    price:    Number
    image:    String
  }

  # Booking details
  startDate        Date      required
  endDate          Date      (for vehicles and accommodations)
  guests           Number    required
  pricePerUnit     Number    (price per person or per night at booking time)
  nights           Number    (for accommodations)
  subtotal         Number
  serviceFee       Number
  total            Number

  # Traveler details captured at checkout
  travelerName     String
  travelerEmail    String
  travelerPhone    String
  travelerCountry  String
  specialRequests  String

  # Status
  status           Enum      ['pending', 'confirmed', 'cancelled', 'completed']
                             default: 'pending'
  cancelledAt      Date
  cancelReason     String
  completedAt      Date

  # Payment
  paymentStatus    Enum      ['unpaid', 'paid', 'refunded']  default: 'unpaid'
  paymentMethod    String
  paymentRef       String    (payment gateway reference)

  createdAt        Date
  updatedAt        Date

Relationships:
  belongsTo User     (traveler)
  belongsTo Provider
  belongsTo Tour | Vehicle | Accommodation  (polymorphic via listingType + listingId)
  hasOne    Review   (post-completion)

Indexes:
  travelerId
  providerId
  listingId
  bookingRef (unique)
  status
  startDate
```

---

### 2.7 Review

Reviews are left by travelers after a booking is completed.

```
Model: Review

Fields:
  _id          ObjectId
  bookingId    ObjectId  ref: Booking  unique  (one review per booking)
  authorId     ObjectId  ref: User     (traveler)
  providerId   ObjectId  ref: Provider
  listingType  Enum      ['tour', 'vehicle', 'accommodation']
  listingId    ObjectId
  rating       Number    min: 1, max: 5
  comment      String
  providerReply String   (optional host response)
  createdAt    Date

Relationships:
  belongsTo Booking
  belongsTo User     (author)
  belongsTo Provider

Indexes:
  listingId
  providerId
  authorId
  bookingId (unique)
```

---

### 2.8 Conversation

A message thread between a traveler and a provider.

```
Model: Conversation

Fields:
  _id          ObjectId
  travelerId   ObjectId  ref: User
  providerId   ObjectId  ref: Provider

  # Optional: linked to a specific listing
  listingType  Enum      ['tour', 'vehicle', 'accommodation']  optional
  listingId    ObjectId  optional

  lastMessage  String    (preview)
  lastMessageAt Date
  unreadCount  { traveler: Number, provider: Number }
  createdAt    Date

Relationships:
  belongsTo User     (traveler)
  belongsTo Provider
  hasMany   Message

Indexes:
  travelerId
  providerId
  lastMessageAt (desc)
```

---

### 2.9 Message

Individual messages inside a Conversation.

```
Model: Message

Fields:
  _id              ObjectId
  conversationId   ObjectId  ref: Conversation  indexed
  senderId         ObjectId  ref: User
  senderRole       Enum      ['traveler', 'provider']
  text             String
  attachments      [String]  (URLs, optional)
  readAt           Date      (null = unread)
  createdAt        Date

Relationships:
  belongsTo Conversation
  belongsTo User (sender)

Indexes:
  conversationId
  createdAt
```

---

### 2.10 Destination

Editorial content pages for location-based discovery.

```
Model: Destination

Fields:
  _id          ObjectId
  name         String    required
  slug         String    unique, indexed
  region       String
  country      String    default: 'Mongolia'
  description  String
  longDesc     String    (rich text / markdown)
  heroImage    String    (URL)
  images       [String]
  highlights   [String]
  activities   [String]
  travelTips   [String]
  bestTimeToVisit String
  featured     Boolean   default: false
  createdAt    Date
  updatedAt    Date

Relationships:
  hasManyThrough Tour  (via Tour.region or Tour.location)

Indexes:
  slug (unique)
  featured
```

---

## 3. API Endpoints

Base URL: `/api/v1`

All protected routes require `Authorization: Bearer <JWT>`.

---

### 3.1 Auth

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, returns JWT |
| POST | `/auth/logout` | Yes | Invalidate session |
| GET | `/auth/me` | Yes | Get current user profile |
| PATCH | `/auth/me` | Yes | Update profile |
| POST | `/auth/change-password` | Yes | Change password |

**POST /auth/register** — Request:
```json
{
  "name": "Munkh-Erdene",
  "email": "munkh@gmail.com",
  "password": "SecurePass123",
  "role": "traveler"
}
```
Response:
```json
{
  "token": "eyJhbGci...",
  "user": { "_id": "...", "name": "Munkh-Erdene", "email": "...", "role": "traveler" }
}
```

---

### 3.2 Tours (Public)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/tours` | No | List all published tours (paginated, filterable) |
| GET | `/tours/:slug` | No | Get single tour by slug |
| GET | `/tours/featured` | No | Get featured tours for homepage |

**GET /tours** — Query params:
```
?location=Gobi
&category=Adventure
&minPrice=100
&maxPrice=1000
&duration=3         (days)
&rating=4
&guests=2
&page=1
&limit=12
&sort=price_asc | price_desc | rating | newest
```

Response:
```json
{
  "data": [ { "_id": "...", "title": "Gobi Explorer", "slug": "gobi-explorer", "price": 299, "duration": "5 days", "rating": 4.8, "coverImage": "...", "location": "South Gobi", "provider": { "name": "Gobi Adventure Tours", "slug": "gobi-adventure-tours" } } ],
  "pagination": { "page": 1, "limit": 12, "total": 48, "pages": 4 }
}
```

---

### 3.3 Destinations (Public)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/destinations` | No | List all destinations |
| GET | `/destinations/:slug` | No | Get destination + featured tours in that region |

**GET /destinations/:slug** — Response:
```json
{
  "destination": {
    "_id": "...",
    "name": "Gobi Desert",
    "slug": "gobi-desert",
    "heroImage": "...",
    "description": "...",
    "highlights": ["Flaming Cliffs", "Sand Dunes"],
    "activities": ["Camel Riding", "Fossil Hunting"],
    "travelTips": ["Bring sunscreen", "Best in May–Sept"]
  },
  "tours": [ { "title": "...", "slug": "...", "price": 299, ... } ]
}
```

---

### 3.4 Hosts / Providers (Public)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/hosts` | No | List all verified providers |
| GET | `/hosts/:slug` | No | Get provider profile + their listings |

**GET /hosts/:slug** — Response:
```json
{
  "provider": {
    "name": "Gobi Adventure Tours",
    "slug": "gobi-adventure-tours",
    "logo": "...",
    "coverImage": "...",
    "location": "Ulaanbaatar",
    "rating": 4.9,
    "reviewCount": 112,
    "languages": ["English", "Mongolian"],
    "providerTypes": ["tour_operator"]
  },
  "tours": [...],
  "reviews": [...]
}
```

---

### 3.5 Bookings

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/bookings` | Traveler | Create a new booking |
| GET | `/bookings/me` | Traveler | Get traveler's own bookings (trips) |
| GET | `/bookings/:id` | Traveler/Provider | Get single booking detail |
| PATCH | `/bookings/:id/cancel` | Traveler | Cancel a booking |

**POST /bookings** — Request:
```json
{
  "listingType": "tour",
  "listingId": "tour_abc123",
  "startDate": "2026-07-15",
  "guests": 2,
  "travelerName": "Munkh Erdene",
  "travelerEmail": "munkh@gmail.com",
  "travelerPhone": "+97699001234",
  "travelerCountry": "Mongolia",
  "specialRequests": "Vegetarian meals preferred"
}
```

Response:
```json
{
  "booking": {
    "_id": "...",
    "bookingRef": "WM-2026-00142",
    "status": "pending",
    "total": 648,
    "listingSnapshot": { "title": "Gobi Explorer", "location": "South Gobi", "price": 299 }
  }
}
```

---

### 3.6 Reviews

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/reviews` | Traveler | Submit a review (booking must be completed) |
| GET | `/reviews?listingId=&listingType=` | No | Get reviews for a listing |
| PATCH | `/reviews/:id/reply` | Provider | Provider replies to review |

**POST /reviews** — Request:
```json
{
  "bookingId": "booking_abc",
  "rating": 5,
  "comment": "Incredible experience! Highly recommend."
}
```

---

### 3.7 Messaging

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/conversations` | Yes | List all conversations for current user |
| POST | `/conversations` | Yes | Start a new conversation |
| GET | `/conversations/:id/messages` | Yes | Get messages in a conversation |
| POST | `/conversations/:id/messages` | Yes | Send a message |
| PATCH | `/conversations/:id/read` | Yes | Mark messages as read |

**POST /conversations** — Request:
```json
{
  "providerId": "provider_abc",
  "listingType": "tour",
  "listingId": "tour_abc123",
  "initialMessage": "Is this tour available in August?"
}
```

---

### 3.8 Account (Traveler)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/account/profile` | Traveler | Get traveler profile |
| PATCH | `/account/profile` | Traveler | Update profile info |
| PATCH | `/account/avatar` | Traveler | Upload avatar |
| PATCH | `/account/password` | Traveler | Change password |
| GET | `/account/notifications` | Traveler | Get notification settings |
| PATCH | `/account/notifications` | Traveler | Update notifications |

---

## 4. Booking System Design

### 4.1 Booking Flow

```
Traveler views listing
    → selects date + guests
        → POST /bookings          (status: pending)
            → Payment processed
                → PATCH /bookings/:id/confirm  (status: confirmed)
                    → Redirect to /booking/confirmation
                        → Provider notified
```

### 4.2 Booking Statuses

| Status | Description | Next states |
|--------|-------------|-------------|
| `pending` | Booking created, awaiting payment | `confirmed`, `cancelled` |
| `confirmed` | Payment received, booking active | `cancelled`, `completed` |
| `cancelled` | Cancelled by traveler or provider | — |
| `completed` | Trip date has passed | triggers: review eligible |

### 4.3 Availability Logic

For **Tours**: each tour has `maxGuests`. Sum of `guests` across `confirmed` bookings on a given `startDate` must not exceed `maxGuests`.

```
availableSlots = tour.maxGuests - SUM(booking.guests WHERE booking.listingId = tour._id AND booking.startDate = requestedDate AND booking.status IN ['pending', 'confirmed'])
```

For **Vehicles**: a vehicle is unavailable if any `confirmed` booking overlaps the requested date range.

For **Accommodations**: check room availability by date range overlap.

### 4.4 Price Calculation

```
subtotal   = pricePerUnit × guests (or nights)
serviceFee = CEIL(subtotal × 0.05)     // 5% platform fee
total      = subtotal + serviceFee
```

### 4.5 Booking Reference

Format: `WM-{YEAR}-{5-digit-sequence}` — generated server-side at creation.

---

## 5. Messaging System Design

### 5.1 Architecture

```
User ──── Conversation ──── Message
            │
            ├── travelerId
            ├── providerId
            └── optional: listingType + listingId
```

One **Conversation** per (traveler, provider) pair. If a traveler contacts the same provider about multiple listings, it goes into the same conversation thread (with listing context visible in the message).

### 5.2 Real-time (Future)

For MVP: polling (`GET /conversations/:id/messages?after=<timestamp>`).
For production: Socket.io room per `conversationId`. Provider and traveler join on connect.

### 5.3 Unread Counts

`Conversation.unreadCount.traveler` increments when a provider sends. Resets to 0 when traveler calls `PATCH /conversations/:id/read`.

---

## 6. Provider Dashboard APIs

All routes under `/provider/*` require `role === 'provider'` JWT.

### 6.1 Onboarding & Profile

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/provider/onboarding` | Complete onboarding (creates Provider record) |
| GET | `/provider/profile` | Get own provider profile |
| PATCH | `/provider/profile` | Update provider profile |
| POST | `/provider/logo` | Upload logo |
| POST | `/provider/cover` | Upload cover image |

---

### 6.2 Listings Management

**Tours:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/provider/tours` | List all own tours |
| POST | `/provider/tours` | Create new tour |
| GET | `/provider/tours/:id` | Get tour detail |
| PATCH | `/provider/tours/:id` | Update tour |
| DELETE | `/provider/tours/:id` | Archive tour |
| PATCH | `/provider/tours/:id/publish` | Publish draft tour |

**Vehicles:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/provider/vehicles` | List vehicles |
| POST | `/provider/vehicles` | Add vehicle |
| PATCH | `/provider/vehicles/:id` | Update vehicle |
| DELETE | `/provider/vehicles/:id` | Remove vehicle |

**Accommodations:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/provider/accommodations` | List properties |
| POST | `/provider/accommodations` | Add property |
| PATCH | `/provider/accommodations/:id` | Update property |
| DELETE | `/provider/accommodations/:id` | Remove property |

---

### 6.3 Bookings (Provider Side)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/provider/bookings` | All bookings for this provider |
| GET | `/provider/bookings?status=pending` | Filter by status |
| GET | `/provider/bookings?listingId=&listingType=` | Filter by listing |
| PATCH | `/provider/bookings/:id/confirm` | Confirm a pending booking |
| PATCH | `/provider/bookings/:id/cancel` | Cancel a booking |

**GET /provider/bookings** — Response:
```json
{
  "data": [
    {
      "_id": "...",
      "bookingRef": "WM-2026-00142",
      "travelerName": "Munkh Erdene",
      "listingSnapshot": { "title": "Gobi Explorer" },
      "startDate": "2026-07-15",
      "guests": 2,
      "total": 648,
      "status": "confirmed"
    }
  ],
  "pagination": { "page": 1, "total": 34 }
}
```

---

### 6.4 Analytics

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/provider/analytics/summary` | Key KPIs |
| GET | `/provider/analytics/revenue?period=30d` | Revenue over time |
| GET | `/provider/analytics/bookings?period=30d` | Bookings over time |

**GET /provider/analytics/summary** — Response:
```json
{
  "totalBookings": 142,
  "monthlyRevenue": 18400,
  "activeListings": 6,
  "averageRating": 4.8,
  "pendingBookings": 3,
  "completedBookings": 128
}
```

**GET /provider/analytics/revenue?period=30d** — Response:
```json
{
  "data": [
    { "date": "2026-02-10", "revenue": 1200 },
    { "date": "2026-02-11", "revenue": 860 }
  ]
}
```

---

### 6.5 Reviews (Provider Side)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/provider/reviews` | All reviews received |
| PATCH | `/provider/reviews/:id/reply` | Reply to a review |

---

### 6.6 Messages (Provider Side)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/provider/conversations` | All conversations |
| GET | `/provider/conversations/:id/messages` | Messages in thread |
| POST | `/provider/conversations/:id/messages` | Send reply |

---

## 7. Search System Design

### 7.1 Filterable Fields

| Filter | Type | Applied to |
|--------|------|-----------|
| `location` | String match / region | Tour, Vehicle, Accommodation |
| `category` | Enum | Tour |
| `minPrice` / `maxPrice` | Number range | Tour, Vehicle (per day), Accommodation (per night) |
| `duration` | Number (days) | Tour |
| `rating` | Minimum number | All |
| `guests` | Number (capacity check) | Tour, Accommodation |
| `startDate` / `endDate` | Availability check | All |
| `providerTypes` | Enum array | Provider listing |
| `languages` | Array includes | Tour, Provider |
| `difficulty` | Enum | Tour |
| `sort` | Enum | All |

### 7.2 Sort Options

```
price_asc     — price low to high
price_desc    — price high to low
rating        — highest rated first
newest        — createdAt desc
popular       — reviewCount desc
```

### 7.3 Search Index Strategy (MongoDB)

```js
// Tours collection compound index
{ status: 1, location: 1, price: 1, rating: -1, durationDays: 1 }

// Full-text search on title + description
{ title: 'text', description: 'text', location: 'text' }
```

For production: **Algolia** or **MongoDB Atlas Search** recommended for fuzzy matching and faceted search.

### 7.4 Destinations → Tours Relationship

When a traveler views `/destinations/gobi-desert`, the backend runs:

```
GET /tours?region=Gobi&status=published&sort=rating&limit=6
```

Tours are linked to destinations via the `Tour.region` field matching `Destination.region`.

---

## 8. Environment Variables Required

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/wemongolia

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# File Storage (images)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (booking confirmations)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@wemongolia.com

# Payment (future)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## 9. Implementation Priority

| Phase | Features |
|-------|----------|
| **Phase 1** | Auth · User model · Provider onboarding · Tour CRUD · Public tour listing |
| **Phase 2** | Booking flow · Booking confirmation emails · Traveler trips page |
| **Phase 3** | Messaging system · Provider dashboard APIs · Analytics |
| **Phase 4** | Reviews · Destinations CMS · Search/filter with Atlas Search |
| **Phase 5** | Payment integration · Real-time messaging · Admin panel |

Absolutely. Below is a **new backend architecture** for your platform that fixes the issues we identified, especially:

* availability / inventory
* tours vs vehicles vs accommodations differences
* messaging read state
* reviews safety
* provider multi-service logic
* payments / payouts
* destination linking
* notifications
* scalability

I’ll write it like a **clean backend architecture document** you can give to Claude or use as your actual technical spec.

---

# Backend Architecture for We Mongolia

## 1. Platform Overview

We Mongolia is a travel marketplace with two main roles:

* **Traveler**: searches, books, messages hosts, leaves reviews
* **Provider**: offers one or more services such as tours, vehicles, and accommodations

The backend must support three main listing types:

* **Tour / Experience**
* **Vehicle / Driver Rental**
* **Accommodation / Camp / Hotel**

A provider may offer one or multiple service types.

The system must support:

* provider onboarding
* listing creation and management
* search and discovery
* availability and inventory
* booking and checkout
* messaging
* reviews
* notifications
* provider dashboard analytics
* payments and payouts

---

## 2. Core Design Principles

### 2.1 Unified provider system

Use one `Provider` model for all businesses.

### 2.2 Separate listing models

Do not force all services into one generic listing table. Keep separate models:

* `Tour`
* `Vehicle`
* `Accommodation`

### 2.3 Separate inventory models

Do not store availability only in the listing. Use dedicated inventory / availability models:

* `TourDeparture`
* `VehicleAvailability`
* `RoomType`
* `RoomAvailability`

### 2.4 Polymorphic booking

Use one `Booking` model that can reference any listing type with:

* `listingType`
* `listingId`

### 2.5 Snapshot booking data

Store a booking snapshot so later edits to listings do not affect past bookings.

---

## 3. Recommended Database Choice

For this platform, a **relational database** is the better long-term choice.

Recommended:

* **PostgreSQL**
* ORM: **Prisma** or **Drizzle**

Why:

* many relationships
* booking constraints
* inventory logic
* reporting / analytics
* payouts and financial integrity

MongoDB can work for MVP, but PostgreSQL is a better fit for marketplace and reservation systems.

---

# 4. Main Models

---

## 4.1 User

Represents travelers and also provider owners.

**Fields**

* id
* firstName
* lastName
* email
* passwordHash
* phone
* country
* avatarUrl
* bio
* role (`traveler`, `provider_owner`, `admin`)
* isVerified
* createdAt
* updatedAt

**Relationships**

* hasMany bookings
* hasMany conversations as traveler
* hasMany reviews
* may own one or more providers

---

## 4.2 Provider

Represents a business or host.

**Fields**

* id
* ownerUserId
* name
* slug
* description
* logoUrl
* coverImageUrl
* email
* phone
* website
* city
* region
* country
* address
* languages
* providerTypes (`tour_operator`, `car_rental`, `accommodation`)
* ratingAverage
* reviewsCount
* totalGuestsHosted
* isVerified
* status (`draft`, `active`, `suspended`)
* createdAt
* updatedAt

**Relationships**

* belongsTo user owner
* hasMany tours
* hasMany vehicles
* hasMany accommodations
* hasMany conversations
* hasMany reviews through listings

---

## 4.3 Destination

Represents public destination pages.

**Fields**

* id
* name
* slug
* country
* region
* shortDescription
* description
* heroImageUrl
* gallery
* highlights
* activities
* tips
* bestTimeToVisit
* weatherInfo
* createdAt
* updatedAt

**Relationships**

* hasMany tours
* hasMany accommodations
* may relate to vehicles if needed

Important: listings should reference `destinationId`, not only raw text region names.

---

# 5. Listing Models

---

## 5.1 Tour

Used for tours and experiences.

**Fields**

* id
* providerId
* destinationId
* slug
* title
* shortDescription
* description
* category
* experienceType
* durationDays
* durationNights
* difficulty
* meetingPoint
* pickupIncluded
* cancellationPolicy
* languages
* maxGuests
* minGuests
* ageRestrictions
* priceType (`per_person`, `private_group`, `fixed`)
* basePrice
* currency
* ratingAverage
* reviewsCount
* status (`draft`, `active`, `paused`, `archived`)
* createdAt
* updatedAt

**Relationships**

* belongsTo provider
* belongsTo destination
* hasMany tourImages
* hasMany tourHighlights
* hasMany itineraryDays
* hasMany includedItems
* hasMany excludedItems
* hasMany departures
* hasMany bookings
* hasMany reviews

---

## 5.2 TourImage

* id
* tourId
* imageUrl
* sortOrder

---

## 5.3 TourItineraryDay

* id
* tourId
* dayNumber
* title
* description
* overnightLocation

---

## 5.4 TourIncludedItem

* id
* tourId
* label

---

## 5.5 TourExcludedItem

* id
* tourId
* label

---

## 5.6 TourDeparture

This fixes the biggest issue in the old architecture.

Tours should not just be “generally available”. They should have real departure dates.

**Fields**

* id
* tourId
* startDate
* endDate
* availableSeats
* bookedSeats
* priceOverride
* currency
* status (`scheduled`, `sold_out`, `cancelled`)
* createdAt
* updatedAt

**Rules**

* bookings must check seat availability here
* total booked guests cannot exceed availableSeats

---

## 5.7 Vehicle

Used for rentals and driver services.

**Fields**

* id
* providerId
* destinationId
* slug
* title
* description
* vehicleType
* make
* model
* year
* transmission
* seats
* luggageCapacity
* withDriver
* fuelPolicy
* cancellationPolicy
* features
* pricePerDay
* currency
* ratingAverage
* reviewsCount
* status (`draft`, `active`, `paused`, `maintenance`, `archived`)
* createdAt
* updatedAt

**Relationships**

* belongsTo provider
* belongsTo destination
* hasMany vehicleImages
* hasMany vehicleAvailability
* hasMany bookings
* hasMany reviews

---

## 5.8 VehicleAvailability

Vehicles are booked by date range, not a single global status.

**Fields**

* id
* vehicleId
* startDate
* endDate
* status (`available`, `booked`, `blocked`, `maintenance`)
* priceOverride
* createdAt
* updatedAt

**Rules**

* booking date range cannot overlap with blocked/booked dates

---

## 5.9 Accommodation

Used for camps, hotels, lodges.

**Fields**

* id
* providerId
* destinationId
* slug
* name
* description
* accommodationType (`ger_camp`, `hotel`, `lodge`, `guesthouse`)
* checkInTime
* checkOutTime
* amenities
* cancellationPolicy
* starRating
* status (`draft`, `active`, `paused`, `archived`)
* ratingAverage
* reviewsCount
* createdAt
* updatedAt

**Relationships**

* belongsTo provider
* belongsTo destination
* hasMany accommodationImages
* hasMany roomTypes
* hasMany reviews

---

## 5.10 RoomType

This fixes the old issue where one accommodation had only one nightly price.

**Fields**

* id
* accommodationId
* name
* description
* maxGuests
* bedType
* quantity
* basePricePerNight
* currency
* amenities
* createdAt
* updatedAt

---

## 5.11 RoomAvailability

Tracks actual availability per room type.

**Fields**

* id
* roomTypeId
* date
* availableUnits
* bookedUnits
* priceOverride
* status (`available`, `sold_out`, `blocked`)
* createdAt
* updatedAt

**Rules**

* nightly booking checks this table for every date in the range

---

# 6. Booking System

---

## 6.1 Booking

Unified booking model for all listing types.

**Fields**

* id
* bookingCode
* userId
* providerId
* listingType (`tour`, `vehicle`, `accommodation`)
* listingId
* inventoryReferenceId

  * for tours: `tourDepartureId`
  * for vehicles: optional range record or booking itself
  * for accommodation: `roomTypeId`
* startDate
* endDate
* guests
* adults
* children
* nights
* quantity
* subtotal
* serviceFee
* taxes
* discountAmount
* totalAmount
* currency
* paymentStatus (`unpaid`, `authorized`, `paid`, `refunded`, `failed`)
* bookingStatus (`pending`, `confirmed`, `cancelled`, `completed`)
* cancellationReason
* specialRequests
* travelerFullName
* travelerEmail
* travelerPhone
* travelerCountry
* listingSnapshot (json)
* createdAt
* updatedAt

**Relationships**

* belongsTo user
* belongsTo provider
* hasOne payment
* hasMany notifications
* hasOne review maybe
* hasOne conversation optionally

---

## 6.2 Why bookingSnapshot matters

Store immutable booking data such as:

* title
* provider name
* booked price
* selected room/tour/vehicle info
* dates
* guest count

This prevents problems when listings are edited later.

---

## 6.3 Booking logic by type

### Tour

* select a `TourDeparture`
* check availableSeats
* reduce availability atomically
* confirm booking

### Vehicle

* check requested date range against `VehicleAvailability`
* create blocked/booked range
* confirm booking

### Accommodation

* select room type
* check every date in requested range in `RoomAvailability`
* decrement available units for each night
* confirm booking

---

# 7. Payment and Payout Models

---

## 7.1 Payment

**Fields**

* id
* bookingId
* providerId
* userId
* paymentGateway
* paymentReference
* amount
* currency
* status (`pending`, `authorized`, `captured`, `failed`, `refunded`, `partially_refunded`)
* refundAmount
* refundReason
* paidAt
* createdAt
* updatedAt

---

## 7.2 Payout

Used for provider earnings.

**Fields**

* id
* providerId
* bookingId
* grossAmount
* platformFee
* payoutAmount
* currency
* status (`pending`, `scheduled`, `paid`, `failed`)
* payoutReference
* paidAt
* createdAt
* updatedAt

---

## 7.3 Platform fee / commission

The platform should calculate:

* gross booking value
* platform commission
* provider net payout

---

# 8. Messaging System

---

## 8.1 Conversation

**Fields**

* id
* travelerId
* providerId
* listingType (`tour`, `vehicle`, `accommodation`)
* listingId
* bookingId nullable
* lastMessageAt
* lastMessagePreview
* travelerUnreadCount
* providerUnreadCount
* createdAt
* updatedAt

**Relationships**

* hasMany messages

---

## 8.2 Message

**Fields**

* id
* conversationId
* senderUserId
* senderRole (`traveler`, `provider`)
* text
* attachments
* isRead
* readAt
* createdAt

Better option:

* use per-user read state if needed later

---

## 8.3 Messaging rules

* traveler can message provider from a listing page
* booking-linked conversations may also exist
* unread counts update based on message receiver
* providers only access conversations related to their listings/bookings

---

# 9. Reviews System

---

## 9.1 Review

**Fields**

* id
* bookingId
* userId
* providerId
* listingType (`tour`, `vehicle`, `accommodation`)
* listingId
* rating
* title
* comment
* createdAt
* updatedAt

**Rules**

* only one review per completed booking
* user can review only if `bookingStatus = completed`
* cancelled bookings cannot be reviewed

This fixes the old exploit risk.

---

# 10. Wishlist / Saved Listings

---

## 10.1 WishlistItem

**Fields**

* id
* userId
* listingType (`tour`, `vehicle`, `accommodation`)
* listingId
* createdAt

This supports saved tours, vehicles, and stays.

---

# 11. Notifications System

---

## 11.1 Notification

**Fields**

* id
* userId
* type
* title
* body
* actionUrl
* isRead
* readAt
* createdAt

Examples:

* booking confirmed
* payment failed
* new message
* new review
* trip reminder

---

# 12. Provider Onboarding

---

## 12.1 ProviderOnboarding

You can keep this separate until onboarding is complete.

**Fields**

* id
* ownerUserId
* businessName
* description
* location
* phone
* email
* website
* languages
* providerTypes
* logoUrl
* coverImageUrl
* stepCompleted
* status (`draft`, `submitted`, `approved`)
* createdAt
* updatedAt

When approved, create the real `Provider`.

---

# 13. Search System

Search should support separate endpoints for each listing type, plus optional global search.

---

## 13.1 Tour filters

* destinationId
* startDate
* endDate
* guests
* category
* experienceType
* durationDays
* rating
* minPrice
* maxPrice

Tour search must join with `TourDeparture`.

---

## 13.2 Vehicle filters

* destinationId
* startDate
* endDate
* seats
* withDriver
* transmission
* minPrice
* maxPrice

Vehicle search must check `VehicleAvailability`.

---

## 13.3 Accommodation filters

* destinationId
* checkIn
* checkOut
* guests
* accommodationType
* amenities
* minPrice
* maxPrice

Accommodation search must check `RoomAvailability`.

---

# 14. API Structure

Use REST for MVP.

---

## 14.1 Auth

* `POST /auth/register`
* `POST /auth/login`
* `POST /auth/logout`
* `GET /auth/me`

---

## 14.2 Destinations

* `GET /destinations`
* `GET /destinations/:slug`

---

## 14.3 Tours

* `GET /tours`
* `GET /tours/:slug`
* `GET /tours/:id/departures`

Provider:

* `POST /provider/tours`
* `PATCH /provider/tours/:id`
* `DELETE /provider/tours/:id`
* `POST /provider/tours/:id/departures`
* `PATCH /provider/tours/:id/departures/:departureId`

---

## 14.4 Vehicles

* `GET /vehicles`
* `GET /vehicles/:slug`

Provider:

* `POST /provider/vehicles`
* `PATCH /provider/vehicles/:id`
* `DELETE /provider/vehicles/:id`
* `POST /provider/vehicles/:id/availability`
* `PATCH /provider/vehicles/:id/availability/:availabilityId`

---

## 14.5 Accommodations

* `GET /stays`
* `GET /stays/:slug`

Provider:

* `POST /provider/accommodations`
* `PATCH /provider/accommodations/:id`
* `DELETE /provider/accommodations/:id`
* `POST /provider/accommodations/:id/room-types`
* `PATCH /provider/room-types/:id`
* `POST /provider/room-types/:id/availability`
* `PATCH /provider/room-availability/:id`

---

## 14.6 Bookings

* `POST /bookings`
* `GET /bookings/:bookingCode`
* `GET /account/bookings`
* `POST /bookings/:id/cancel`

Provider:

* `GET /provider/bookings`
* `PATCH /provider/bookings/:id/status`

---

## 14.7 Payments

* `POST /payments/checkout`
* `GET /payments/:bookingId`
* `POST /payments/:bookingId/refund`

Provider:

* `GET /provider/payouts`

---

## 14.8 Reviews

* `POST /reviews`
* `PATCH /reviews/:id`
* `DELETE /reviews/:id`

---

## 14.9 Messaging

* `GET /conversations`
* `POST /conversations`
* `GET /conversations/:id/messages`
* `POST /conversations/:id/messages`
* `POST /conversations/:id/read`

---

## 14.10 Wishlist

* `GET /wishlist`
* `POST /wishlist`
* `DELETE /wishlist/:id`

---

## 14.11 Notifications

* `GET /notifications`
* `POST /notifications/:id/read`

---

## 14.12 Provider dashboard

* `GET /provider/dashboard/overview`
* `GET /provider/profile`
* `PATCH /provider/profile`
* `GET /provider/analytics`

---

# 15. Dashboard Data Requirements

The dashboard should adapt based on provider type.

### Shared

* total bookings
* revenue
* recent messages
* recent reviews

### Tour operator

* active tours
* upcoming departures
* seats sold

### Car rental

* active vehicles
* reserved dates
* utilization rate

### Accommodation

* room occupancy
* upcoming reservations
* available units

---

# 16. Important Validation Rules

---

## 16.1 Booking safety

* no overbooking tours
* no overlapping vehicle bookings
* no overbooking room units
* transaction-safe inventory update

---

## 16.2 Review safety

* only completed bookings can be reviewed
* one review per booking

---

## 16.3 Provider access control

* providers only manage their own listings
* providers only see their own bookings/messages

---

# 17. Scaling Concerns

As traffic grows, likely upgrades will be:

* full-text search or search index
* Redis caching
* job queue for notifications/emails
* object storage for images
* analytics warehouse later

For MVP, PostgreSQL + API server is enough.

---

# 18. Final Recommended Model List

Here is the practical model list:

* User
* Provider
* ProviderOnboarding
* Destination
* Tour
* TourImage
* TourItineraryDay
* TourIncludedItem
* TourExcludedItem
* TourDeparture
* Vehicle
* VehicleAvailability
* Accommodation
* RoomType
* RoomAvailability
* Booking
* Payment
* Payout
* Conversation
* Message
* Review
* WishlistItem
* Notification

---

# 19. Summary

This architecture fixes the previous weaknesses by:

* adding real inventory models
* separating room types from accommodations
* handling date-based availability properly
* securing reviews
* supporting multi-service providers
* improving payments and payouts
* adding wishlist and notifications
* linking listings cleanly to destinations
