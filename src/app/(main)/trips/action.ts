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

export async function getItineraryById(id: number) {
  const data = await prisma.itinerary.findUnique({
    where: {
      id: id,
    },
  });
  return data;
}
