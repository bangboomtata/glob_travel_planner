'use server'

import { getAmadeusToken } from '@/lib/utils'

import flightData from './flightOfferDataExample.json'

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
//       return data
//    } catch (error) {
//       console.error('Error fetching flight offers:', error)
//       return { error: (error as Error).message }
//    }
// }

