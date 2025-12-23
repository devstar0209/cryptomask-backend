-- CreateEnum
CREATE TYPE "RedeemRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" SERIAL NOT NULL,
    "rewardPerInvite" INTEGER NOT NULL DEFAULT 100,
    "mininumRequiredReward" INTEGER NOT NULL DEFAULT 100,
    "redeemable" BOOLEAN NOT NULL DEFAULT true,
    "hideRedeemButton" BOOLEAN NOT NULL DEFAULT false,
    "buttonMessage" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannerImages" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL DEFAULT '#',

    CONSTRAINT "BannerImages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "reward" INTEGER NOT NULL DEFAULT 0,
    "code" TEXT NOT NULL,
    "redeemable" BOOLEAN NOT NULL,
    "buildNumber" TEXT,
    "version" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertLog" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresOn" TIMESTAMP(3) NOT NULL,
    "seenDevice" TEXT[],
    "actionUrl" TEXT,
    "buttonTitle" TEXT,
    "payloads" JSONB[],

    CONSTRAINT "AlertLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralLog" (
    "id" SERIAL NOT NULL,
    "referralAddress" TEXT NOT NULL,
    "referredAddress" TEXT NOT NULL,
    "reward" INTEGER NOT NULL DEFAULT 100,
    "userAddress" INTEGER NOT NULL,

    CONSTRAINT "ReferralLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedeemRequest" (
    "id" SERIAL NOT NULL,
    "userAddress" INTEGER NOT NULL,
    "reward" INTEGER NOT NULL,
    "status" "RedeemRequestStatus" NOT NULL,

    CONSTRAINT "RedeemRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimal" INTEGER NOT NULL,
    "price_ticker" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Site_name_key" ON "Site"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE INDEX "ReferralLog_userAddress_idx" ON "ReferralLog"("userAddress");

-- CreateIndex
CREATE INDEX "RedeemRequest_userAddress_idx" ON "RedeemRequest"("userAddress");
