-- CreateEnum
CREATE TYPE "GuideSpecialty" AS ENUM ('Wildlife', 'Trekking', 'Cultural', 'Photography', 'BirdWatching', 'Winter', 'Fishing', 'History', 'Adventure');

-- CreateEnum
CREATE TYPE "GuideStatus" AS ENUM ('draft', 'active', 'paused', 'archived');

-- CreateTable
CREATE TABLE "guides" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "region" TEXT,
    "specialties" "GuideSpecialty"[],
    "languages" TEXT[],
    "certified" BOOLEAN NOT NULL DEFAULT false,
    "licenseNumber" TEXT,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "totalGuests" INTEGER NOT NULL DEFAULT 0,
    "dailyRate" DOUBLE PRECISION,
    "dailyCurrency" TEXT DEFAULT 'USD',
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "website" TEXT,
    "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "GuideStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_reviews" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "tourName" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guide_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guides_slug_key" ON "guides"("slug");

-- CreateIndex
CREATE INDEX "guide_reviews_guideId_idx" ON "guide_reviews"("guideId");

-- AddForeignKey
ALTER TABLE "guide_reviews" ADD CONSTRAINT "guide_reviews_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;
