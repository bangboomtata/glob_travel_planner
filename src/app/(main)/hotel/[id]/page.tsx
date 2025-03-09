'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { purchaseHotel } from '../action'
import { use } from 'react'

export default function HotelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const price = searchParams.get('price')
  const tripId = searchParams.get('tripId')
  const hotelName = searchParams.get('hotelName')
  const distance = searchParams.get('distance')
  const unit = searchParams.get('unit')

  const handlePurchase = async () => {
    if (!tripId || !price) return

    setLoading(true)
    try {
      const hotelDetails = {
        hotelId: resolvedParams.id,
        hotelName: hotelName,
        distance: {
          value: parseFloat(distance || '0'),
          unit: unit
        },
        price: {
          amount: parseFloat(price),
          currency: 'GBP'
        }
      }

      const result = await purchaseHotel(hotelDetails, parseInt(tripId))
      
      // Artificial delay
      await new Promise(resolve => setTimeout(resolve, 3000))

      if (result.success) {
        alert('Hotel booked successfully!')
        router.push('/trips')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error purchasing hotel:', error)
      alert('Failed to book hotel. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Booking Hotel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <Card>
        <CardHeader>
          <CardTitle>Confirm Hotel Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{hotelName}</h3>
              <p className="text-sm text-muted-foreground">
                {distance} {unit} from airport
              </p>
            </div>
            <p className="text-xl font-bold">Price: {parseFloat(price || '0').toFixed(2)} £</p>
            <Button 
              onClick={handlePurchase} 
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400"
            >
              {loading ? 'Processing...' : 'Book Hotel'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
