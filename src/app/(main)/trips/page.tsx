import { Button } from '@/components/ui/button'
import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { BackgroundGradient } from '@/components/ui/background-gradient'
import { getItinerary } from './action'
import Link from 'next/link'

interface Itinerary {
   id: number
   generatedItinerary: any
   userId: number
   createdAt: Date
}
import { ScrollArea } from '@/components/ui/scroll-area'

const allItinerary: Itinerary[] = await getItinerary()

export default function AIGeneratedItinerary() {
   return (
      <main className="container mx-auto min-h-full max-w-3xl flex-col">
         <BackgroundGradient className="p-3">
            <Card className="w-full rounded-2xl max-w-4xl pb-6">
               <CardHeader>
                  <CardTitle>Your Trips</CardTitle>
               </CardHeader>
               <ScrollArea className="h-[60vh] mr-4">
                  <CardContent>
                     {allItinerary.length > 0 ? (
                        <div className="space-y-2">
                           {allItinerary.map((itinerary) => (
                              <div key={itinerary.id} className='flex flex-row pb-2 border-b justify-between gap-4'>
                                 <div>
                                    <p className="text-lg font-semibold">
                                       Destination:{' '}{itinerary.generatedItinerary.destination_country}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                       Date Created:{new Date(itinerary.createdAt).toLocaleDateString()}
                                    </p>
                                 </div>
                                 <div className="flex flex-row gap-x-2 pt-4 pr-4">
                                    <Link href={`/trips/${itinerary.id}`} passHref>
                                       <Button className="w-[60px] h-[30px]">View</Button>
                                    </Link>
                                    <Button variant="destructive" className="w-[60px] h-[30px]">Delete</Button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <p className="text-gray-600">No itineraries available.</p>
                     )}
                  </CardContent>
               </ScrollArea>
            </Card>
         </BackgroundGradient>
      </main>
   )
}
