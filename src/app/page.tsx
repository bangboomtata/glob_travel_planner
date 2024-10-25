import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plane, Hotel, MapPin, Coffee, Utensils, Camera, Sunrise, Moon } from "lucide-react"

// Mock data for the itinerary
const itinerary = [
  {
    day: 1,
    activities: [
      { time: "09:00", description: "Arrival and hotel check-in", icon: <Hotel className="w-4 h-4" /> },
      { time: "11:00", description: "City orientation walk", icon: <MapPin className="w-4 h-4" /> },
      { time: "13:00", description: "Lunch at local restaurant", icon: <Utensils className="w-4 h-4" /> },
      { time: "15:00", description: "Visit main historical site", icon: <Camera className="w-4 h-4" /> },
      { time: "19:00", description: "Dinner and evening stroll", icon: <Moon className="w-4 h-4" /> },
    ],
  },
  {
    day: 2,
    activities: [
      { time: "08:00", description: "Breakfast at hotel", icon: <Coffee className="w-4 h-4" /> },
      { time: "10:00", description: "Guided tour of old town", icon: <MapPin className="w-4 h-4" /> },
      { time: "13:00", description: "Picnic in central park", icon: <Utensils className="w-4 h-4" /> },
      { time: "15:00", description: "Visit art museum", icon: <Camera className="w-4 h-4" /> },
      { time: "19:00", description: "Traditional dance show", icon: <Moon className="w-4 h-4" /> },
    ],
  },
  {
    day: 3,
    activities: [
      { time: "07:00", description: "Sunrise hike", icon: <Sunrise className="w-4 h-4" /> },
      { time: "10:00", description: "Local market visit", icon: <MapPin className="w-4 h-4" /> },
      { time: "13:00", description: "Cooking class", icon: <Utensils className="w-4 h-4" /> },
      { time: "16:00", description: "Beach relaxation", icon: <Camera className="w-4 h-4" /> },
      { time: "20:00", description: "Farewell dinner", icon: <Moon className="w-4 h-4" /> },
    ],
  },
]

export default function AIGeneratedItinerary() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Your Personalized Travel Itinerary</CardTitle>
          <CardDescription>Based on your preferences, we've created the perfect 3-day trip for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] pr-4">
            {itinerary.map((day, index) => (
              <div key={day.day} className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Day {day.day}</h3>
                <Card>
                  <CardContent className="p-4">
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-start mb-4 last:mb-0">
                        <div className="flex-shrink-0 w-16 text-sm text-gray-500">{activity.time}</div>
                        <div className="flex-shrink-0 mr-3">{activity.icon}</div>
                        <div className="flex-grow">{activity.description}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                {index < itinerary.length - 1 && <Separator className="my-6" />}
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
    </div>
  )
}