/*
  Warnings:

  - You are about to drop the column `confirmation_code` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[confirmation_codes]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_confirmation_code_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "confirmation_code",
ADD COLUMN     "confirmation_codes" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "User_confirmation_codes_key" ON "User"("confirmation_codes");
