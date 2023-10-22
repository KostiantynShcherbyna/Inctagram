/*
  Warnings:

  - Changed the type of `expire_at` on the `Device` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Device" DROP COLUMN "expire_at",
ADD COLUMN     "expire_at" TIMESTAMP(3) NOT NULL;
