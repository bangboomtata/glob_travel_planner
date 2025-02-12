'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { getItineraryPreferenceById } from '../trips/action'
import { Prisma } from '@prisma/client'
import { fetchFlightOffers } from './action'

enum ItineraryStatus {
   UNBOOKED = 'UNBOOKED',
   BOOKED = 'BOOKED',
}

interface Activity {
   time: string
   details: string
   description: string
}

interface DayItinerary {
   day: number
   activities: Activity[]
}

interface GeneratedItinerary {
   itinerary: DayItinerary[]
   returnCity: string
   landingCity: string
   returnAirport: string
   landingAirport: string
   destination_country: string
}

interface Answer {
   options?: string[]
   question: string
   questionType: string
   date?: string
   value?:
      | {
           adults?: number
           children?: number
        }
      | number
}

interface Preference {
   id: number
   userId: number
   answers: {
      [key: string]: Answer
   }
   createdAt: Date
}

interface Flight {
   id: number
   flightDetails: Prisma.JsonValue
   itineraryId: number
}

interface Itinerary {
   id: number
   generatedItinerary: GeneratedItinerary
   userId: number
   status: ItineraryStatus
   createdAt: Date
   preferenceId: number
   preference: Preference
   flight?: Flight
}

interface FlightOffer {
   // Define the structure of a FlightOffer
}

// Type guard to check if a value matches GeneratedItinerary interface
function isGeneratedItinerary(value: unknown): value is GeneratedItinerary {
   if (typeof value !== 'object' || value === null) return false

   const v = value as GeneratedItinerary
   return (
      Array.isArray(v.itinerary) &&
      typeof v.returnCity === 'string' &&
      typeof v.landingCity === 'string' &&
      typeof v.returnAirport === 'string' &&
      typeof v.landingAirport === 'string' &&
      typeof v.destination_country === 'string'
   )
}

// Function to safely convert Prisma data to your Itinerary type
function convertToItinerary(data: any): Itinerary | null {
   if (!data) return null

   // Ensure generatedItinerary is of the correct type
   if (!isGeneratedItinerary(data.generatedItinerary)) {
      throw new Error('Invalid generatedItinerary format')
   }

   return {
      id: data.id,
      generatedItinerary: data.generatedItinerary,
      userId: data.userId,
      status: data.status,
      createdAt: new Date(data.createdAt),
      preferenceId: data.preferenceId,
      preference: {
         ...data.preference,
         createdAt: new Date(data.preference.createdAt),
      },
      flight: data.flight,
   }
}

