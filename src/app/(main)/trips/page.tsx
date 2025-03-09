'use client'

import { Button } from '@/components/ui/button'
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { BackgroundGradient } from '@/components/ui/background-gradient'
import { getItinerary, deleteItineraryById } from './action'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
// import { bookTrip } from './action'

interface Itinerary {
   id: number
   generatedItinerary: any
   userId: number
   status: 'UNBOOKED' | 'BOOKED' | 'NO_FLIGHTS'
   createdAt: Date
}

export default function AIGeneratedItinerary() {
   const [allItinerary, setAllItinerary] = useState<Itinerary[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      async function fetchItinerary() {
         try {
            const data = await getItinerary()
            setAllItinerary(data)
         } catch (error) {
            console.error('Error fetching itinerary:', error)
         } finally {
            setLoading(false)
         }
      }
      fetchItinerary()
   }, [])

   if (loading) {
      return <div className="text-white text-center">Loading...</div>
   }

   const handleDelete = async (id: number) => {
      try {
         await deleteItineraryById(id)
         setAllItinerary((prev) =>
            prev.filter((itinerary) => itinerary.id !== id)
         )
      } catch (error) {
         console.error('Error deleting itinerary:', error)
         alert('Failed to delete itinerary. Please try again.')
      }
   }

   return (
      <main className="container mx-auto min-h-full max-w-3xl flex-col">
         <BackgroundGradient className="p-3">
            <Card className="w-full max-w-4xl rounded-2xl pb-6">
               <CardHeader>
                  <CardTitle>Your Trips</CardTitle>
               </CardHeader>
               <ScrollArea className="mr-4 h-[60vh]">
                  <CardContent>
                     {allItinerary.length > 0 ? (
                        <div className="space-y-2">
                           {allItinerary.map((itinerary) => (
                              <div
                                 key={itinerary.id}
                                 className="flex flex-row justify-between gap-4 border-b pb-2 transition-all duration-300 hover:border-b-black hover:text-lg"
                              >
                                 <Link
                                    className="w-full"
                                    href={`/trips/${itinerary.id}`}
                                    passHref
                                 >
                                    <div className="flex items-center gap-2">
                                       <p className="text-lg font-semibold">
                                          {
                                             itinerary.generatedItinerary
                                                .destination_country
                                          }
                                       </p>
                                       {itinerary.status === 'NO_FLIGHTS' && (
                                          <Badge variant="destructive" className="text-xs">
                                             No Flights Available
                                          </Badge>
                                       )}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                       Date Created:{' '}
                                       {new Date(
                                          itinerary.createdAt
                                       ).toLocaleDateString('en-GB')}
                                    </p>
                                 </Link>
                                 <div className="flex flex-row gap-x-2 pr-4 pt-2">
                                    {itinerary.status !== 'NO_FLIGHTS' && (
                                       <Link
                                          className="w-full"
                                          href={`/flight?tripId=${itinerary.id}`}
                                          passHref
                                       >
                                          <Button className="h-[30px] w-[100px] bg-green-500 hover:bg-green-400 hover:text-black">
                                             Book Flights
                                          </Button>
                                       </Link>
                                    )}

                                    <Button
                                       variant="destructive"
                                       className="h-[30px] w-[60px] hover:bg-red-400 hover:text-black"
                                       onClick={() =>
                                          handleDelete(itinerary.id)
                                       }
                                    >
                                       Delete
                                    </Button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <p className="text-gray-600 text-center mt-4">
                           You have not generated any trips yet
                        </p>
                     )}
                  </CardContent>
               </ScrollArea>
            </Card>
         </BackgroundGradient>
      </main>
   )
}
