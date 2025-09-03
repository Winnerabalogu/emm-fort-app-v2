-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'BASIC');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "referral" TEXT,
    "tier" "Tier" NOT NULL DEFAULT 'BASIC',
    "subscriptionId" TEXT,
    "subscriptionStartDate" TIMESTAMP(3),
    "subscriptionExpiryDate" TIMESTAMP(3),
    "emailVerified" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "verificationToken" TEXT,
    "verificationTokenExpiry" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uplinerId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawalDetails" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WithdrawalDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaveRequest" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "purpose" TEXT NOT NULL,
    "adminNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "description" TEXT,
    "sourceUserId" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");

-- CreateIndex
CREATE INDEX "User_email_verified_idx" ON "User"("email", "emailVerified");

-- CreateIndex
CREATE INDEX "User_id_tier_subscription_idx" ON "User"("id", "tier", "subscriptionStartDate");

-- CreateIndex
CREATE INDEX "User_tier_idx" ON "User"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformSettings_section_key" ON "PlatformSettings"("section");

-- CreateIndex
CREATE INDEX "PlatformSettings_updatedBy_idx" ON "PlatformSettings"("updatedBy");

-- CreateIndex
CREATE INDEX "PlatformSettings_updatedAt_idx" ON "PlatformSettings"("updatedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawalDetails_userId_key" ON "WithdrawalDetails"("userId");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_userId_status_idx" ON "WithdrawalRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "SaveRequest_userId_status_idx" ON "SaveRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_userId_status_createdAt_idx" ON "Transaction"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Transaction_userId_status_type_idx" ON "Transaction"("userId", "status", "type");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_uplinerId_fkey" FOREIGN KEY ("uplinerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PlatformSettings" ADD CONSTRAINT "PlatformSettings_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalDetails" ADD CONSTRAINT "WithdrawalDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaveRequest" ADD CONSTRAINT "SaveRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sourceUserId_fkey" FOREIGN KEY ("sourceUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Migration to add EmailSubscription and ContactRequest tables
-- Run: npx prisma db push
-- Or create a migration: npx prisma migrate dev --name add-email-and-contact-models

-- EmailSubscription table
CREATE TABLE "EmailSubscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),
    "lastEmailSent" TIMESTAMP(3),
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSubscription_pkey" PRIMARY KEY ("id")
);

-- ContactRequest table
CREATE TABLE "ContactRequest" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'contact_form',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "assignedTo" TEXT,
    "adminNotes" TEXT,
    "respondedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);

-- Indexes for EmailSubscription
CREATE UNIQUE INDEX "EmailSubscription_email_key" ON "EmailSubscription"("email");
CREATE INDEX "EmailSubscription_email_status_idx" ON "EmailSubscription"("email", "status");
CREATE INDEX "EmailSubscription_source_status_idx" ON "EmailSubscription"("source", "status");
CREATE INDEX "EmailSubscription_subscribedAt_idx" ON "EmailSubscription"("subscribedAt");

-- Indexes for ContactRequest
CREATE INDEX "ContactRequest_email_status_idx" ON "ContactRequest"("email", "status");
CREATE INDEX "ContactRequest_status_priority_idx" ON "ContactRequest"("status", "priority");
CREATE INDEX "ContactRequest_createdAt_idx" ON "ContactRequest"("createdAt");