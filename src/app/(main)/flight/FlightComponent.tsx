'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getItineraryById } from '../trips/action'

interface Itinerary {
   id: number
   Itinerary: {
      landingCity?: string
      [key: string]: any
   }
   preference: {
      answers: Record<
         string,
         {
            questionType: string
            options?: string[]
            date?: string
            value?: string | number | { adults: number; children: number }
         }
      >
   }
}

interface FlightOffer {
   id: string
   price: { total: string }
   itineraries: {
      segments: {
         departure: { iataCode: string; at: string }
         arrival: { iataCode: string; at: string }
      }[]
   }[]
}

// Transform function to convert API response to component type
function transformItineraryResponse(
   response: ItineraryResponse | null
): Itinerary | null {
   if (!response || !response.preference) return null

   const answers = response.preference.answers as Record<
      string,
      {
         questionType: string
         options?: string[]
         date?: string
         value?: string
      }
   >

   return {
      id: response.id,
      Itinerary: response.generatedItinerary as { [key: string]: any; landingCity?: string } || {},
      preference: {
         answers: answers || {},
      },
   }
}

export default function FlightBooking() {
   const searchParams = useSearchParams()
   const [itinerary, setItinerary] = useState<Itinerary | null>(null)
   const [flightOffers, setFlightOffers] = useState<FlightOffer[] | null>(null)
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      async function fetchItineraryAndFlights() {
         try {
            const tripId = searchParams.get('tripId')
            if (!tripId) return

            const response = await getItineraryById(Number(tripId))
            const transformedItinerary = transformItineraryResponse(response)
            setItinerary(transformedItinerary)
            if ((transformedItinerary?.Itinerary as any)?.landingCity) {
               let destination

               if (transformedItinerary?.Itinerary?.landingCity) {
                  destination = transformedItinerary.Itinerary.landingCity
                  console.log('Found destination:', destination)
               } else {
                  console.error('No destination found in itinerary')
               }

               if (transformedItinerary?.preference?.answers) {
                  const preferences = transformedItinerary.preference.answers
                  console.log('Processing preferences:', preferences)

                  let origin, departureDate

                  for (const key in preferences) {
                     const pref = preferences[key]

                     if (pref.questionType === 'AIRPORT' && pref.options) {
                        if (pref.options.includes('London')) {
                           origin = 'LON'
                           console.log('Found origin:', origin)
                        } else if (pref.options.includes('Birmingham')) {
                           origin = 'BHX'
                           console.log('Found origin:', origin)
                        } else if (pref.options.includes('Birmingham')) {
                           origin = 'MAN'
                           console.log('Found origin:', origin)
                        }
                     }

                     if (pref.questionType === 'START_DATE' && pref.date) {
                        departureDate = new Date(pref.date)
                           .toISOString()
                           .split('T')[0]
                        console.log('Found departure date:', departureDate)
                     }
                  }

                  if (!origin) {
                     console.error('No origin airport found in preferences')
                  }
                  if (!destination) {
                     console.error('No destination found in preferences')
                  }
                  if (!departureDate) {
                     console.error('No departure date found in preferences')
                  }

                  if (origin && destination && departureDate) {
                     console.log('Fetching flights with params:', {
                        origin,
                        destination,
                        departureDate,
                     })
                     const res = await fetch(
                        `/api/flights?origin=${origin}&destination=${destination}&departureDate=${departureDate}`
                     )
                     const data = await res.json()
                     setFlightOffers(data.data || [])
                  } else {
                     console.log('Missing required flight search parameters')
                     setFlightOffers([])
                  }
               }
            }
         } catch (error) {
            console.error('Error fetching itinerary or flights:', error)
         } finally {
            setLoading(false)
         }
      }

      fetchItineraryAndFlights()
   }, [searchParams])

   if (loading) {
      return <div className="text-center text-white">Loading...</div>
   }

   if (!itinerary) {
      return <div className="text-white">Itinerary not found</div>
   }

   return (
      <div className="p-4">
         <h1 className="mb-4 text-2xl font-bold text-white">Flight Booking</h1>

         <h2 className="mb-2 text-xl font-semibold text-white">
            Itinerary Details
         </h2>
         <pre className="overflow-auto rounded-lg bg-gray-800 p-4 text-white">
            {JSON.stringify(itinerary, null, 2)}
         </pre>

         <h2 className="mb-2 mt-6 text-xl font-semibold text-white">
            Available Flights
         </h2>
         {flightOffers ? (
            flightOffers.length > 0 ? (
               <div className="space-y-4">
                  {flightOffers.map((flight) => (
                     <div
                        key={flight.id}
                        className="rounded-lg bg-gray-900 p-4 text-white"
                     >
                        <p>
                           <strong>Price:</strong> £{flight.price.total}
                        </p>
                        {flight.itineraries[0]?.segments.map(
                           (segment, index) => (
                              <div key={index} className="mt-2">
                                 <p>
                                    <strong>Departure:</strong>{' '}
                                    {segment.departure.iataCode} at{' '}
                                    {segment.departure.at}
                                 </p>
                                 <p>
                                    <strong>Arrival:</strong>{' '}
                                    {segment.arrival.iataCode} at{' '}
                                    {segment.arrival.at}
                                 </p>
                              </div>
                           )
                        )}
                     </div>
                  ))}
               </div>
            ) : (
               <p className="text-white">No available flights.</p>
            )
         ) : (
            <p className="text-white">Fetching flights...</p>
         )}
      </div>
   )
}
