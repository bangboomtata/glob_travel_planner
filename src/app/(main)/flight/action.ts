'use server'

import { getAmadeusToken } from '@/lib/utils'
import flightData from './flightOfferDataExample.json'
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

export async function purchaseFlight(flightDetails: any, itineraryId: number) {
  try {
    // Validate input
    if (!flightDetails || !itineraryId) {
      throw new Error('Missing required fields')
    }

    // Create flight record
    const flight = await prisma.flight.create({
      data: {
        flightDetails,
        itineraryId,
      },
    })

    // Update itinerary status to BOOKED
    await prisma.itinerary.update({
      where: {
        id: itineraryId,
      },
      data: {
        status: 'BOOKED',
      },
    })

    revalidatePath('/trips')
    return { success: true, data: flight }
  } catch (error) {
    console.error('Error creating flight:', error)
    return { success: false, error: 'Failed to purchase flight' }
  }
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

