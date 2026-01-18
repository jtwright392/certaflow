-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'MANAGER', 'USER');

-- CreateEnum
CREATE TYPE "public"."CertStatus" AS ENUM ('ACTIVE', 'EXPIRING', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."ReminderChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "public"."ReminderReason" AS ENUM ('EXPIRING', 'EXPIRED', 'MISSING_DOCUMENT');

-- CreateTable
CREATE TABLE "public"."Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "locationId" TEXT,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "pinHash" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CertificateType" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "renewalCadenceDays" INTEGER,
    "remindDaysBefore" INTEGER[] DEFAULT ARRAY[30, 14, 7, 1]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CertAssignment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "certificateTypeId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CertAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCertificate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "certificateTypeId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" "public"."CertStatus" NOT NULL DEFAULT 'ACTIVE',
    "fileKey" TEXT,
    "fileName" TEXT,
    "fileMimeType" TEXT,
    "fileSizeBytes" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReminderLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "certificateTypeId" TEXT,
    "channel" "public"."ReminderChannel" NOT NULL,
    "reason" "public"."ReminderReason" NOT NULL,
    "providerMessageId" TEXT,
    "toAddress" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Kiosk" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "locationId" TEXT,
    "name" TEXT NOT NULL,
    "accessCodeHash" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kiosk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KioskEvent" (
    "id" TEXT NOT NULL,
    "kioskId" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KioskEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Location_organizationId_idx" ON "public"."Location"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "public"."User"("organizationId");

-- CreateIndex
CREATE INDEX "User_locationId_idx" ON "public"."User"("locationId");

-- CreateIndex
CREATE INDEX "CertificateType_organizationId_idx" ON "public"."CertificateType"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateType_organizationId_name_key" ON "public"."CertificateType"("organizationId", "name");

-- CreateIndex
CREATE INDEX "CertAssignment_organizationId_idx" ON "public"."CertAssignment"("organizationId");

-- CreateIndex
CREATE INDEX "CertAssignment_certificateTypeId_idx" ON "public"."CertAssignment"("certificateTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "CertAssignment_userId_certificateTypeId_key" ON "public"."CertAssignment"("userId", "certificateTypeId");

-- CreateIndex
CREATE INDEX "UserCertificate_organizationId_idx" ON "public"."UserCertificate"("organizationId");

-- CreateIndex
CREATE INDEX "UserCertificate_userId_idx" ON "public"."UserCertificate"("userId");

-- CreateIndex
CREATE INDEX "UserCertificate_certificateTypeId_idx" ON "public"."UserCertificate"("certificateTypeId");

-- CreateIndex
CREATE INDEX "UserCertificate_expiresAt_idx" ON "public"."UserCertificate"("expiresAt");

-- CreateIndex
CREATE INDEX "ReminderLog_organizationId_idx" ON "public"."ReminderLog"("organizationId");

-- CreateIndex
CREATE INDEX "ReminderLog_userId_idx" ON "public"."ReminderLog"("userId");

-- CreateIndex
CREATE INDEX "ReminderLog_sentAt_idx" ON "public"."ReminderLog"("sentAt");

-- CreateIndex
CREATE INDEX "Kiosk_organizationId_idx" ON "public"."Kiosk"("organizationId");

-- CreateIndex
CREATE INDEX "Kiosk_locationId_idx" ON "public"."Kiosk"("locationId");

-- CreateIndex
CREATE INDEX "KioskEvent_kioskId_idx" ON "public"."KioskEvent"("kioskId");

-- CreateIndex
CREATE INDEX "KioskEvent_userId_idx" ON "public"."KioskEvent"("userId");

-- CreateIndex
CREATE INDEX "KioskEvent_createdAt_idx" ON "public"."KioskEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CertificateType" ADD CONSTRAINT "CertificateType_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CertAssignment" ADD CONSTRAINT "CertAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CertAssignment" ADD CONSTRAINT "CertAssignment_certificateTypeId_fkey" FOREIGN KEY ("certificateTypeId") REFERENCES "public"."CertificateType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCertificate" ADD CONSTRAINT "UserCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCertificate" ADD CONSTRAINT "UserCertificate_certificateTypeId_fkey" FOREIGN KEY ("certificateTypeId") REFERENCES "public"."CertificateType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReminderLog" ADD CONSTRAINT "ReminderLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReminderLog" ADD CONSTRAINT "ReminderLog_certificateTypeId_fkey" FOREIGN KEY ("certificateTypeId") REFERENCES "public"."CertificateType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Kiosk" ADD CONSTRAINT "Kiosk_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Kiosk" ADD CONSTRAINT "Kiosk_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KioskEvent" ADD CONSTRAINT "KioskEvent_kioskId_fkey" FOREIGN KEY ("kioskId") REFERENCES "public"."Kiosk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KioskEvent" ADD CONSTRAINT "KioskEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
