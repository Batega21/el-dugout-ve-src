-- AlterTable users: add first_name, last_name, mobile_number and drop name
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mobile_number" TEXT;

-- Migrate existing names to first_name and last_name if present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
    UPDATE "users"
    SET "first_name" = CASE
        WHEN POSITION(' ' IN "name") > 0 THEN SUBSTRING("name" FROM 1 FOR POSITION(' ' IN "name") - 1)
        WHEN "name" IS NOT NULL AND "name" != '' THEN "name"
        ELSE 'User'
      END,
      "last_name" = CASE
        WHEN POSITION(' ' IN "name") > 0 THEN SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)
        ELSE ''
      END
    WHERE "name" IS NOT NULL;

    ALTER TABLE "users" DROP COLUMN "name";
  END IF;
END $$;

-- AlterTable subscriptions: remove profile columns
DROP INDEX IF EXISTS "subscriptions_email_idx";

ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "first_name";
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "last_name";
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "email";
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "mobile";

-- Delete any unlinked orphaned subscriptions to satisfy NOT NULL & 1:1 requirement
DELETE FROM "subscriptions" WHERE "user_id" IS NULL;

-- AlterTable subscriptions: enforce NOT NULL user_id and CASCADE delete
ALTER TABLE "subscriptions" ALTER COLUMN "user_id" SET NOT NULL;

ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_user_id_fkey";
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Ensure UNIQUE index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_user_id_key" ON "subscriptions"("user_id");
