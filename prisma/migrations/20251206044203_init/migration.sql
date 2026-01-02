-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'agent');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'agent',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappPrompt" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "code_impar_en" TEXT,
    "code_par_es" TEXT,
    "content_en" TEXT NOT NULL,
    "content_es" TEXT NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportCase" (
    "id" TEXT NOT NULL,
    "title_es" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "crm_code_type" TEXT,
    "crm_complaint_status" TEXT,
    "script_official_en" TEXT NOT NULL,
    "script_official_es" TEXT NOT NULL,
    "script_friendly_en" TEXT,
    "script_friendly_es" TEXT,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "recommended_prompt_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "SupportCase" ADD CONSTRAINT "SupportCase_recommended_prompt_id_fkey" FOREIGN KEY ("recommended_prompt_id") REFERENCES "WhatsappPrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
