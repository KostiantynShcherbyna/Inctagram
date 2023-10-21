/*
  Warnings:

  - You are about to drop the `GoogleUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "GoogleUser";

-- CreateTable
CREATE TABLE "Google" (
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Google_email_key" ON "Google"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Google_name_key" ON "Google"("name");
