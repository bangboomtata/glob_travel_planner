/*
  Warnings:

  - You are about to drop the `Itinerary` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ItineraryStatus" AS ENUM ('UNBOOKED', 'BOOKED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QuestionType" ADD VALUE 'DISLIKE_ACTIVITIES';
ALTER TYPE "QuestionType" ADD VALUE 'TRAVEL_TASTE_2';
ALTER TYPE "QuestionType" ADD VALUE 'WEATHER';

-- DropForeignKey
ALTER TABLE "Itinerary" DROP CONSTRAINT "Itinerary_userId_fkey";

-- DropTable
DROP TABLE "Itinerary";

-- CreateTable
CREATE TABLE "itineraries" (
    "id" SERIAL NOT NULL,
    "generatedItinerary" JSONB NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "ItineraryStatus" NOT NULL DEFAULT 'UNBOOKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flights" (
    "id" SERIAL NOT NULL,
    "flightDetails" JSONB,
    "itineraryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flights_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itineraries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
