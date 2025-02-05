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
      - Suggest a destination in Europe (excluding the UK).
      - Include cultural/historical details in activity descriptions.
      - Ensure variety in activities (morning to evening).
      - Recommend local dishes during meal times.
      - Minimize long commutes by focusing on tourist destinations within the landing city.
      For trips of 5 days or more, include up to two additional cities, though this is optional.
      - Tailor budget and trip duration based on user preferences.
      
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
   
      responseText = responseText.replace(/\`\`\`json|\`\`\`/g, '').trim();
   
      // Ensure valid JSON parsing
      const JSONparsedItinerary = JSON.parse(responseText);
   
      // Save itinerary to the database
      const itinerary = await prisma.itinerary.create({
         data: {
            generatedItinerary: JSONparsedItinerary,
            userId,
         },
      });
   
      return responseText;
      // return JSONparsedItinerary;
   } catch (error) {
      console.error('Error in handleGenerateItinerary function:', error);
      throw error;
   }
}
