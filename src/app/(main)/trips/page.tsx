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
import {
   Plane,
   Hotel,
   MapPin,
   Coffee,
   Utensils,
   Camera,
   Sunrise,
   Moon,
} from 'lucide-react'
import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
} from '@/components/ui/accordion'

// Mock data for the itinerary
const itinerary = [
   {
      day: 1,
      activities: [
         {
            time: '09:00',
            description: 'Arrival and hotel check-in',
            details:
               'Settle into your accommodation and prepare for the day ahead.',
            icon: <Hotel className="h-4 w-4" />,
         },
         {
            time: '11:00',
            description: 'City orientation walk',
            details:
               'Explore the Gothic Quarter, including historic sites like Plaça Reial and medieval buildings.',
            icon: <MapPin className="h-4 w-4" />,
         },
         {
            time: '13:00',
            description: 'Lunch at Rasoterra',
            details:
               'Enjoy vegan Catalonian tapas and dishes at this popular local restaurant.',
            icon: <Utensils className="h-4 w-4" />,
         },
         {
            time: '15:00',
            description: 'Visit La Sagrada Familia',
            details:
               'Marvel at Antoni Gaudís iconic basilica. Entry fee ~£26, pre-booking recommended.',
            icon: <Camera className="h-4 w-4" />,
         },
         {
            time: '19:00',
            description: 'Dinner at Teresa Carles and evening stroll',
            details:
               'Savor vegan Catalonian cuisine and relax along Las Ramblas.',
            icon: <Moon className="h-4 w-4" />,
         },
      ],
   },
   {
      day: 2,
      activities: [
         {
            time: '08:00',
            description: 'Breakfast at hotel',
            details: 'Fuel up for the day with a hearty vegan breakfast.',
            icon: <Coffee className="h-4 w-4" />,
         },
         {
            time: '10:00',
            description: 'Guided tour of old town',
            details:
               'Visit Casa Batlló and Casa Milà, two of Gaudís masterpieces on Passeig de Gràcia.',
            icon: <MapPin className="h-4 w-4" />,
         },
         {
            time: '13:00',
            description: 'Picnic in central park',
            details:
               'Enjoy a vegan lunch at Parc de la Ciutadella, surrounded by sculptures and fountains.',
            icon: <Utensils className="h-4 w-4" />,
         },
         {
            time: '15:00',
            description: 'Visit the Picasso Museum',
            details:
               'View an extensive collection of Pablo Picassos early works in the El Born neighborhood. Entry fee ~£12.',
            icon: <Camera className="h-4 w-4" />,
         },
         {
            time: '19:00',
            description: 'Traditional dance show',
            details:
               'Experience Catalonian culture with a local dance performance.',
            icon: <Moon className="h-4 w-4" />,
         },
      ],
   },
   {
      day: 3,
      activities: [
         {
            time: '07:00',
            description: 'Sunrise hike to Bunkers del Carmel',
            details:
               'Enjoy panoramic views of the city from this scenic viewpoint.',
            icon: <Sunrise className="h-4 w-4" />,
         },
         {
            time: '10:00',
            description: 'Local market visit',
            details:
               'Wander through La Boqueria Market, famous for fresh produce and vegan-friendly snacks.',
            icon: <MapPin className="h-4 w-4" />,
         },
         {
            time: '13:00',
            description: 'Cooking class',
            details:
               'Learn to prepare vegan Catalonian dishes at a local culinary school.',
            icon: <Utensils className="h-4 w-4" />,
         },
         {
            time: '16:00',
            description: 'Beach relaxation at Barceloneta',
            details:
               'Relax and take in the ocean views from Barcelonas popular beach.',
            icon: <Camera className="h-4 w-4" />,
         },
         {
            time: '20:00',
            description: 'Farewell dinner at Bohl',
            details:
               'Enjoy a selection of vegan tapas and local cuisine to wrap up your trip.',
            icon: <Moon className="h-4 w-4" />,
         },
      ],
   },
]

export default function AIGeneratedItinerary() {
   return (
      <main className="container mx-auto min-h-full max-w-3xl flex-col">
         <Card className="w-full max-w-4xl">
            <CardHeader>
               <CardTitle>Your Personalized Travel Itinerary</CardTitle>
               <CardDescription>
                  Based on your preferences, we&#39;ve created the perfect 3-day
                  trip for you.
               </CardDescription>
            </CardHeader>
            <CardContent>
               <ScrollArea className="h-[60vh] pr-4">
                  {itinerary.map((day, dayIndex) => (
                     <div key={day.day} className="mb-6">
                        <h3 className="mb-2 text-lg font-semibold">
                           Day {day.day}
                        </h3>
                        <Card>
                           <CardContent className="p-4">
                              {day?.activities?.map((activity, actIndex) => (
                                 <Accordion
                                    type="single"
                                    collapsible
                                    className="mx-auto w-full max-w-4xl"
                                    defaultValue={`day${dayIndex}-activity${actIndex}`}
                                 >
                                    <AccordionItem
                                       value={`day${dayIndex}-activity${actIndex}`}
                                       key={`day${dayIndex}-activity${actIndex}`}
                                       className="mb-4 rounded-b-sm"
                                    >
                                       <AccordionTrigger className="flex h-[40px] items-center justify-start rounded-t-sm bg-gray-100 px-5 text-lg font-semibold text-gray-900">
                                          <div className="w-16  text-base">
                                             {activity.time}
                                          </div>
                                          <div className="mr-3 flex-shrink-0">
                                             {activity.icon}
                                          </div>
                                          <p className="text-base">
                                             {activity.description}
                                          </p>
                                       </AccordionTrigger>
                                       <AccordionContent>
                                          <p className="py-4 px-8 text-sm font-medium">
                                             {activity.details}
                                          </p>
                                       </AccordionContent>
                                    </AccordionItem>
                                 </Accordion>
                              ))}
                           </CardContent>
                        </Card>
                        {dayIndex < itinerary.length - 1 && (
                           <Separator className="my-6" />
                        )}
                     </div>
                  ))}
               </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between">
               <Button variant="outline">Modify Preferences</Button>
               <Button>
                  <Plane className="mr-2 h-4 w-4" /> Book Flights & Hotels
               </Button>
            </CardFooter>
         </Card>
      </main>
   )
}
