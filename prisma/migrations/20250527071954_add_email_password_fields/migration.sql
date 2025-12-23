/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `TempUser` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "isEmailVerified",
DROP COLUMN "updatedAt",
ADD COLUMN     "bnbAddress" TEXT,
ADD COLUMN     "bnbMnemonic" TEXT,
ADD COLUMN     "bnbPrivateKey" TEXT,
ADD COLUMN     "tronAddress" TEXT,
ADD COLUMN     "tronMnemonic" TEXT,
ADD COLUMN     "tronPrivateKey" TEXT,
ALTER COLUMN "subAddress" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL;

-- DropTable
DROP TABLE "TempUser";
