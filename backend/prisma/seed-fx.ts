/**
 * backend/prisma/seed-fx.ts
 *
 * Phase 2 Option B — manual FX rate seed.
 *
 * WHY THIS SCRIPT IS INTENTIONALLY MANUAL:
 *   We do NOT want an automated or hardcoded rate shipped in the application
 *   code itself. The plan explicitly forbids inventing rates in business
 *   logic (see plan §B "FX conversion layer"). This script exists so an
 *   admin or operator can seed the first USD→MNT (and MNT→USD) rates into
 *   the `fx_rates` table via CLI before the Phase 2 deploy.
 *
 * USAGE:
 *   # From the `backend/` folder:
 *   FX_USD_MNT=3500 FX_MNT_USD=0.000286 npm run seed:fx
 *
 *   Or override the "source" tag:
 *   FX_USD_MNT=3500 FX_SOURCE=manual_admin npm run seed:fx
 *
 * WHAT IT DOES:
 *   1. Insert (or append — rates are immutable once written) one row for
 *      USD→MNT at the rate provided via FX_USD_MNT.
 *   2. Insert the inverse MNT→USD row; if FX_MNT_USD is set it uses that
 *      value verbatim, otherwise it computes `1 / FX_USD_MNT`.
 *   3. Prints the inserted rows and a loud warning that they are manual.
 *
 * WHAT IT INTENTIONALLY DOES NOT DO:
 *   * Fetch from any external service — no network calls.
 *   * Provide any default rate if the env vars are not set (exits with
 *     error so CI/CD failures are visible).
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const usdMntRaw = process.env.FX_USD_MNT
  const mntUsdRaw = process.env.FX_MNT_USD
  const source    = process.env.FX_SOURCE?.trim() || 'manual'
  const note      = process.env.FX_NOTE?.trim()   || 'Seeded manually via seed-fx.ts'

  if (!usdMntRaw) {
    console.error(
      '[seed-fx] FX_USD_MNT env var is required. Example:\n' +
      '          FX_USD_MNT=3500 npm run seed:fx\n' +
      'No rate will be inserted. See backend/prisma/seed-fx.ts for details.',
    )
    process.exit(1)
  }

  const usdMnt = Number(usdMntRaw)
  if (!Number.isFinite(usdMnt) || usdMnt <= 0) {
    console.error(`[seed-fx] FX_USD_MNT must be a positive number; got "${usdMntRaw}".`)
    process.exit(1)
  }

  const mntUsd = mntUsdRaw ? Number(mntUsdRaw) : 1 / usdMnt
  if (!Number.isFinite(mntUsd) || mntUsd <= 0) {
    console.error(`[seed-fx] FX_MNT_USD must be a positive number; got "${mntUsdRaw}".`)
    process.exit(1)
  }

  const effectiveFrom = new Date()

  const rows = await prisma.$transaction([
    prisma.fxRate.create({
      data: {
        fromCurrency:  'USD',
        toCurrency:    'MNT',
        rate:          usdMnt,
        effectiveFrom,
        source,
        note,
      },
    }),
    prisma.fxRate.create({
      data: {
        fromCurrency:  'MNT',
        toCurrency:    'USD',
        rate:          mntUsd,
        effectiveFrom,
        source,
        note,
      },
    }),
  ])

  console.warn('\n[seed-fx] ⚠️  Inserted MANUAL FX rates. These rates are NOT automatically')
  console.warn('[seed-fx] ⚠️  refreshed. An admin must seed new rows (immutable) as needed.\n')
  rows.forEach((r) => {
    console.log(
      `[seed-fx] ${r.fromCurrency}→${r.toCurrency} = ${r.rate} ` +
      `(effectiveFrom=${r.effectiveFrom.toISOString()}, source=${r.source})`,
    )
  })
}

main()
  .catch((err) => {
    console.error('[seed-fx] Failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
