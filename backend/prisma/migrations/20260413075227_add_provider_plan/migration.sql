-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PRO');

-- AlterTable
ALTER TABLE "providers" ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'FREE';
