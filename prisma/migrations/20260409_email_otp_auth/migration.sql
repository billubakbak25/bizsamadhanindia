-- Allow client accounts to exist without a phone number and make email the unique login identity.
ALTER TABLE "clients" ALTER COLUMN "phone" DROP NOT NULL;
UPDATE "clients" SET "email" = LOWER(TRIM("email")) WHERE "email" IS NOT NULL;
DROP INDEX IF EXISTS "clients_email_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "clients_email_key" ON "clients"("email");

-- Replace legacy phone OTP storage with email OTP records.
DROP INDEX IF EXISTS "otps_phone_idx";
DROP TABLE IF EXISTS "otps";

CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "otps_email_idx" ON "otps"("email");
