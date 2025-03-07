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

   // System message: General rules and formatting
   const systemMessage = {
      role: 'system',
      content: `
      You are a travel itinerary generator. Your job is to create personalized travel itineraries based on user preferences.
   
      ### Rules:
      - Suggest a destination within Europe (excluding the UK). You are encouraged to suggest hidden gems or lesser-known destinations, such as Montenegro, Slovenia, or other unique locations that provide distinct travel experiences.
      - Avoid repeating destinations that have already been suggested to the user.
      - Ensure cultural and historical details are woven into the descriptions of each activity, providing context and enriching the travel experience.
      - Variety in activities is key: Include a mix of morning, afternoon, and evening activities, ensuring that the itinerary remains dynamic and engaging throughout the day.
      - Meals: Recommend local dishes for each meal, reflecting the culture and cuisine of the destination.
      - Commute time should be minimized by focusing primarily on attractions within the landing city. For trips lasting 5 days or more, suggest up to two additional cities, but this is optional and should enhance the experience.
      - Ensure the itinerary is tailored to the budget and trip duration provided by the user, balancing both relaxation and exploration.
      - For longer trips, you may also recommend detours that allow for an extended journey with a unique cultural twist.
      
      ### Output Format:
      Respond only in JSON. No explanations, no extra text. Wrap the JSON response in triple backticks (\`\`\`json ... \`\`\`).
   
      \`\`\`json
      {
         "destination_country": "Name of the country",
         "landingCity": "City where the user will land",
         "returnCity": "City where the user will return",
         "landingAirport": "IATA 3-letter code",
         "returnAirport": "IATA 3-letter code",
         "itinerary": [
            {
               "day": 1,
               "activities": [
                  {
                     "time": "09:00",
                     "description": "Arrival and hotel check-in",
                     "details": "Settle into your accommodation, rest, and freshen up before heading out."
                  }
               ]
            }
         ]
      }
      \`\`\`
   `,
   }

   // User message: User-specific preferences
   const userMessage = {
      role: 'user',
      content: `### User Preferences:\n${JSON.stringify(answers, null, 2)}`,
   }

   const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
         { role: 'system', content: systemMessage.content },
         { role: 'user', content: userMessage.content },
      ] as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      response_format: { type: "json_object" },
   })

   try {
      let responseText = completion.choices[0].message.content ?? '';
   
      responseText = responseText.replace(/```json|```/g, '').trim();
   
      // Ensure valid JSON parsing
      const JSONparsedItinerary = JSON.parse(responseText);
   
      // Save itinerary to the database
      const itinerary = await prisma.itinerary.create({
         data: {
            generatedItinerary: JSONparsedItinerary,
            userId,
            preferenceId: preference.id,
         },
      });
   
      return responseText;
   } catch (error) {
      console.error('Error in handleGenerateItinerary function:', error);
      throw error;
   }
}
