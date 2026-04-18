-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('initiated', 'redirected', 'failed', 'superseded');

-- AlterTable bookings
ALTER TABLE "bookings" ADD COLUMN     "holdExpiresAt" TIMESTAMP(3),
ADD COLUMN     "maxHoldUntil" TIMESTAMP(3),
ADD COLUMN     "lastPaymentAttemptAt" TIMESTAMP(3);

CREATE INDEX "bookings_holdExpiresAt_idx" ON "bookings"("holdExpiresAt");

-- AlterTable payments: extend for Bonum
ALTER TABLE "payments" ALTER COLUMN "paymentGateway" SET DEFAULT 'bonum';

ALTER TABLE "payments" ADD COLUMN     "providerOrderId" TEXT,
ADD COLUMN     "bonumTransactionId" TEXT,
ADD COLUMN     "sessionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "followUpUrl" TEXT,
ADD COLUMN     "idempotencyKey" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "failedAt" TIMESTAMP(3),
ADD COLUMN     "failureCode" TEXT,
ADD COLUMN     "failureMessage" TEXT,
ADD COLUMN     "refundQueuedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "payments_providerOrderId_key" ON "payments"("providerOrderId");
CREATE UNIQUE INDEX "payments_bonumTransactionId_key" ON "payments"("bonumTransactionId");
CREATE UNIQUE INDEX "payments_idempotencyKey_key" ON "payments"("idempotencyKey");
CREATE INDEX "payments_providerOrderId_idx" ON "payments"("providerOrderId");

ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable payment_attempts
CREATE TABLE "payment_attempts" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'initiated',
    "idempotencyKey" TEXT NOT NULL,
    "providerOrderId" TEXT,
    "followUpUrl" TEXT,
    "qrPayload" TEXT,
    "deeplinkUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_attempts_idempotencyKey_key" ON "payment_attempts"("idempotencyKey");
CREATE INDEX "payment_attempts_paymentId_idx" ON "payment_attempts"("paymentId");

ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable webhook_events
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'bonum',
    "eventId" TEXT NOT NULL,
    "bookingId" TEXT,
    "paymentId" TEXT,
    "rawPayload" JSONB NOT NULL,
    "signatureValid" BOOLEAN NOT NULL DEFAULT false,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "webhook_events_eventId_key" ON "webhook_events"("eventId");
CREATE INDEX "webhook_events_processed_createdAt_idx" ON "webhook_events"("processed", "createdAt");

ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
