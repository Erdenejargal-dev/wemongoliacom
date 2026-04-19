-- Phase 6 — UX + Growth Layer
--
-- Adds a lightweight `booking_requests` table used for listings that cannot
-- currently be charged by the payment gateway (today: non-MNT listings with
-- Bonum being MNT-only). This is a LEAD table — it never holds inventory,
-- never calculates money, and never touches FX.

-- 1. Enum for request status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BookingRequestStatus') THEN
    CREATE TYPE "BookingRequestStatus" AS ENUM ('new', 'in_review', 'accepted', 'declined', 'expired');
  END IF;
END
$$;

-- 2. Table
CREATE TABLE IF NOT EXISTS "booking_requests" (
    "id"              TEXT PRIMARY KEY,
    "userId"          TEXT,
    "providerId"      TEXT NOT NULL,
    "listingType"     "ListingType" NOT NULL,
    "listingId"       TEXT NOT NULL,

    "name"            TEXT NOT NULL,
    "email"           TEXT NOT NULL,
    "phone"           TEXT,
    "message"         TEXT,

    "startDate"       TIMESTAMP(3),
    "endDate"         TIMESTAMP(3),
    "guests"          INTEGER,
    "quantity"        INTEGER,

    "listingCurrency" TEXT,

    "status"          "BookingRequestStatus" NOT NULL DEFAULT 'new',
    "providerNote"    TEXT,

    "ipAddress"       TEXT,
    "userAgent"       TEXT,

    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,
    "reviewedAt"      TIMESTAMP(3)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS "booking_requests_providerId_status_idx"   ON "booking_requests" ("providerId", "status");
CREATE INDEX IF NOT EXISTS "booking_requests_userId_idx"              ON "booking_requests" ("userId");
CREATE INDEX IF NOT EXISTS "booking_requests_listingType_listingId_idx" ON "booking_requests" ("listingType", "listingId");
CREATE INDEX IF NOT EXISTS "booking_requests_createdAt_idx"           ON "booking_requests" ("createdAt");

-- 4. Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_requests_userId_fkey') THEN
    ALTER TABLE "booking_requests"
      ADD CONSTRAINT "booking_requests_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_requests_providerId_fkey') THEN
    ALTER TABLE "booking_requests"
      ADD CONSTRAINT "booking_requests_providerId_fkey"
      FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
