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
import { getItineraryById } from '../action' // Update to fetch by ID

interface Itinerary {
   id: number
   generatedItinerary: any
   userId: number
   createdAt: Date
}

export default async function TripByIdPage({
   params: asyncParams,
}: {
   params: Promise<{ tripId: string }>
}) {
   const { tripId: tripIdString } = await asyncParams; // Await `params`
   const tripId = Number(tripIdString); // Convert string to number

   if (isNaN(tripId)) {
      return (
         <main className="container mx-auto min-h-full max-w-3xl flex-col">
            <p className="text-gray-600">Invalid trip ID.</p>
         </main>
      );
   }

   const itinerary: Itinerary | null = await getItineraryById(tripId);

   if (!itinerary) {
      return (
         <main className="container mx-auto min-h-full max-w-3xl flex-col">
            <p className="text-gray-600">No itinerary found for this trip.</p>
         </main>
      );
   }

   const displayItinerary = itinerary?.generatedItinerary?.itinerary;

   return (
      <main className="container mx-auto min-h-full max-w-3xl flex-col">
         <BackgroundGradient className="p-2">
            <Card className="w-full max-w-4xl">
               <CardHeader>
                  <CardTitle>Your Personalized Travel Itinerary</CardTitle>
                  <p className="text-sm text-gray-600">
                     Created on:{' '}
                     {new Date(itinerary.createdAt).toLocaleDateString()}
                  </p>
               </CardHeader>
               <CardContent>
                  <ScrollArea className="h-[60vh] pr-4">
                     {displayItinerary.map((day: any, dayIndex: number) => (
                        <div key={dayIndex} className="mb-6">
                           <h3 className="mb-2 text-lg font-semibold">
                              Day {day.day}
                           </h3>
                           {day.activities.map(
                              (activity: any, actIndex: number) => (
                                 <Accordion
                                    key={actIndex}
                                    type="single"
                                    collapsible
                                    defaultValue={`activity-${actIndex}`}
                                    className="mx-auto w-full max-w-4xl"
                                 >
                                    <AccordionItem
                                       value={`activity-${actIndex}`}
                                    >
                                       <AccordionTrigger className="font-medium text-gray-800">
                                          {activity.time} -{' '}
                                          {activity.description}
                                       </AccordionTrigger>
                                       <AccordionContent>
                                          <p>{activity.details}</p>
                                       </AccordionContent>
                                    </AccordionItem>
                                 </Accordion>
                              )
                           )}
                        </div>
                     ))}
                  </ScrollArea>
               </CardContent>
               <CardFooter>
                  <p className="text-sm text-gray-600">
                     We hope you enjoy your journey!
                  </p>
               </CardFooter>
            </Card>
         </BackgroundGradient>
      </main>
   );
}
