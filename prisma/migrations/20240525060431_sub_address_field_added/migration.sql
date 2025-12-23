-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subAddress" TEXT[] DEFAULT ARRAY[]::TEXT[];
