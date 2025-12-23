/*
  Warnings:

  - You are about to drop the column `attachmentLink` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "attachmentLink",
ADD COLUMN     "mediaId" INTEGER;

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_mediaId_idx" ON "Message"("mediaId");
