'use server'

import { PrismaClient, QuestionType } from '@prisma/client'
import { OpenAI } from 'openai'
import fs from 'fs/promises'
import path from 'path'

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

export async function loadAndSaveQuestions() {
   try {
      const filePath = path.join(process.cwd(), 'src/app/(main)/preference/questions.json')
      const fileContent = await fs.readFile(filePath, 'utf-8')
      const questions = JSON.parse(fileContent)

      for (const question of questions) {
         const existingQuestion = await prisma.question.findFirst({
            where: { text: question.question }
         })

         if (existingQuestion) {
            // Check if updates are needed
            const hasChanges =
               existingQuestion.type !== (question.type as QuestionType) ||
               JSON.stringify(existingQuestion.options) !== JSON.stringify(question.options)

            if (hasChanges) {
               await prisma.question.update({
                  where: { id: existingQuestion.id },
                  data: {
                     type: question.type as QuestionType,
                     options: question.options || []
                  }
               })
               console.log(`Updated: ${question.question}`)
            }
         } else {
            // Create new question if not found
            await prisma.question.create({
               data: {
                  text: question.question,
                  type: question.type as QuestionType,
                  options: question.options || []
               }
            })
            console.log(`Added: ${question.question}`)
         }
      }
   } catch (error) {
      console.error('Error loading or saving questions:', error)
   }
}

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

   // Step 1: Initial instructions call
   const initialMessage: { role: 'system' | 'user'; content: string }[] = [
      {
         role: 'system',
         content: `
         You are a travel itinerary generator. Your job is to create personalized travel itineraries based on user preferences.
         Follow the strict formatting and JSON structure I will provide in later messages.`,
      },
      {
         role: 'user',
         content: `
         Based on the user preferences, generate a recommended travel destination and a detailed day-by-day travel itinerary in JSON format.
         Avoid repetitive recommendations unless the inputs are identical. Prioritize diverse countries and unique activities.
         
         ### Requirements:
         1. Suggest a **destination country** in Europe, outside of UK and create an **itinerary** that includes:
            - Activities: Specify time, description, and detailed information for each activity or location. Include must go typical tourist spots.
            Remember to include meal times, you do not have to specify eating where but you can recommend famous local dishes.
            - Detailed Information: Add cultural, historical, or practical details to enhance the experience such as what is famous
            about that place that makes it a must visit place and what is there to do.
 
         2. **Customization**: Ensure the destination and itinerary align with the provided preferences, including budget, duration, and interest areas (e.g., historical sites, nature, food).
 
         3. **Formatting**: Respond only in JSON format without explanations or additional text. Structure the JSON as:
            - "destination_country": Name of the country.
            - "itinerary": An array of days, each containing activities with clear time, description, and details.
            - "landingCity": Name of the city where the user will land. Ideally, select a major city with a main airport in the country.
            - "returnCity": Name of the city where the user will return back from. Ideally, select a major city with a main airport in the country.
            - "landingAirport": IATA 3 letter airport code
            - "returnAirport": IATA 3 letter airport code
 
         4. **Guidelines**:
            - Include day-by-day itineraries starting from morning to evening.
            - Ensure variety in activities, leave time for meals and transportation.
            - Transportation: Long commutes between cities can be done occassionally but not most of the trip.
            Reduce travel time between activities to maximize time spent at each location. Maximum 2 cities to visit.
            - For higher budgets, prioritize higher spending countries, and for lower budgets, suggest cost-effective countries.
         
         **Example JSON Format for Response:**
         [
            {
               "day": 1,
               "activities": [
                  {
                  "time": "09:00",
                  "description": "Arrival and hotel check-in",
                  "details": "Settle into your accommodation, rest, and freshen up before heading out."
                  },
                  {
                  "time": "11:00",
                  "description": "City orientation walk",
                  "details": "Explore the historic Gothic Quarter, including notable sites like Plaça Reial and Santa Maria del Pi church."
                  },
                  {
                  "time": "13:00",
                  "description": "Lunch at a local restaurant",
                  "details": "Enjoy authentic Spanish tapas at La Boqueria market or a nearby eatery."
                  },
                  {
                  "time": "15:00",
                  "description": "Visit La Sagrada Família",
                  "details": "Tour Gaudí’s iconic basilica and learn about its unique architectural style."
                  },
                  {
                  "time": "18:00",
                  "description": "Relax at Parc de la Ciutadella",
                  "details": "Take a stroll or enjoy a boat ride in this picturesque park."
                  },
                  {
                  "time": "20:00",
                  "description": "Dinner at a seaside restaurant",
                  "details": "Dine on fresh seafood at a restaurant overlooking Barceloneta Beach."
                  }
               ]
            },
         ]
         `,
      },
   ]

   const initialCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: initialMessage,
   })

   // Add the initial response to the context
   const initialResponse = initialCompletion.choices[0].message.content ?? ''

   // Step 2: User preferences call
   const userPreferencesMessage = [
      {
         role: 'assistant',
         content: initialResponse, // Use the response from the first call as context
      },
      {
         role: 'user',
         content: `### Preferences Provided:\n${JSON.stringify(answers, null, 2)}`,
      },
   ]

   const finalCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [...initialMessage, ...userPreferencesMessage] as any,
   })

   const responseText = finalCompletion.choices[0].message.content ?? ''
   const JSONparsedItinerary = JSON.parse(responseText)

   // Save itinerary to the database
   try {
      const itinerary = await prisma.itinerary.create({
         data: {
            generatedItinerary: JSONparsedItinerary,
            userId,
         },
      })
   } catch (error) {
      console.error('Error in handle GenerateItinerary function:', error)
      throw error
   }

   return responseText
}