-- CreateTable
CREATE TABLE "PasswordRecoveryCode" (
    "password_recovery_code_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "recoveryCode" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "PasswordRecoveryCode_pkey" PRIMARY KEY ("password_recovery_code_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordRecoveryCode_email_key" ON "PasswordRecoveryCode"("email");

-- AddForeignKey
ALTER TABLE "PasswordRecoveryCode" ADD CONSTRAINT "PasswordRecoveryCode_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
