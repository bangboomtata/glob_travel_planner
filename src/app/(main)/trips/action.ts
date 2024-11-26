'use server'

import { PrismaClient, QuestionType } from '@prisma/client'

const prisma = new PrismaClient()

export async function getItinerary () {
  const data = await prisma.itinerary.findFirst({
    orderBy: {
      id: 'desc' // Replace 'id' with the field you want to sort by
    }
  })
  return data
}