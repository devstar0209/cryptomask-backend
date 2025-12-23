/*
  Warnings:

  - You are about to drop the column `bnbAddress` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bnbMnemonic` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bnbPrivateKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tronAddress` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tronMnemonic` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tronPrivateKey` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bnbAddress",
DROP COLUMN "bnbMnemonic",
DROP COLUMN "bnbPrivateKey",
DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "tronAddress",
DROP COLUMN "tronMnemonic",
DROP COLUMN "tronPrivateKey";

-- CreateTable
CREATE TABLE "UserSignup" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "tronAddress" TEXT,
    "tronPrivateKey" TEXT,
    "tronMnemonic" TEXT,
    "bnbAddress" TEXT,
    "bnbPrivateKey" TEXT,
    "bnbMnemonic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSignup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSignup_email_key" ON "UserSignup"("email");