export default function FlightBooking() {
   const searchParams = useSearchParams()
   const [itineraryPreference, setItineraryPreference] =
      useState<Itinerary | null>(null)
   const [loading, setLoading] = useState(true)

   // api response
   // const [flightOffers, setFlightOffers] = useState<FlightOffer[] | null>(null)

   // json data response
   const [flightOffers, setFlightOffers] = useState<any>(null)

   const initialFetchMade = useRef(false)

   useEffect(() => {
      if (initialFetchMade.current) return

      async function fetchItineraryAndFlights() {
         try {
            const tripId = searchParams.get('tripId')
            if (!tripId) {
               console.error('No tripId found in search params')
               return
            }

            const itineraryPreferenceData = await getItineraryPreferenceById(
               Number(tripId)
            )
            const convertedData = convertToItinerary(itineraryPreferenceData)
            setItineraryPreference(convertedData)

            const landingAirport =
               convertedData?.generatedItinerary.landingAirport || ''
            const departureDate =
               Object.values(convertedData?.preference?.answers || {}).find(
                  (answer) => answer.questionType === 'START_DATE'
               )?.date || ''

            console.log('Raw departure date:', departureDate)

            let formattedDepartureDate = ''
            try {
               if (departureDate) {
                  if (departureDate.includes('/')) {
                     const [day, month, year] = departureDate.split('/')
                     formattedDepartureDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
                  } else {
                     formattedDepartureDate = new Date(departureDate)
                        .toISOString()
                        .split('T')[0]
                  }
               }
            } catch (error) {
               console.error('Error formatting departure date:', error)
            }

            console.log('Formatted departure date:', formattedDepartureDate)

            const durationString = Object.values(
               convertedData?.preference?.answers || {}
            ).find((answer) => answer.questionType === 'TRIP_DURATION')
               ?.options?.[0]

            // Format return date to YYYY-MM-DD
            const formattedReturnDate = (): string => {
               if (departureDate && durationString) {
                  try {
                     const numberOfDays = parseInt(durationString.split(' ')[0])
                     let returnDate

                     if (departureDate.includes('/')) {
                        const [day, month, year] = departureDate.split('/')
                        returnDate = new Date(
                           parseInt(year),
                           parseInt(month) - 1,
                           parseInt(day) + numberOfDays - 1
                        )
                     } else {
                        returnDate = new Date(departureDate)
                        returnDate.setDate(
                           returnDate.getDate() + numberOfDays - 1
                        )
                     }

                     return returnDate.toISOString().split('T')[0]
                  } catch (error) {
                     console.error('Error calculating return date:', error)
                     return ''
                  }
               }
               return ''
            }

            const numberOfAdults =
               (Object.values(convertedData?.preference?.answers || {}).find(
                  (answer) => answer.questionType === 'NUMBER_OF_ADULTS'
               )?.value as number) || 1

            const numberOfChildren =
               (Object.values(convertedData?.preference?.answers || {}).find(
                  (answer) => answer.questionType === 'NUMBER_OF_CHILDREN'
               )?.value as number) || 0

            let origin: string
            const departureCity = Object.values(
               convertedData?.preference?.answers || {}
            ).find((answer) => answer.questionType === 'AIRPORT')?.options?.[0]

            if (departureCity === 'London') {
               origin = 'LON'
            } else if (departureCity === 'Manchester') {
               origin = 'MAN'
            } else if (departureCity === 'Birmingham') {
               origin = 'BHX'
            } else {
               throw new Error('Invalid departure city')
            }

            console.log('Debug info:', {
               origin,
               landingAirport,
               departureDate: formattedDepartureDate,
               returnDate: formattedReturnDate(),
               adults: numberOfAdults,
               children: numberOfChildren,
            })

            if (
               origin &&
               landingAirport &&
               formattedDepartureDate &&
               formattedReturnDate()
            ) {
               const offers = await fetchFlightOffers(
                  origin,
                  landingAirport,
                  formattedDepartureDate,
                  formattedReturnDate(),
                  numberOfAdults,
                  numberOfChildren,
                  false
               )
               // api response
               // setFlightOffers(offers)

               // json data response
               setFlightOffers(offers)
            } else {
               console.error('Missing required flight information:', {
                  origin,
                  landingAirport,
                  departureDate: formattedDepartureDate,
                  returnDate: formattedReturnDate(),
               })
            }
         } catch (error) {
            console.error('Error fetching itinerary or flights:', error)
         } finally {
            setLoading(false)
            // Mark that we've made the initial fetch
            initialFetchMade.current = true
         }
      }

      fetchItineraryAndFlights()
   }, [searchParams])

   if (loading) {
      return <div className="text-center text-white">Loading...</div>
   }

   if (!itineraryPreference) {
      return <div className="text-white">Itinerary not found</div>
   }

   return (
      <div className="p-4">
         <h1 className="mb-4 text-2xl font-bold text-white">Flight Booking</h1>

         {/* <h2 className="mb-2 text-xl font-semibold text-white">
            Itinerary Details
         </h2>
         <pre className="overflow-auto rounded-lg bg-gray-800 p-4 text-white">
            {JSON.stringify(itineraryPreference, null, 2)}
         </pre> */}

         {/* Displaying flight offers */}
         {flightOffers.data.map((offer: any) => (
            <div 
               key={offer.id} 
               className="mb-4 rounded-lg bg-gray-800 p-4 text-white"
            >
               <div className="flex justify-between items-center mb-3">
                  <div>
                     <h3 className="text-xl font-bold">{offer.validatingAirlineCodes.join(', ')}</h3>
                     <p className="text-gray-300">Flight ID: {offer.id}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-2xl font-bold">{offer.price.total} {offer.price.currency}</p>
                     <p className="text-sm text-gray-300">per person</p>
                  </div>
               </div>

               {offer.itineraries.map((itinerary: any, index: number) => (
                  <div key={index} className="mb-2 border-t border-gray-700 pt-2">
                     <p className="font-semibold mb-1">
                        {index === 0 ? 'Outbound' : 'Return'} Flight
                     </p>
                     {itinerary.segments.map((segment: any, segIdx: number) => (
                        <div key={segIdx} className="flex justify-between items-center mb-2">
                           <div>
                              <p className="font-medium">
                                 {segment.departure.iataCode} → {segment.arrival.iataCode}
                              </p>
                              <p className="text-sm text-gray-300">
                                 {new Date(segment.departure.at).toLocaleString()} - 
                                 {new Date(segment.arrival.at).toLocaleString()}
                              </p>
                           </div>
                           <div className="text-right">
                              <p>{segment.carrierCode} {segment.number}</p>
                              <p className="text-sm text-gray-300">
                                 Duration: {segment.duration}
                              </p>
                           </div>
                        </div>
                     ))}
                  </div>
               ))}
            </div>
         ))}

         <h2 className="mb-2 mt-4 text-xl font-semibold text-white">
            Flight Offers
         </h2>
         <pre className="overflow-auto whitespace-pre-wrap rounded-lg bg-gray-800 p-4 text-white">
            {JSON.stringify(flightOffers, null, 2)}
         </pre>
      </div>
   )
}
