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

const prompt = `
You are a travel planning assistant. Based on the preferences provided, generate a recommended travel destination and a detailed day-by-day travel itinerary in JSON format. 

### Requirements:
1. Suggest a **destination country** prerably in Europe and create an **itinerary** that includes:
   - Activities: Specify time, description, and detailed information for each activity.
   - Restaurants: Recommend meals with timings and notable dishes.
   - Duration: Mention how much time is spent at each location or activity.
   - Relevant details: Add cultural, historical, or practical details to enhance the experience.

2. **Customization**: Ensure the destination and itinerary align with the provided preferences, including budget, duration, and interest areas (e.g., historical sites, nature, food).

3. **Formatting**: Respond only in JSON format without explanations or additional text. Structure the JSON as:
   - "destination_country": Name of the country.
   - "itinerary": An array of days, each containing activities with clear time, description, and details.

4. **Guidelines**:
   - Balance affordability and quality, recommending destinations outside the UK where budgets permit.
   - Include day-by-day itineraries starting from morning to evening.
   - Ensure variety in activities and include mealtime details.
   - For higher budgets, prioritize luxury or unique experiences, and for lower budgets, suggest cost-effective options.

### Preferences Provided:
${JSON.stringify(answers, null, 2)}

### Example Output:
{
  "destination_country": "Italy",
  "itinerary": [
    {
      "day": 1,
      "activities": [
        {
          "time": "09:00",
          "description": "Arrival and hotel check-in",
          "details": "Settle into your accommodation in Rome and get ready to explore."
        },
        {
          "time": "11:00",
          "description": "Visit Colosseum",
          "details": "Explore the iconic Roman amphitheater and learn about its historical significance."
        },
        {
          "time": "13:00",
          "description": "Lunch at Trattoria Da Enzo",
          "details": "Try classic Roman dishes like Cacio e Pepe and Carbonara."
        }
      ]
    },
    {
      "day": 2,
      "activities": [
        {
          "time": "08:00",
          "description": "Breakfast at hotel",
          "details": "Start your day with a traditional Italian breakfast."
        },
        {
          "time": "10:00",
          "description": "Explore Vatican City",
          "details": "Visit St. Peter's Basilica and the Vatican Museums for a dose of art and history."
        }
      ]
    }
  ]
}
`

   // Call OpenAI API
   const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
   })

   const responseText = completion.choices[0].message.content ?? ''
   const JSONparsedItinerary = JSON.parse(responseText)

   // Save itinerary to the database
   const itinerary = await prisma.itinerary.create({
      data: {
         generatedItinerary: JSONparsedItinerary,
         userId,
      },
   })
   return responseText
}
