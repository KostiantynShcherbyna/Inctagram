/*
  Warnings:

  - The `last_activedate` column on the `Device` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Device" DROP COLUMN "last_activedate",
ADD COLUMN     "last_activedate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
