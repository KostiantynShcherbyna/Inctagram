/*
  Warnings:

  - Made the column `password_hash` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password_hash" SET NOT NULL,
ALTER COLUMN "confirmation_codes" DROP DEFAULT;
