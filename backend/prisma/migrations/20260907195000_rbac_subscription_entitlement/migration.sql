-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'PAST_DUE';

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PREMIUM');

-- AlterTable users: add 2FA metadata, drop google_id
ALTER TABLE "users" DROP COLUMN IF EXISTS "google_id";
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_secret" TEXT;

-- AlterTable subscriptions: migrate plan column to SubscriptionTier
ALTER TABLE "subscriptions" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "subscriptions" ALTER COLUMN "plan" TYPE "SubscriptionTier" USING ("plan"::text::"SubscriptionTier");
ALTER TABLE "subscriptions" ALTER COLUMN "plan" SET DEFAULT 'FREE';

-- Drop old enum if exists
DROP TYPE IF EXISTS "SubscriptionPlan";

-- CreateIndex: ensure unique 1-to-1 foreign key reference to users
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_user_id_key" ON "subscriptions"("user_id");
