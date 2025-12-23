/*
  Warnings:

  - You are about to drop the column `buildNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `redeemable` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `reward` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AlertLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BannerImages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DeviceToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RedeemRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReferralLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Site` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Token` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "buildNumber",
DROP COLUMN "code",
DROP COLUMN "redeemable",
DROP COLUMN "reward",
DROP COLUMN "version",
ADD COLUMN     "isDeactivated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTransactionBlocked" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "AlertLog";

-- DropTable
DROP TABLE "BannerImages";

-- DropTable
DROP TABLE "DeviceToken";

-- DropTable
DROP TABLE "RedeemRequest";

-- DropTable
DROP TABLE "ReferralLog";

-- DropTable
DROP TABLE "Site";

-- DropTable
DROP TABLE "Token";

-- DropEnum
DROP TYPE "RedeemRequestStatus";
