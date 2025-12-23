/*
  Warnings:

  - You are about to drop the column `fromId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `toId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `forId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Message_fromId_idx";

-- DropIndex
DROP INDEX "Message_toId_idx";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "fromId",
DROP COLUMN "toId",
ADD COLUMN     "forId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Message_forId_idx" ON "Message"("forId");
