import { Button } from '@/components/ui/button'
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { MapPin, Plane } from 'lucide-react'
import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
} from '@/components/ui/accordion'
import { BackgroundGradient } from '@/components/ui/background-gradient'
import { getItinerary } from './action'

interface Itinerary {
   id: number;
   generatedItinerary: any;
   userId: number;
   createdAt: Date;
}

const generatedItinerary: Itinerary[] = await getItinerary()

export default function AIGeneratedItinerary() {
   const displayItinerary = generatedItinerary?.[0]?.generatedItinerary?.itinerary;

   return (
      <main className="container mx-auto min-h-full max-w-3xl flex-col">
         {/* Display Raw JSON (Debugging/Visualization) */}
         {/* <div className="mb-4 rounded-lg border p-4 text-white bg-gray-800">
            <h2 className="text-lg font-semibold">Raw Itinerary Data:</h2>
            <pre className="whitespace-pre-wrap text-sm">
               {JSON.stringify(generatedItinerary, null, 2)}
            </pre>
         </div> */}

         
         <BackgroundGradient className="p-2">
            <Card className="w-full max-w-4xl">
               <CardHeader>
                  <CardTitle>Your Personalized Travel Itinerary</CardTitle>
                  <CardDescription>
                     Based on your preferences, here&#39;s your custom trip.
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <ScrollArea className="h-[60vh] pr-4">
                     {displayItinerary.map((day:any, dayIndex:any) => (
                        <div key={dayIndex} className="mb-6">
                           <h3 className="mb-2 text-lg font-semibold">
                              Day {day.day}
                           </h3>
                           {day?.activities?.map((activity:any, actIndex:any) => (
                              <Accordion
                                 type="single"
                                 collapsible
                                 key={actIndex}
                                 defaultValue={`activity-${actIndex}`}
                                 className="mx-auto w-full max-w-4xl"
                              >
                                 <AccordionItem value={`activity-${actIndex}`}>
                                    <AccordionTrigger className="font-medium text-gray-800">
                                       {activity.time} - {activity.description}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                       <p>{activity.details}</p>
                                    </AccordionContent>
                                 </AccordionItem>
                              </Accordion>
                           ))}
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