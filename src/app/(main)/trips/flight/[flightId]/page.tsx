import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BackgroundGradient } from '@/components/ui/background-gradient'
import { viewTripFlight } from '../../action'
import { Calendar, Clock, Luggage, MapPin, Plane } from "lucide-react"
import { format, parseISO } from "date-fns"
import { Separator } from "@/components/ui/separator"

const formatDuration = (isoDuration: string) => {
  const hourMatch = isoDuration.match(/PT(\d+)H/)
  const minuteMatch = isoDuration.match(/(\d+)M/)
  const hours = hourMatch ? Number.parseInt(hourMatch[1]) : 0
  const minutes = minuteMatch ? Number.parseInt(minuteMatch[1]) : 0
  return `${hours}h ${minutes}m`
}

const getAirlineName = (code: string) => {
  const airlines: Record<string, string> = {
    AZ: "Alitalia",
  }
  return airlines[code] || code
}

const calculateLayover = (previousArrival: string, nextDeparture: string) => {
  const arrivalTime = new Date(previousArrival);
  const departureTime = new Date(nextDeparture);
  const diffInMinutes = Math.floor((departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60));
  return `PT${Math.floor(diffInMinutes / 60)}H${diffInMinutes % 60}M`;
};

async function FlightDetails({ flightId }: { flightId: string }) {
   const flightData = await viewTripFlight(parseInt(flightId))

   return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="bg-primary/5">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">
                {getAirlineName(flightData.itineraries[0].segments[0].carrierCode)}
              </h3>
              <p className="text-muted-foreground text-sm">
                {flightData.itineraries[0].segments[0].carrierCode}
                {flightData.itineraries[0].segments[0].number} /{flightData.itineraries[1].segments[0].carrierCode}
                {flightData.itineraries[1].segments[0].number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {flightData.price.currency} {flightData.price.total}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Outbound Flight */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Outbound Flight</h3>
              <span className="text-sm text-muted-foreground">
                {format(parseISO(flightData.itineraries[0].segments[0].departure.at), "EEE, MMM d, yyyy")}
              </span>
            </div>

            {flightData.itineraries[0].segments.map((segment: any, index: number) => (
              <div key={index} className="mb-4">
                {index > 0 && (
                  <div className="my-4 pl-12">
                    <div className="text-sm text-muted-foreground">
                      Layover: {formatDuration(calculateLayover(
                        flightData.itineraries[0].segments[index - 1].arrival.at,
                        segment.departure.at
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plane className="h-4 w-4 text-primary" />
                    </div>
                    <div className="h-full border-l border-dashed border-muted-foreground/30 mx-auto my-1" />
                    <div className="w-8 h-8 rounded-full mt-8 bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="mb-6">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-bold text-lg">
                            {format(parseISO(segment.departure.at), "HH:mm")}
                          </p>
                          <p className="text-sm font-medium">
                            {segment.departure.iataCode}
                            {"terminal" in segment.departure ? 
                              ` (Terminal ${segment.departure.terminal})` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(segment.duration)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <div>
                          <p className="font-bold text-lg">
                            {format(parseISO(segment.arrival.at), "HH:mm")}
                          </p>
                          <p className="text-sm font-medium">
                            {segment.arrival.iataCode}
                            {"terminal" in segment.arrival ? 
                              ` (Terminal ${segment.arrival.terminal})` : ""}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getAirlineName(segment.carrierCode)} {segment.number}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Return Flight */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Return Flight</h3>
              <span className="text-sm text-muted-foreground">
                {format(parseISO(flightData.itineraries[1].segments[0].departure.at), "EEE, MMM d, yyyy")}
              </span>
            </div>

            {flightData.itineraries[1].segments.map((segment: any, index: number) => (
              <div key={index} className="mb-4">
                {index > 0 && (
                  <div className="my-4 pl-12">
                    <div className="text-sm text-muted-foreground">
                      Layover: {formatDuration(calculateLayover(
                        flightData.itineraries[1].segments[index - 1].arrival.at,
                        segment.departure.at
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plane className="h-4 w-4 text-primary" />
                    </div>
                    <div className="h-full border-l border-dashed border-muted-foreground/30 mx-auto my-1" />
                    <div className="w-8 h-8 rounded-full mt-8 bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="mb-6">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-bold text-lg">
                            {format(parseISO(segment.departure.at), "HH:mm")}
                          </p>
                          <p className="text-sm font-medium">
                            {segment.departure.iataCode}
                            {"terminal" in segment.departure ? 
                              ` (Terminal ${segment.departure.terminal})` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(segment.duration)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <div>
                          <p className="font-bold text-lg">
                            {format(parseISO(segment.arrival.at), "HH:mm")}
                          </p>
                          <p className="text-sm font-medium">
                            {segment.arrival.iataCode}
                            {"terminal" in segment.arrival ? 
                              ` (Terminal ${segment.arrival.terminal})` : ""}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getAirlineName(segment.carrierCode)} {segment.number}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fare Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fare Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Luggage className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Baggage Allowance</p>
                <p className="text-sm text-muted-foreground">
                  Checked bags: {flightData.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.quantity}
                  (Additional bags are chargeable)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
   )
}

export default async function FlightDetailsPage({
   params,
}: {
   params: { flightId: string }
}) {
   const { flightId } = await params

   return (
      <main className="container mx-auto min-h-full max-w-3xl flex-col">
         <BackgroundGradient className="p-3">
            <Suspense fallback={<div className="text-center">Loading flight details...</div>}>
               <FlightDetails flightId={flightId} />
            </Suspense>
         </BackgroundGradient>
      </main>
   )
} 