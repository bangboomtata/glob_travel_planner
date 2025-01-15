'use server'

import { PrismaClient, QuestionType } from '@prisma/client'

const prisma = new PrismaClient()

export async function getItinerary () {
  const data = await prisma.itinerary.findMany({
    orderBy: {
      id: 'desc'
    }
  })
  return data
}

export async function getItineraryById(tripId: number) {
  const data = await prisma.itinerary.findUnique({
    where: {
      id: tripId,
    },
  });
  return data;
}
