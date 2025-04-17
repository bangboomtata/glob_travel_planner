import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { BackgroundGradient } from '@/components/ui/background-gradient'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
} from '@/components/ui/accordion'
import { getItineraryById } from '../action' 
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'

interface Itinerary {
   id: number
   generatedItinerary: any
   userId: string
   status: 'UNBOOKED' | 'BOOKED' | 'NO_FLIGHTS'
   createdAt: Date
   flightBooked: boolean
   hotelBooked: boolean
   preference?: {
      id: number
      userId: string
      createdAt: Date
      answers: any
   }
}

export default async function TripByIdPage({
   params: asyncParams,
}: {
   params: Promise<{ tripId: string }>
}) {
   const { tripId: tripIdString } = await asyncParams
   const tripId = Number(tripIdString)

   if (isNaN(tripId)) {
      return (
         <main className="container mx-auto min-h-full max-w-3xl flex-col">
            <p className="text-gray-600">Invalid trip ID.</p>
         </main>
      )
   }

   const itinerary: Itinerary | null = await getItineraryById(tripId)

   if (!itinerary) {
      return (
         <main className="container mx-auto min-h-full max-w-3xl flex-col">
            <p className="text-gray-600">No itinerary found for this trip.</p>
         </main>
      )
   }

   const displayItinerary = itinerary?.generatedItinerary?.itinerary
   const destinationCountry = itinerary?.generatedItinerary?.destination_country

   return (
      <main className="container mx-auto min-h-full max-w-3xl flex-col">
         <BackgroundGradient className="p-3">
            <Card className="w-full max-w-4xl rounded-2xl pb-6">
               <CardHeader>
                  <CardTitle>{`${destinationCountry} Travel Itinerary`}</CardTitle>
                  <p className="text-sm text-gray-600">
                     Created on:{' '}
                     {new Date(itinerary.createdAt).toLocaleDateString()}
                  </p>
               </CardHeader>
               <CardContent className=''>
                  <ScrollArea className="h-full pr-4">
                     <Accordion 
                        type="multiple" 
                        defaultValue={displayItinerary.map((_:any, index:number) => `day-${index}`)}
                        className="mx-auto w-full max-w-4xl"
                     >
                        {displayItinerary.map((day: any, dayIndex: number) => (
                           <AccordionItem key={dayIndex} value={`day-${dayIndex}`}>
                              <AccordionTrigger className="font-medium text-gray-800">
                                 <h3 className="text-lg font-semibold text-left">
                                    Day {day.day}
                                 </h3>
                              </AccordionTrigger>
                              <AccordionContent>
                                 {day.activities.map(
                                    (activity: any, actIndex: number) => (
                                       <Link href={activity.googleMap} target="_blank" key={actIndex}>
                                          <div className="mb-4 border-l-2 border-gray-200 pl-4 relative group hover:bg-gray-50 rounded-r transition-colors duration-200 p-2">
                                             <Badge className="absolute right-2 top-2 hover:bg-gray-600 flex items-center gap-1">
                                                <MapPin size={14} /> Explore
                                             </Badge>
                                             <h4 className="font-medium text-gray-800 pr-20">
                                                {activity.time} - {activity.description}
                                             </h4>
                                             <p className="mt-2 text-gray-600">{activity.details}</p>
                                          </div>
                                       </Link>
                                    )
                                 )}
                              </AccordionContent>
                           </AccordionItem>
                        ))}
                     </Accordion>
                  </ScrollArea>
               </CardContent>
            </Card>
         </BackgroundGradient>
      </main>
   )
}
