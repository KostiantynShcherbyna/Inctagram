-- AlterTable
ALTER TABLE "User" ALTER COLUMN "confirmation_codes" SET DEFAULT ARRAY[]::TEXT[];
