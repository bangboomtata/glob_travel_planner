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
   nonStop: boolean = false,
   tripId?: number
) {
   try {
      // Log all inputs
      console.log('Raw inputs:', { origin, destination, departureDate, returnDate })
      console.log('Type of origin:', typeof origin)

      const token = await getAmadeusToken()
      const endpoint = 'https://test.api.amadeus.com/v2/shopping/flight-offers'
      
      // Create and log params separately
      const params = new URLSearchParams({
         originLocationCode: origin,
         destinationLocationCode: destination,
         departureDate: departureDate,
         returnDate: returnDate,
         adults: adults.toString(),
         children: children.toString(),
         nonStop: nonStop.toString(),
         currencyCode: 'GBP',
         max: '20'
      })

      const url = `${endpoint}?${params.toString()}`
      console.log('Constructed URL:', url)

      const response = await fetch(url, {
         headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
         }
      })

      console.log('Response status:', response.status)

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
      if (tripId && (!data.data || data.data.length === 0)) {
         await updateItineraryStatus(tripId, true)
      }
      
      // Update cache
      flightOffersCache = {
         key: JSON.stringify({
            origin,
            destination,
            departureDate,
            returnDate,
            adults,
            children,
            nonStop
         }),
         data: data,
         timestamp: Date.now()
      }

      return data
   } catch (error) {
      console.error('Error fetching flight offers:', error)
      return { error: (error as Error).message }
   }
}

