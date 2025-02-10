'use server'

import { PrismaClient, QuestionType } from '@prisma/client'
import { fetchFlightOffers } from '@/app/(main)/flight/action'

const prisma = new PrismaClient()

export async function getItinerary() {
   const data = await prisma.itinerary.findMany({
      orderBy: {
         id: 'desc',
      },
   })
   return data
}

export async function getItineraryById(tripId: number) {
   const data = await prisma.itinerary.findUnique({
    where: { id: tripId },
    include: { preference: true },
 })
   return data
}

export async function deleteItineraryById(tripId: number) {
   try {
      const deletedItinerary = await prisma.itinerary.delete({
         where: {
            id: tripId,
         },
      })
      return deletedItinerary
   } catch (error) {
      console.error('Error deleting itinerary:', error)
      throw new Error('Failed to delete itinerary')
   }
}

export async function bookTrip(tripId: number) {
   try {
      // Fetch itinerary including its preference
      const itinerary = await prisma.itinerary.findUnique({
         where: { id: tripId },
         include: { preference: true },
      })

      if (!itinerary || !itinerary.preference) {
         throw new Error('Itinerary or preference not found')
      }

      const preferences = itinerary.preference.answers as Record<string, any>

      let origin: string | undefined
      let destination: string | undefined
      let departureDate: string | undefined
      let numTravelers: number | undefined

      for (const key in preferences) {
         const preference = preferences[key]

         if (preference.questionType === 'AIRPORT') {
            if (preference.options?.includes('London')) {
               origin = 'LON'
            } else if (preference.options?.includes('Birmingham')) {
               origin = 'BHX'
            } else if (preference.options?.includes('Manchester')) {
               origin = 'MAN'
            }
         }

         if (preference.questionType === 'START_DATE') {
            departureDate = preference.date
         }

         if (preference.questionType === 'NUMBER_OF_TRAVELLERS') {
            numTravelers = preference.value?.adults
         }
      }

      if (!origin || !destination || !departureDate) {
         throw new Error('Missing required flight search parameters')
      }

      const flightOffers = await fetchFlightOffers(
         origin,
         destination,
         departureDate
      )
      return flightOffers // right until here, show available flight offers
   } catch (error) {
      console.error('Error booking trip:', error)
      return { error: (error as Error).message }
   }

   //   if (!flightOffers || flightOffers.error) {
   //     throw new Error("Failed to fetch flight offers");
   //   }

   //   const selectedFlight = flightOffers.data?.[0];

   //   if (!selectedFlight) {
   //     throw new Error("No flight offers available");
   //   }

   //   await prisma.flight.create({
   //     data: {
   //       itineraryId: tripId,
   //       flightDetails: selectedFlight,
   //     },
   //   });

   //   return { success: true, message: "Trip booked successfully!", flight: selectedFlight };
   // } catch (error) {
   //   console.error("Error booking trip:", error);
   //   return { error: (error as Error).message };
   // }
}
