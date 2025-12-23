-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "fromId" INTEGER NOT NULL,
    "toId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_fromId_idx" ON "Message"("fromId");

-- CreateIndex
CREATE INDEX "Message_toId_idx" ON "Message"("toId");
