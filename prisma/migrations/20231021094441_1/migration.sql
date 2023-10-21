-- CreateTable
CREATE TABLE "GoogleUser" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GoogleUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleUser_email_key" ON "GoogleUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleUser_name_key" ON "GoogleUser"("name");
