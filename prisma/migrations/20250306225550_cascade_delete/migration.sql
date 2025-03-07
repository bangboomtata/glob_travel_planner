/*
  Warnings:

  - Added the required column `preferenceId` to the `itineraries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QuestionType" ADD VALUE 'OUTDOOR_ACTIVITIES';
ALTER TYPE "QuestionType" ADD VALUE 'CULTURE';
ALTER TYPE "QuestionType" ADD VALUE 'ATMOSPHERE';
ALTER TYPE "QuestionType" ADD VALUE 'NUMBER_OF_TRAVELLERS';

-- DropForeignKey
ALTER TABLE "flights" DROP CONSTRAINT "flights_itineraryId_fkey";

-- AlterTable
ALTER TABLE "itineraries" ADD COLUMN     "preferenceId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "preferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
