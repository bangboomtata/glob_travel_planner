'use server'

import { PrismaClient, QuestionType } from '@prisma/client'
import { OpenAI } from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

export async function handleGenerateItinerary({
   answers,
}: {
   answers: any
}) {
   // Get the current session
   const session = await getServerSession(authOptions)
   if (!session?.user?.id) {
      throw new Error('Not authenticated')
   }
   const userId = session.user.id

   console.log('userId:', userId, typeof userId);

   const preference = await prisma.preference.create({
      data: {
         answers,
         userId,
      },
   })

   const systemMessage = {
      role: 'system',
      content: `
      You are a travel itinerary generator. Your job is to create personalized travel itineraries based on user preferences.
   
      ### Rules:
      - Suggest a European destination (excluding the UK), prioritizing lesser-visited countries and cities.
      - Ensure cultural and historical details are woven into the descriptions of each activity, providing context and enriching the travel experience.
      - Include morning, afternoon, and evening activities, recommend multiple famous tourist attractions and sightseeing spots, grouping nearby locations together whenever possible to minimize travel time
      - Meals: Recommend local dishes for each meal, reflecting local culture and cuisine.
      - Avoid listing only general areas like towns or regions—include specific landmarks, markets, beaches, or well-known attractions that can be found on Google Maps (e.g., instead of 'Explore Narvik,' specify 'Narvik War Museum and Narvikfjellet Ski Resort').
      - Keep all overnight stays in the same city as the arrival and return city.
      - Ensure the arrival and departure are through major airports with good flight connections.
      - Commute time should be minimized by focusing primarily on attractions within the landing city. For trips lasting 5 days or more, suggest up to two additional cities, but this is optional and should enhance the experience.
      - Ensure the itinerary is tailored to the user's budget and trip duration.

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
                     "time": "10:00",
                     "details": "Discover masterpieces of the Renaissance at one of Europe's most renowned art museums.",
                     "description": "Visit the Uffizi Gallery",
                     "placeName": "Uffizi Gallery",
                     "googleMap": "https://www.google.com/maps/search/?api=1&query=Uffizi+Gallery+city+country"
                  }
               ],
            }
         ]
      }
      \`\`\`
   `,
   }

   const suggestedCountries = [
      "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", 
      "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", 
      "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", 
      "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", 
      "Slovenia", "Spain", "Sweden"
    ];
    
    const userMessage = {
      role: 'user',
      content: `User preferences:\n${JSON.stringify(answers, null, 2)}\nTry choosing a destination from: ${suggestedCountries.join(", ")} if it fits the preferences.`
    };

   const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.8,
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
