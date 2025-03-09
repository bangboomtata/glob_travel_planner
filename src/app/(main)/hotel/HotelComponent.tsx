'use client'

import { useState, useEffect, useRef } from 'react'
import { searchHotels, type HotelOffer } from './action'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams, useRouter } from 'next/navigation'
import { getItineraryPreferenceById } from '../trips/action'
import Link from 'next/link'

interface GeneratedItinerary {
  landingAirport: string
}

function isGeneratedItinerary(value: any): value is GeneratedItinerary {
  return typeof value === 'object' && 
         value !== null && 
         typeof value.landingAirport === 'string'
}

interface Itinerary {
  id: number
  generatedItinerary: GeneratedItinerary
}

export default function HotelBooking() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [hotels, setHotels] = useState<HotelOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const initialFetchMade = useRef(false)

  useEffect(() => {
    if (initialFetchMade.current) return

    async function fetchItineraryAndHotels() {
      try {
        const tripId = searchParams.get('tripId')
        console.log('TripId:', tripId)

        // Get itinerary data
        const itineraryData = await getItineraryPreferenceById(Number(tripId))
        console.log('Itinerary Data:', itineraryData)

        if (!itineraryData || !isGeneratedItinerary(itineraryData.generatedItinerary)) {
          throw new Error('Invalid itinerary data')
        }

        // Use landingAirport directly
        const cityCode = itineraryData.generatedItinerary.landingAirport
        console.log('Airport Code:', cityCode)

        // Search for hotels
        console.log('Making API request for city:', cityCode)
        const result = await searchHotels(cityCode)
        console.log('API Response:', result)

        if (result.success) {
          setHotels(result.data)
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        console.error('Error fetching hotels:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch hotels'
        setError(errorMessage)

        // Show error message and redirect
        const errorDiv = document.createElement('div')
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg'
        errorDiv.textContent = errorMessage
        document.body.appendChild(errorDiv)

        setTimeout(() => {
          document.body.removeChild(errorDiv)
          router.push('/trips')
        }, 5000)
      } finally {
        setLoading(false)
        initialFetchMade.current = true
      }
    }

    fetchItineraryAndHotels()
  }, [searchParams, router])

  if (loading) {
    return <div className="text-center text-white">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Available Hotels</h1>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <Link
              key={hotel.hotelId}
              href={`/hotel/${hotel.hotelId}?price=${hotel.price.amount}&tripId=${searchParams.get('tripId')}&hotelName=${encodeURIComponent(hotel.name)}&distance=${hotel.distance.value}&unit=${hotel.distance.unit}`}
            >
              <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle>{hotel.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Hotel Chain: {hotel.chainCode}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-2">
                    <p>Location: {hotel.geoCode.latitude}, {hotel.geoCode.longitude}</p>
                    <p>Distance from airport: {hotel.distance.value} {hotel.distance.unit}</p>
                    <p className="mt-2 text-lg font-semibold">
                      Price: {hotel.price.amount.toFixed(2)} £
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 