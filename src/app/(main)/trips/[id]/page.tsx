// import { Button } from '@/components/ui/button'
// import {
//    Card,
//    CardContent,
//    CardDescription,
//    CardFooter,
//    CardHeader,
//    CardTitle,
// } from '@/components/ui/card'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { Separator } from '@/components/ui/separator'
// import { MapPin, Plane } from 'lucide-react'
// import {
//    Accordion,
//    AccordionContent,
//    AccordionItem,
//    AccordionTrigger,
// } from '@/components/ui/accordion'
// import { BackgroundGradient } from '@/components/ui/background-gradient'
// import { getItinerary } from './action'

// interface Itinerary {
//    id: number;
//    generatedItinerary: any;
//    userId: number;
//    createdAt: Date;
// }

// const generatedItinerary: Itinerary[] = await getItinerary()


// export default function AIGeneratedItinerary() {
//     return (
//        <main className="container mx-auto min-h-full max-w-3xl flex-col">
//           <BackgroundGradient className="p-2">
//              <Card className="w-full max-w-4xl">
//                 <CardHeader>
//                    <CardTitle>Your Trips</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                    {allItinerary.length > 0 ? (
//                       <ul className="space-y-4">
//                          {allItinerary.map((itinerary) => (
//                             <li key={itinerary.id} className="border-b pb-4">
//                                <p className="text-lg font-semibold">
//                                   Destination: {itinerary.generatedItinerary.destination_country}
//                                </p>
//                                <p className="text-sm text-gray-600">
//                                   Date Created: {new Date(itinerary.createdAt).toLocaleDateString()}
//                                </p>
//                             </li>
//                          ))}
//                       </ul>
//                    ) : (
//                       <p className="text-gray-600">No itineraries available.</p>
//                    )}
//                 </CardContent>
//                 <CardFooter>
//                    <p className="text-sm text-gray-600">
//                       We hope you enjoy your journey!
//                    </p>
//                 </CardFooter>
//              </Card>
//           </BackgroundGradient>
//        </main>
//     );
//  }