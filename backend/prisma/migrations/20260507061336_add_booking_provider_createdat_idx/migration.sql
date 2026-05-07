-- CreateIndex
CREATE INDEX "bookings_providerId_createdAt_idx" ON "bookings"("providerId", "createdAt" DESC);
