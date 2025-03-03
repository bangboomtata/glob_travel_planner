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

export async function fetchFlightOffers(
   origin: string,
   destination: string,
   departureDate: string,
   returnDate: string,
   adults: number = 1,
   children: number = 0,
   nonStop: boolean = false
) {
   return flightData
}

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

// export async function fetchFlightOffers(
//    origin: string,
//    destination: string,
//    departureDate: string,
//    returnDate: string,
//    adults: number = 1,
//    children: number = 0,
//    nonStop: boolean = false
// ) {
//    try {
//       // Create a cache key from the request parameters
//       const cacheKey = JSON.stringify({
//          origin,
//          destination,
//          departureDate,
//          returnDate,
//          adults,
//          children,
//          nonStop
//       })

//       // Check cache
//       if (flightOffersCache && 
//           flightOffersCache.key === cacheKey && 
//           Date.now() - flightOffersCache.timestamp < CACHE_DURATION) {
//          console.log('Using cached flight offers')
//          return flightOffersCache.data
//       }

//       console.log('Fetching fresh flight offers')
//       const token = await getAmadeusToken()
//       const endpoint = 'https://test.api.amadeus.com/v2/shopping/flight-offers'

//       const params = new URLSearchParams({
//          originLocationCode: origin,
//          destinationLocationCode: destination,
//          departureDate: departureDate,
//          returnDate: returnDate,
//          adults: adults.toString(),
//          children: children.toString(),
//          nonStop: nonStop.toString(),
//          currencyCode: 'GBP',
//          max: '20',
//       })

//       console.log('API Request:', {
//          url: `${endpoint}?${params.toString()}`,
//          headers: {
//             Authorization: `Bearer ${token}`,
//          }
//       })

//       const response = await fetch(`${endpoint}?${params.toString()}`, {
//          method: 'GET',
//          headers: {
//             Authorization: `Bearer ${token}`,
//          },
//       })

//       if (!response.ok) {
//          const errorText = await response.text()
//          console.error('API Error Response:', errorText)
//          throw new Error(`Failed to fetch flight offers: ${response.statusText}`)
//       }

//       const data = await response.json()
      
//       // Update cache
//       flightOffersCache = {
//          key: cacheKey,
//          data: data,
//          timestamp: Date.now()
//       }

//       return data
//    } catch (error) {
//       console.error('Error fetching flight offers:', error)
//       return { error: (error as Error).message }
//    }
// }

