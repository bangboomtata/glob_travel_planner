'use server'

import { PrismaClient, QuestionType } from '@prisma/client'

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

export async function viewTripHotel(hotelId: number) {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: {
        id: hotelId,
      },
    })

    if (!hotel) {
      throw new Error('Hotel not found')
    }

    // Parse JSON if it's a string, otherwise use as is
    const parsedHotelDetails = typeof hotel.hotelDetails === 'string' 
      ? JSON.parse(hotel.hotelDetails as string)
      : hotel.hotelDetails

    return {
      ...hotel,
      hotelDetails: parsedHotelDetails
    }
  } catch (error) {
    console.error('Error fetching hotel:', error)
    throw error
  }
}
