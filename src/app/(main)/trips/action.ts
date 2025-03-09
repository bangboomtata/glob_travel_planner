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

export async function getItineraryPreferenceById(tripId: number) {
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

export async function viewTripFlight(tripId: number) {
   try {
      const flightDetails = await prisma.flight.findFirst({
         where: { itineraryId: tripId },
         select: {
            id: true,
            flightDetails: true,
            itineraryId: true
         }
      });
      
      if (!flightDetails) {
         throw new Error('No flight details found for this trip');
      }

      // Parse JSON if it's a string, otherwise use as is
      const parsedFlightDetails = typeof flightDetails.flightDetails === 'string' 
         ? JSON.parse(flightDetails.flightDetails as string)
         : flightDetails.flightDetails;

      return {
         ...parsedFlightDetails,
         flightId: flightDetails.id,
         itineraryId: flightDetails.itineraryId
      };
   } catch (error) {
      console.error('Error fetching flight details:', error);
      throw new Error('Failed to fetch flight details');
   }
}
