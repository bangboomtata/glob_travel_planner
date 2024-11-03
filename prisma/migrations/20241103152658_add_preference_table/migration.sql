/*
  Warnings:

  - You are about to drop the `Poyeah` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Poyeah";

-- CreateTable
CREATE TABLE "Hoyeah" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "Hoyeah_pkey" PRIMARY KEY ("id")
);
