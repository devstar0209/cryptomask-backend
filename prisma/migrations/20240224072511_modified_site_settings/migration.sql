/*
  Warnings:

  - You are about to drop the column `buttonMessage` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `hideRedeemButton` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `mininumRequiredReward` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `redeemable` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `rewardPerInvite` on the `SiteSettings` table. All the data in the column will be lost.
  - Added the required column `helpUrl` to the `SiteSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `privacyPolicyUrl` to the `SiteSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termsAndConditionUrl` to the `SiteSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SiteSettings" DROP COLUMN "buttonMessage",
DROP COLUMN "hideRedeemButton",
DROP COLUMN "mininumRequiredReward",
DROP COLUMN "redeemable",
DROP COLUMN "rewardPerInvite",
ADD COLUMN     "helpUrl" TEXT NOT NULL,
ADD COLUMN     "privacyPolicyUrl" TEXT NOT NULL,
ADD COLUMN     "termsAndConditionUrl" TEXT NOT NULL;
