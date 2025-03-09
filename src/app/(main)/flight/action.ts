'use server'

import { getAmadeusToken } from '@/lib/utils'
// import flightData from './flightOfferDataExample.json'
import { revalidatePath } from 'next/cache'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const CACHE_DURATION = 5 * 60 * 1000 

let flightOffersCache: {
  key: string
  data: any
  timestamp: number
} | null = null

// export async function fetchFlightOffers(
//    origin: string,
//    destination: string,
//    departureDate: string,
//    returnDate: string,
//    adults: number = 1,
//    children: number = 0,
//    nonStop: boolean = false
// ) {
//    return flightData
// }

export async function purchaseFlight(flightData: any, tripId: number) {
   try {
      // Create flight record
      await prisma.flight.create({
         data: {
            flightDetails: flightData,
            itineraryId: tripId,
         },
      })

      // Update itinerary flightBooked status
      await prisma.itinerary.update({
         where: { id: tripId },
         data: {
            flightBooked: true,
            // Update status to BOOKED only if both flight and hotel are booked
            status: {
               set: await checkAndUpdateBookingStatus(tripId)
            }
         },
      })

      return { success: true }
   } catch (error) {
      console.error('Error purchasing flight:', error)
      return { success: false, error: 'Failed to purchase flight' }
   }
}

// Helper function to check both bookings and return appropriate status
async function checkAndUpdateBookingStatus(tripId: number) {
   const itinerary = await prisma.itinerary.findUnique({
      where: { id: tripId },
      select: {
         flightBooked: true,
         hotelBooked: true
      }
   });

   if (!itinerary) throw new Error('Itinerary not found');

   // Return the enum value instead of string
   return (itinerary.flightBooked && itinerary.hotelBooked) ? 'BOOKED' as const : 'UNBOOKED' as const;
}

export async function updateItineraryStatus(itineraryId: number, hasNoFlights: boolean) {
  try {
    const status = hasNoFlights ? 'NO_FLIGHTS' : 'UNBOOKED'
    
    const updatedItinerary = await prisma.itinerary.update({
      where: {
        id: itineraryId
      },
      data: {
        status: status
      }
    })

    revalidatePath('/trips')
    return { success: true, data: updatedItinerary }
  } catch (error) {
    console.error('Error updating itinerary status:', error)
    return { success: false, error: 'Failed to update itinerary status' }
  }
}

export async function fetchFlightOffers(
   origin: string,
   destination: string,
   departureDate: string,
   returnDate: string,
   adults: number = 1,
   children: number = 0,
   nonStop: boolean = false
) {
   try {
      // Create a cache key from the request parameters
      const cacheKey = JSON.stringify({
         origin,
         destination,
         departureDate,
         returnDate,
         adults,
         children,
         nonStop
      })

      // Check cache
      if (flightOffersCache && 
          flightOffersCache.key === cacheKey && 
          Date.now() - flightOffersCache.timestamp < CACHE_DURATION) {
         console.log('Using cached flight offers')
         return flightOffersCache.data
      }

      console.log('Fetching fresh flight offers')
      const token = await getAmadeusToken()
      console.log('Token obtained:', token.substring(0, 10) + '...') // Log partial token for security

      const endpoint = 'https://test.api.amadeus.com/v2/shopping/flight-offers'
      
      // Add Authorization header check
      const headers = {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json'  // Add content type header
      }
      
      console.log('Request headers:', {
         Authorization: `Bearer ${token.substring(0, 10)}...`,
         'Content-Type': 'application/json'
      })

      const params = new URLSearchParams({
         originLocationCode: origin,
         destinationLocationCode: destination,
         departureDate: departureDate,
         returnDate: returnDate,
         adults: adults.toString(),
         children: children.toString(),
         nonStop: nonStop.toString(),
         currencyCode: 'GBP',
         max: '20',
      })

      const response = await fetch(`${endpoint}?${params.toString()}`, {
         method: 'GET',
         headers: headers,
      })

      // Add auth error checking
      if (response.status === 401) {
         console.error('Authentication failed. Token might be expired or invalid')
         // You might want to retry with a new token here
         throw new Error('Authentication failed')
      }

      if (!response.ok) {
         const errorData = await response.json()
         console.error('API Error Details:', {
            status: response.status,
            statusText: response.statusText,
            errors: errorData.errors
         })
         throw new Error(`Failed to fetch flight offers: ${JSON.stringify(errorData.errors)}`)
      }

      const data = await response.json()
      
      // Check if no flights are available and update itinerary status
      const tripId = new URL(origin).searchParams.get('tripId')
      if (tripId && (!data.data || data.data.length === 0)) {
        await updateItineraryStatus(parseInt(tripId), true)
      }
      
      // Update cache
      flightOffersCache = {
         key: cacheKey,
         data: data,
         timestamp: Date.now()
      }

      return data
   } catch (error) {
      console.error('Error fetching flight offers:', error)
      return { error: (error as Error).message }
   }
}

