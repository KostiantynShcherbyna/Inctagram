-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "birth_date" TEXT,
    "city" TEXT,
    "about_me" TEXT,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Device" (
    "device_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "last_activedate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("device_id")
);

-- CreateTable
CREATE TABLE "ConfirmationCode" (
    "confiramtion_code_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "confirmation_code" TEXT NOT NULL,

    CONSTRAINT "ConfirmationCode_pkey" PRIMARY KEY ("confiramtion_code_id")
);

-- CreateTable
CREATE TABLE "PasswordRecoveryCode" (
    "password_recovery_code_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "recovery_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "PasswordRecoveryCode_pkey" PRIMARY KEY ("password_recovery_code_id")
);

-- CreateTable
CREATE TABLE "UserPhoto" (
    "user_avatar_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "UserPhoto_pkey" PRIMARY KEY ("user_avatar_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmationCode_confirmation_code_key" ON "ConfirmationCode"("confirmation_code");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordRecoveryCode_recovery_code_key" ON "PasswordRecoveryCode"("recovery_code");

-- CreateIndex
CREATE UNIQUE INDEX "UserPhoto_path_key" ON "UserPhoto"("path");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmationCode" ADD CONSTRAINT "ConfirmationCode_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordRecoveryCode" ADD CONSTRAINT "PasswordRecoveryCode_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPhoto" ADD CONSTRAINT "UserPhoto_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
