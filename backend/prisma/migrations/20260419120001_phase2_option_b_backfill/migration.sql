-- pgcrypto powers gen_random_uuid() used for fx_backfill_reports.id. Idempotent.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Phase 2 Option B — data backfill migration.
--
-- Populates the new baseAmount / baseCurrency / normalizedAmountMnt columns
-- on listings, and the baseSubtotal / baseTotalAmount / fxRate snapshot on
-- bookings, using per-model rules chosen in the Phase 2 plan.
--
-- GUARANTEES:
--   * Only touches rows where the new column is NULL (idempotent).
--   * Never overwrites legacy columns.
--   * Writes one fx_backfill_reports row per anomaly instead of failing.
--
-- IMPORTANT: The USD→MNT conversion below uses the most recent row from
-- `fx_rates` with fromCurrency='USD', toCurrency='MNT'. If no row exists
-- at the time this migration runs, USD-priced rows are backfilled with
-- `normalizedFxRate = NULL` and an fx_backfill_reports entry. Operations
-- must seed at least one USD→MNT rate (see backend/prisma/seed-fx.ts) to
-- make those rows comparable in search.

-- ─────────────────────────────────────────────────────────────────────────
-- Tours
-- ─────────────────────────────────────────────────────────────────────────
UPDATE "tours"
SET
  "baseAmount"         = "basePrice",
  "baseCurrency"       = COALESCE("currency", 'USD'),
  "normalizedFxRate"   = CASE
    WHEN COALESCE("currency", 'USD') = 'MNT' THEN 1
    ELSE (
      SELECT "rate"
      FROM "fx_rates"
      WHERE "fromCurrency" = COALESCE("tours"."currency", 'USD')
        AND "toCurrency"   = 'MNT'
        AND "effectiveFrom" <= NOW()
      ORDER BY "effectiveFrom" DESC
      LIMIT 1
    )
  END,
  "normalizedFxRateAt" = CASE
    WHEN COALESCE("currency", 'USD') = 'MNT' THEN NOW()
    ELSE (
      SELECT "effectiveFrom"
      FROM "fx_rates"
      WHERE "fromCurrency" = COALESCE("tours"."currency", 'USD')
        AND "toCurrency"   = 'MNT'
        AND "effectiveFrom" <= NOW()
      ORDER BY "effectiveFrom" DESC
      LIMIT 1
    )
  END
WHERE "baseAmount" IS NULL;

UPDATE "tours"
SET "normalizedAmountMnt" = "baseAmount" * "normalizedFxRate"
WHERE "normalizedAmountMnt" IS NULL
  AND "baseAmount" IS NOT NULL
  AND "normalizedFxRate" IS NOT NULL;

-- Flag tours that couldn't be normalized (no USD→MNT rate seeded).
INSERT INTO "fx_backfill_reports" ("id", "entityType", "entityId", "issue", "context", "createdAt")
SELECT
  gen_random_uuid()::text,
  'tour',
  "id",
  'missing_usd_mnt_rate',
  jsonb_build_object('baseCurrency', "baseCurrency", 'baseAmount', "baseAmount"),
  NOW()
FROM "tours"
WHERE "normalizedAmountMnt" IS NULL
  AND "baseAmount" IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- TourDepartures — override only gets baseOverride* when priceOverride set
-- ─────────────────────────────────────────────────────────────────────────
UPDATE "tour_departures"
SET
  "baseOverrideAmount"   = "priceOverride",
  "baseOverrideCurrency" = COALESCE("currency", 'USD')
WHERE "priceOverride" IS NOT NULL
  AND "baseOverrideAmount" IS NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- Vehicles
-- ─────────────────────────────────────────────────────────────────────────
UPDATE "vehicles"
SET
  "baseAmount"         = "pricePerDay",
  "baseCurrency"       = COALESCE("currency", 'USD'),
  "normalizedFxRate"   = CASE
    WHEN COALESCE("currency", 'USD') = 'MNT' THEN 1
    ELSE (
      SELECT "rate"
      FROM "fx_rates"
      WHERE "fromCurrency" = COALESCE("vehicles"."currency", 'USD')
        AND "toCurrency"   = 'MNT'
        AND "effectiveFrom" <= NOW()
      ORDER BY "effectiveFrom" DESC
      LIMIT 1
    )
  END,
  "normalizedFxRateAt" = CASE
    WHEN COALESCE("currency", 'USD') = 'MNT' THEN NOW()
    ELSE (
      SELECT "effectiveFrom"
      FROM "fx_rates"
      WHERE "fromCurrency" = COALESCE("vehicles"."currency", 'USD')
        AND "toCurrency"   = 'MNT'
        AND "effectiveFrom" <= NOW()
      ORDER BY "effectiveFrom" DESC
      LIMIT 1
    )
  END
WHERE "baseAmount" IS NULL;

UPDATE "vehicles"
SET "normalizedAmountMnt" = "baseAmount" * "normalizedFxRate"
WHERE "normalizedAmountMnt" IS NULL
  AND "baseAmount" IS NOT NULL
  AND "normalizedFxRate" IS NOT NULL;

INSERT INTO "fx_backfill_reports" ("id", "entityType", "entityId", "issue", "context", "createdAt")
SELECT
  gen_random_uuid()::text,
  'vehicle',
  "id",
  'missing_usd_mnt_rate',
  jsonb_build_object('baseCurrency', "baseCurrency", 'baseAmount', "baseAmount"),
  NOW()
FROM "vehicles"
WHERE "normalizedAmountMnt" IS NULL
  AND "baseAmount" IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- VehicleAvailability overrides — Phase 1 had no currency sidecar, so we
