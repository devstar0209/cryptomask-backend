/*
  Warnings:

  - Added the required column `priorityIndex` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "priorityIndex" INTEGER NOT NULL;
