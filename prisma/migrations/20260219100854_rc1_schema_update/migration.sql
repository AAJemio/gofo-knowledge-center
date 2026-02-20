/*
  Warnings:

  - You are about to drop the column `recommended_prompt_id` on the `SupportCase` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SupportCase" DROP CONSTRAINT "SupportCase_recommended_prompt_id_fkey";

-- AlterTable
ALTER TABLE "SupportCase" DROP COLUMN "recommended_prompt_id",
ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "condition_en" TEXT,
ADD COLUMN     "crm_detailed_type" TEXT,
ADD COLUMN     "crm_remark_template" TEXT,
ADD COLUMN     "editorId" TEXT,
ADD COLUMN     "highlightColor" TEXT,
ADD COLUMN     "highlightExpiresAt" TIMESTAMP(3),
ADD COLUMN     "highlightReason" TEXT,
ADD COLUMN     "highlightStartsAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultPage" TEXT NOT NULL DEFAULT 'mqa',
ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'es',
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lastPath" TEXT NOT NULL DEFAULT '/mqa',
ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'light',
ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wapViewMode" TEXT NOT NULL DEFAULT 'list';

-- AlterTable
ALTER TABLE "WhatsappPrompt" ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "editorId" TEXT,
ADD COLUMN     "highlightColor" TEXT,
ADD COLUMN     "highlightExpiresAt" TIMESTAMP(3),
ADD COLUMN     "highlightReason" TEXT,
ADD COLUMN     "highlightStartsAt" TIMESTAMP(3),
ADD COLUMN     "title_es" TEXT;

-- CreateTable
CREATE TABLE "PudoLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "businessDaysEn" TEXT NOT NULL,
    "businessDaysEs" TEXT NOT NULL,
    "businessHours" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "whatsappPromptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PudoLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PudoContent" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "contentEs" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PudoContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "previousState" TEXT,
    "newState" TEXT,
    "isReverted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "language" TEXT,
    "caseId" TEXT,
    "promptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyKPI" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "conversations" INTEGER NOT NULL DEFAULT 0,
    "outboundMessages" INTEGER NOT NULL DEFAULT 0,
    "onlineTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "availableTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "firstResponseTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "resolutionTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "csat" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyKPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiActivityLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3),
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KpiActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "lockDate" TIMESTAMP(3),
    "dailyConversationTarget" INTEGER NOT NULL DEFAULT 100,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KpiSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiSourceFile" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "fileData" BYTEA NOT NULL,

    CONSTRAINT "KpiSourceFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemTempStorage" (
    "id" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemTempStorage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SupportCaseToWhatsappPrompt" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PudoContent_key_key" ON "PudoContent"("key");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "DailyKPI_date_idx" ON "DailyKPI"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyKPI_userId_date_key" ON "DailyKPI"("userId", "date");

-- CreateIndex
CREATE INDEX "KpiSourceFile_targetDate_idx" ON "KpiSourceFile"("targetDate");

-- CreateIndex
CREATE UNIQUE INDEX "_SupportCaseToWhatsappPrompt_AB_unique" ON "_SupportCaseToWhatsappPrompt"("A", "B");

-- CreateIndex
CREATE INDEX "_SupportCaseToWhatsappPrompt_B_index" ON "_SupportCaseToWhatsappPrompt"("B");

-- AddForeignKey
ALTER TABLE "PudoLocation" ADD CONSTRAINT "PudoLocation_whatsappPromptId_fkey" FOREIGN KEY ("whatsappPromptId") REFERENCES "WhatsappPrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappPrompt" ADD CONSTRAINT "WhatsappPrompt_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappPrompt" ADD CONSTRAINT "WhatsappPrompt_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportCase" ADD CONSTRAINT "SupportCase_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportCase" ADD CONSTRAINT "SupportCase_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "SupportCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "WhatsappPrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyKPI" ADD CONSTRAINT "DailyKPI_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiActivityLog" ADD CONSTRAINT "KpiActivityLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiSourceFile" ADD CONSTRAINT "KpiSourceFile_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SupportCaseToWhatsappPrompt" ADD CONSTRAINT "_SupportCaseToWhatsappPrompt_A_fkey" FOREIGN KEY ("A") REFERENCES "SupportCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SupportCaseToWhatsappPrompt" ADD CONSTRAINT "_SupportCaseToWhatsappPrompt_B_fkey" FOREIGN KEY ("B") REFERENCES "WhatsappPrompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
