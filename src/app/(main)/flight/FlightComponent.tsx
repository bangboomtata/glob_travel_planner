'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { getItineraryPreferenceById } from '../trips/action'
import { Prisma } from '@prisma/client'
import { fetchFlightOffers } from './action'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Plane } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

function convertToItinerary(data: any): Itinerary | null {
   if (!data) return null

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
   const formatDuration = (isoDuration: string) => {
      const hourMatch = isoDuration.match(/PT(\d+)H/)
      const minuteMatch = isoDuration.match(/(\d+)M/)

      const hours = hourMatch ? Number.parseInt(hourMatch[1]) : 0
      const minutes = minuteMatch ? Number.parseInt(minuteMatch[1]) : 0

      return `${hours}h ${minutes}m`
   }

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

   useEffect(() => {
      // Clear old flight data when loading new search results
      if (typeof window !== 'undefined' && flightOffers?.data) {
         const keys = Object.keys(localStorage)
         keys.forEach((key) => {
            if (key.startsWith('flight-')) {
               localStorage.removeItem(key)
            }
         })

         // Store new flight data
         flightOffers.data.forEach((flight: any) => {
            localStorage.setItem(
               `flight-${flight.id}`,
               JSON.stringify({
                  ...flight,
                  tripId: searchParams.get('tripId'),
               })
            )
         })
      }
   }, [flightOffers?.data, searchParams])

   if (loading) {
      return <div className="text-center text-white">Loading...</div>
   }

   if (!itineraryPreference) {
      return <div className="text-white">Itinerary not found</div>
   }

   return (
      <main className="px-[70px] lg:px-[160px] xl:px-[290px]">
         <h1 className="mb-6 text-center text-2xl font-bold text-white md:text-left">
            Flight Search Results
         </h1>
         {/* <h2 className="mb-2 text-xl font-semibold text-white">
            Itinerary Details
         </h2>
         <pre className="overflow-auto rounded-lg bg-gray-800 p-4 text-white">
            {JSON.stringify(itineraryPreference, null, 2)}
         </pre> */}

         <div className="space-y-4">
            {flightOffers?.data ? (
               flightOffers.data.map((flight: any) => {
                  if (typeof window !== 'undefined') {
                     localStorage.setItem(
                        `flight-${flight.id}`,
                        JSON.stringify({
                           ...flight,
                           tripId: searchParams.get('tripId'),
                        })
                     )
                  }

                  return (
                     <Link
                        key={flight.id}
                        href={`/flight/${flight.id}?tripId=${searchParams.get('tripId')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                     >
                        <Card className="mx-auto max-w-[400px] overflow-hidden transition-shadow hover:shadow-md md:max-w-[10000px]">
                           <div className="flex flex-col items-center justify-center gap-4 py-4 md:flex-row md:items-center md:justify-evenly">
                              <div className="flex w-full items-center justify-center gap-1 md:gap-3">
                                 <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 md:h-12 md:w-12">
                                    <Plane className="h-6 w-6 text-primary" />
                                 </div>
                                 <div>
                                    <p className="text-base text-black md:text-sm md:text-muted-foreground">
                                       {flight.itineraries[0].segments.length >
                                       1 ? (
                                          <span className="text-yellow-600 dark:text-yellow-500">
                                             {flight.itineraries[0].segments
                                                .length - 1}{' '}
                                             stop
                                          </span>
                                       ) : (
                                          'Direct'
                                       )}
                                    </p>
                                 </div>
                              </div>

                              <div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
                                 {/* Outbound */}
                                 <div className="flex items-center gap-2">
                                    <div className="text-right">
                                       <p className="font-medium">
                                          {format(
                                             parseISO(
                                                flight.itineraries[0]
                                                   .segments[0].departure.at
                                             ),
                                             'HH:mm'
                                          )}
                                       </p>
                                       <p className="text-xs text-muted-foreground">
                                          {
                                             flight.itineraries[0].segments[0]
                                                .departure.iataCode
                                          }
                                       </p>
                                    </div>
                                    <div className="mx-2 flex flex-col items-center">
                                       <div className="text-xs text-muted-foreground">
                                          {formatDuration(
                                             flight.itineraries[0].duration
                                          )}
                                       </div>
                                       <div className="my-1 h-px w-16 bg-muted-foreground/30"></div>
                                       <div className="text-xs text-muted-foreground">
                                          {flight.itineraries[0].segments
                                             .length > 1
                                             ? `via ${flight.itineraries[0].segments[0].arrival.iataCode}`
                                             : 'Direct'}
                                       </div>
                                    </div>
                                    <div>
                                       <p className="font-medium">
                                          {format(
                                             parseISO(
                                                flight.itineraries[0].segments[
                                                   flight.itineraries[0]
                                                      .segments.length - 1
                                                ].arrival.at
                                             ),
                                             'HH:mm'
                                          )}
                                       </p>
                                       <p className="text-xs text-muted-foreground">
                                          {
                                             flight.itineraries[0].segments[
                                                flight.itineraries[0].segments
                                                   .length - 1
                                             ].arrival.iataCode
                                          }
                                       </p>
                                    </div>
                                 </div>

                                 {/* Return */}
                                 <div className="flex items-center gap-2">
                                    <div className="text-right">
                                       <p className="font-medium">
                                          {format(
                                             parseISO(
                                                flight.itineraries[1]
                                                   .segments[0].departure.at
                                             ),
                                             'HH:mm'
                                          )}
                                       </p>
                                       <p className="text-xs text-muted-foreground">
                                          {
                                             flight.itineraries[1].segments[0]
                                                .departure.iataCode
                                          }
                                       </p>
                                    </div>
                                    <div className="mx-2 flex flex-col items-center">
                                       <div className="text-xs text-muted-foreground">
                                          {formatDuration(
                                             flight.itineraries[1].duration
                                          )}
                                       </div>
                                       <div className="my-1 h-px w-16 bg-muted-foreground/30"></div>
                                       <div className="text-xs text-muted-foreground">
                                          {flight.itineraries[1].segments
                                             .length > 1
                                             ? `via ${flight.itineraries[1].segments[0].arrival.iataCode}`
                                             : 'Direct'}
                                       </div>
                                    </div>
                                    <div>
                                       <p className="font-medium">
                                          {format(
                                             parseISO(
                                                flight.itineraries[1].segments[
                                                   flight.itineraries[1]
                                                      .segments.length - 1
                                                ].arrival.at
                                             ),
                                             'HH:mm'
                                          )}
                                       </p>
                                       <p className="text-xs text-muted-foreground">
                                          {
                                             flight.itineraries[1].segments[
                                                flight.itineraries[1].segments
                                                   .length - 1
                                             ].arrival.iataCode
                                          }
                                       </p>
                                    </div>
                                 </div>
                              </div>

                              <div className="flex w-full flex-row items-center justify-center gap-y-2 space-x-6 border-l-2 border-gray-300 md:flex-col md:items-center md:space-x-0">
                                 <div className="text-center">
                                    <p className="text-lg font-semibold md:text-xl md:font-bold">
                                       {flight.price.currency}{' '}
                                       {flight.price.total}
                                    </p>
                                    {flight.numberOfBookableSeats < 5 && (
                                       <p className="text-sm font-semibold text-muted-foreground text-red-500">
                                          {flight.numberOfBookableSeats} seats
                                          left
                                       </p>
                                    )}
                                 </div>
                                 <div>
                                    <Button
                                       className="bg-green-500 hover:bg-green-300"
                                       size="sm"
                                    >
                                       Book
                                    </Button>
                                 </div>
                              </div>
                           </div>
                        </Card>
                     </Link>
                  )
               })
            ) : (
               <div className="text-white">Loading flights...</div>
            )}
         </div>

         {/* API Response Log */}
         {/* <h2 className="mb-2 mt-4 text-xl font-semibold text-white">
            Flight Offers
         </h2>
         <pre className="overflow-auto whitespace-pre-wrap rounded-lg bg-gray-800 p-4 text-white">
            {JSON.stringify(flightOffers, null, 2)}
         </pre> */}
      </main>
   )
}