-- inherit parent vehicle currency.
-- ─────────────────────────────────────────────────────────────────────────
UPDATE "vehicle_availability" va
SET
  "baseOverrideAmount"   = va."priceOverride",
  "baseOverrideCurrency" = COALESCE(v."currency", 'USD')
FROM "vehicles" v
WHERE va."vehicleId" = v."id"
  AND va."priceOverride" IS NOT NULL
  AND va."baseOverrideAmount" IS NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- RoomTypes
-- ─────────────────────────────────────────────────────────────────────────
UPDATE "room_types"
SET
  "baseAmount"         = "basePricePerNight",
  "baseCurrency"       = COALESCE("currency", 'USD'),
  "normalizedFxRate"   = CASE
    WHEN COALESCE("currency", 'USD') = 'MNT' THEN 1
    ELSE (
      SELECT "rate"
      FROM "fx_rates"
      WHERE "fromCurrency" = COALESCE("room_types"."currency", 'USD')
        AND "toCurrency"   = 'MNT'
        AND "effectiveFrom" <= NOW()
      ORDER BY "effectiveFrom" DESC
      LIMIT 1
    )
  END,
  "normalizedFxRateAt" = CASE
    WHEN COALESCE("currency", 'USD') = 'MNT' THEN NOW()
    ELSE (
      SELECT "effectiveFrom"
      FROM "fx_rates"
      WHERE "fromCurrency" = COALESCE("room_types"."currency", 'USD')
        AND "toCurrency"   = 'MNT'
        AND "effectiveFrom" <= NOW()
      ORDER BY "effectiveFrom" DESC
      LIMIT 1
    )
  END
WHERE "baseAmount" IS NULL;

UPDATE "room_types"
SET "normalizedAmountMnt" = "baseAmount" * "normalizedFxRate"
WHERE "normalizedAmountMnt" IS NULL
  AND "baseAmount" IS NOT NULL
  AND "normalizedFxRate" IS NOT NULL;

INSERT INTO "fx_backfill_reports" ("id", "entityType", "entityId", "issue", "context", "createdAt")
SELECT
  gen_random_uuid()::text,
  'room_type',
  "id",
  'missing_usd_mnt_rate',
  jsonb_build_object('baseCurrency', "baseCurrency", 'baseAmount', "baseAmount"),
  NOW()
FROM "room_types"
WHERE "normalizedAmountMnt" IS NULL
  AND "baseAmount" IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- RoomAvailability overrides — inherit parent roomType currency.
-- ─────────────────────────────────────────────────────────────────────────
UPDATE "room_availability" ra
SET
  "baseOverrideAmount"   = ra."priceOverride",
  "baseOverrideCurrency" = COALESCE(rt."currency", 'USD')
FROM "room_types" rt
WHERE ra."roomTypeId" = rt."id"
  AND ra."priceOverride" IS NOT NULL
  AND ra."baseOverrideAmount" IS NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- Bookings — Phase 1 never did cross-currency conversion, so historic
-- bookings are same-currency by construction (booking.currency == listing
-- baseCurrency). Snapshot the existing amounts and mark fxRate = 1,
-- source = 'backfill_same_currency'.
--
-- pricePerUnitAmount is computed best-effort:
--   tour:          subtotal / NULLIF(guests, 0)
--   vehicle/stay:  subtotal / NULLIF(nights_or_days, 0) — falls back to
--                  quantity, then subtotal
-- Edge cases (guests = 0, missing nights, etc.) write an anomaly report
-- and leave pricePerUnitAmount NULL.
-- ─────────────────────────────────────────────────────────────────────────
UPDATE "bookings"
SET
  "baseCurrency"     = COALESCE("currency", 'USD'),
  "baseSubtotal"     = "subtotal",
  "baseServiceFee"   = "serviceFee",
  "baseTotalAmount"  = "totalAmount",
  "fxRate"           = 1,
  "fxRateCapturedAt" = "createdAt",
  "fxRateSource"     = 'backfill_same_currency'
WHERE "baseCurrency" IS NULL;

-- Best-effort pricePerUnitAmount / units backfill.
UPDATE "bookings"
SET
  "units" = CASE
    WHEN "listingType" = 'tour'          THEN GREATEST(COALESCE("guests", 1), 1)
    WHEN "listingType" = 'accommodation' THEN GREATEST(COALESCE("nights", 1), 1)
    WHEN "listingType" = 'vehicle'       THEN CASE
      WHEN "startDate" IS NOT NULL AND "endDate" IS NOT NULL
        THEN GREATEST(CEIL(EXTRACT(EPOCH FROM ("endDate" - "startDate")) / 86400)::int, 1)
      ELSE GREATEST(COALESCE("quantity", 1), 1)
    END
    ELSE GREATEST(COALESCE("quantity", 1), 1)
  END
WHERE "units" IS NULL;

UPDATE "bookings"
SET "pricePerUnitAmount" = "subtotal" / NULLIF("units", 0)
WHERE "pricePerUnitAmount" IS NULL
  AND "units" IS NOT NULL
  AND "units" > 0;

-- Flag any booking whose units couldn't be inferred (impossibly sparse data).
INSERT INTO "fx_backfill_reports" ("id", "entityType", "entityId", "issue", "context", "createdAt")
SELECT
  gen_random_uuid()::text,
  'booking',
  "id",
  'units_unknown_for_backfill',
  jsonb_build_object('listingType', "listingType", 'guests', "guests", 'nights', "nights"),
  NOW()
FROM "bookings"
WHERE "pricePerUnitAmount" IS NULL;
