-- AlterTable
ALTER TABLE "GoogleUser" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "GoogleUser_pkey" PRIMARY KEY ("id");
