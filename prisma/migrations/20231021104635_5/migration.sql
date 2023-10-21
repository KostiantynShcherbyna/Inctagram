/*
  Warnings:

  - You are about to drop the `Google` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Google";

-- CreateTable
CREATE TABLE "GoogleUser" (
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleUser_email_key" ON "GoogleUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleUser_name_key" ON "GoogleUser"("name");
