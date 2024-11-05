'use server'

import { PrismaClient, User } from '@prisma/client'

const prisma = new PrismaClient()

export async function getPreferenceQuestions() {
   const data = await prisma.question.findMany({
      orderBy: {
         id: 'asc', // Replace 'id' with the field you want to sort by
      },
   })
   return data
}

export async function getUserbyUserId(userId:number) {
   const data = await prisma.user.findUnique({
      where: {
         id: 1,
      },
   })
   return data
}

export async function handleGenerateItinerary({
   userId,
   answers,
}: {
   userId: number
   answers: any
}) {
   const preference = await prisma.preference.create({
      data: {
         answers,
         userId
      },
   })
}