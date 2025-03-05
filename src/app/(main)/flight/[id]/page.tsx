'use client'

import { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Clock, Luggage, MapPin, Plane } from "lucide-react"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { purchaseFlight } from '../action'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function FlightDetails({ params }: PageProps) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const tripId = searchParams.get('tripId')
  const [flightData, setFlightData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const storedFlight = localStorage.getItem(`flight-${id}`)
    
    if (!storedFlight) {
      // Redirect to search page if no flight data is found
      router.push(`/flight?tripId=${tripId}`)
      return
    }

    setFlightData(JSON.parse(storedFlight))
  }, [id, router, tripId])

  const handlePurchase = async () => {
    try {
      const result = await purchaseFlight(
        flightData, 
        parseInt(tripId as string)
      )

      if (!result.success) {
        throw new Error(result.error)
      }

      // Show success message
      alert('Flight purchased successfully!')
      // Optionally close the window since it's in a new tab
      window.close()
    } catch (error) {
      console.error('Error purchasing flight:', error)
      alert('Failed to purchase flight. Please try again.')
    }
  }

  if (!flightData) {
    return <div>Loading...</div>
  }

  // Helper function to format duration from ISO format
  const formatDuration = (isoDuration: string) => {
    const hourMatch = isoDuration.match(/PT(\d+)H/)
    const minuteMatch = isoDuration.match(/(\d+)M/)

    const hours = hourMatch ? Number.parseInt(hourMatch[1]) : 0
    const minutes = minuteMatch ? Number.parseInt(minuteMatch[1]) : 0

    return `${hours}h ${minutes}m`
  }

  // Helper function to get airline name from code
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
              <p className="text-sm text-muted-foreground">{flightData.numberOfBookableSeats} seats available</p>
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

            <div className="space-y-2">
              <p className="font-medium">Included Amenities</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {flightData.travelerPricings[0].fareDetailsBySegment[0].amenities.map((amenity: any, index: any) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className={amenity.isChargeable ? "text-destructive" : "text-primary"}>
                      {amenity.isChargeable ? "✗" : "✓"}
                    </span>
                    <span>{amenity.description}</span>
                    {amenity.isChargeable && <span className="text-xs">(Extra charge)</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add purchase button at the bottom */}
      <div className="mt-6 flex justify-end">
        <Button 
          onClick={handlePurchase}
          className="bg-primary text-white hover:bg-primary/90"
        >
          Purchase Flight
        </Button>
      </div>
    </div>
  )
}

