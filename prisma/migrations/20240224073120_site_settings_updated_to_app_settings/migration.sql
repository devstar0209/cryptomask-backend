/*
  Warnings:

  - You are about to drop the `SiteSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SiteSettings";

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" SERIAL NOT NULL,
    "helpUrl" TEXT NOT NULL,
    "privacyPolicyUrl" TEXT NOT NULL,
    "termsAndConditionUrl" TEXT NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);
