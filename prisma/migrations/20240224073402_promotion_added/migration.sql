-- CreateTable
CREATE TABLE "Promotion" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "ctaUrl" TEXT NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);
