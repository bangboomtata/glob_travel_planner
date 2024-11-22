'use server'

import { PrismaClient, QuestionType } from '@prisma/client'
import { OpenAI } from 'openai'

const prisma = new PrismaClient()
const openai = new OpenAI()

export async function getPreferenceQuestions() {
   const data = await prisma.question.findMany({
      orderBy: {
         id: 'asc', // Replace 'id' with the field you want to sort by
      },
   })
   return data
}

export async function getPreferences() {
   const data = await prisma.preference.findMany({
      orderBy: {
         id: 'asc', // Replace 'id' with the field you want to sort by
      },
   })
   return data
}

export async function getPreferencesByID(id: string) {
   const data = await prisma.preference.findUnique({
      where: {
         id: parseInt(id),
      },
   })
   return data
}
export async function getUserbyUserId(userId: number) {
   const data = await prisma.user.findUnique({
      where: {
         id: 1,
      },
   })
   return data
}

export async function AIPrompt(preferenceAnswers: Record<string, any>) {}

export async function handleGenerateItinerary({
   userId,
   answers,
}: {
   userId: number
   answers: any
}) {
   // Save preferences to the database
   const preference = await prisma.preference.create({
      data: {
         answers,
         userId,
      },
   })

   // Generate ChatGPT prompt
   const prompt = `
      Based on the following preferences, generate a destination country and a detailed 
      travel itinerary, including activities, restaurants, time and duration spent at each location, 
      and any other relevant information about the places. Prioritize destinations that align with 
      the preferences while allowing for an enjoyable experience regardless of budget constraints. 
      If the budget is high, suggest options that balance affordability and value, enabling the 
      traveler to save unspent money without compromising the quality of the trip. Consider countries 
      outside the UK if the budget and preferences allow.
      ${JSON.stringify(answers, null, 2)}
   `

   // Call OpenAI API
   const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
   })

   // Extract and return the response
   const responseText = completion.choices[0].message.content ?? ''

   // Save itinerary to the database
   const itinerary = await prisma.itinerary.create({
      data: {
         generatedItinerary: responseText,
         userId,
      },
   })
   return responseText
}
