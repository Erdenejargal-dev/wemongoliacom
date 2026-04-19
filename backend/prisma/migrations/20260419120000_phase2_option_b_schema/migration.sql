-- Phase 2 Option B — additive schema migration.
--
-- This migration ONLY adds columns/indexes/tables. It does not drop or
-- rename any legacy column. Legacy `basePrice`, `basePricePerNight`,
-- `pricePerDay`, and sibling `currency` columns remain in place until the
-- follow-up `drop_legacy_price_columns` migration ships in the next release.
--
-- Data backfill for the new columns is handled in the next migration
-- (20260419120001_phase2_option_b_backfill).

-- ── User preferences (data contract only; no UX wired yet) ──────────────
ALTER TABLE "users"
  ADD COLUMN "preferredCurrency" TEXT,
  ADD COLUMN "preferredLanguage" TEXT;

-- ── Tour: baseAmount / baseCurrency / normalized ────────────────────────
ALTER TABLE "tours"
  ADD COLUMN "baseAmount"          DOUBLE PRECISION,
  ADD COLUMN "baseCurrency"        TEXT,
  ADD COLUMN "normalizedAmountMnt" DOUBLE PRECISION,
  ADD COLUMN "normalizedFxRate"    DOUBLE PRECISION,
  ADD COLUMN "normalizedFxRateAt"  TIMESTAMP(3);

CREATE INDEX "tours_normalizedAmountMnt_idx" ON "tours"("normalizedAmountMnt");

-- ── TourDeparture: baseOverrideAmount / baseOverrideCurrency ────────────
ALTER TABLE "tour_departures"
  ADD COLUMN "baseOverrideAmount"   DOUBLE PRECISION,
  ADD COLUMN "baseOverrideCurrency" TEXT;

-- ── Vehicle: baseAmount / baseCurrency / normalized ─────────────────────
ALTER TABLE "vehicles"
  ADD COLUMN "baseAmount"          DOUBLE PRECISION,
  ADD COLUMN "baseCurrency"        TEXT,
  ADD COLUMN "normalizedAmountMnt" DOUBLE PRECISION,
  ADD COLUMN "normalizedFxRate"    DOUBLE PRECISION,
  ADD COLUMN "normalizedFxRateAt"  TIMESTAMP(3);

CREATE INDEX "vehicles_normalizedAmountMnt_idx" ON "vehicles"("normalizedAmountMnt");

-- ── VehicleAvailability: baseOverrideAmount / baseOverrideCurrency ──────
ALTER TABLE "vehicle_availability"
  ADD COLUMN "baseOverrideAmount"   DOUBLE PRECISION,
  ADD COLUMN "baseOverrideCurrency" TEXT;

-- ── RoomType: baseAmount / baseCurrency / normalized ────────────────────
ALTER TABLE "room_types"
  ADD COLUMN "baseAmount"          DOUBLE PRECISION,
  ADD COLUMN "baseCurrency"        TEXT,
  ADD COLUMN "normalizedAmountMnt" DOUBLE PRECISION,
  ADD COLUMN "normalizedFxRate"    DOUBLE PRECISION,
  ADD COLUMN "normalizedFxRateAt"  TIMESTAMP(3);

CREATE INDEX "room_types_normalizedAmountMnt_idx" ON "room_types"("normalizedAmountMnt");

-- ── RoomAvailability: baseOverrideAmount / baseOverrideCurrency ─────────
ALTER TABLE "room_availability"
  ADD COLUMN "baseOverrideAmount"   DOUBLE PRECISION,
  ADD COLUMN "baseOverrideCurrency" TEXT;

-- ── Booking: first-class FX + base-currency snapshot columns ────────────
ALTER TABLE "bookings"
  ADD COLUMN "pricePerUnitAmount" DOUBLE PRECISION,
  ADD COLUMN "units"              INTEGER,
  ADD COLUMN "baseCurrency"       TEXT,
  ADD COLUMN "baseSubtotal"       DOUBLE PRECISION,
  ADD COLUMN "baseServiceFee"     DOUBLE PRECISION,
  ADD COLUMN "baseTotalAmount"    DOUBLE PRECISION,
  ADD COLUMN "fxRate"             DOUBLE PRECISION,
  ADD COLUMN "fxRateCapturedAt"   TIMESTAMP(3),
  ADD COLUMN "fxRateSource"       TEXT;

-- ── FxRate: admin-managed exchange rate table ───────────────────────────
CREATE TABLE "fx_rates" (
  "id"            TEXT NOT NULL,
  "fromCurrency"  TEXT NOT NULL,
  "toCurrency"    TEXT NOT NULL,
  "rate"          DOUBLE PRECISION NOT NULL,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "source"        TEXT NOT NULL,
  "note"          TEXT,
  "createdById"   TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fx_rates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "fx_rates_fromCurrency_toCurrency_effectiveFrom_idx"
  ON "fx_rates"("fromCurrency", "toCurrency", "effectiveFrom");

-- ── FxBackfillReport: data-quality log written by backfill migration ────
CREATE TABLE "fx_backfill_reports" (
  "id"         TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId"   TEXT NOT NULL,
  "issue"      TEXT NOT NULL,
  "context"    JSONB,
  "resolvedAt" TIMESTAMP(3),
  "resolvedBy" TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fx_backfill_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "fx_backfill_reports_entityType_entityId_idx"
  ON "fx_backfill_reports"("entityType", "entityId");

CREATE INDEX "fx_backfill_reports_resolvedAt_idx"
  ON "fx_backfill_reports"("resolvedAt");
