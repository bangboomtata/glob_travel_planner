'use server'

import { getAmadeusToken } from '@/lib/utils'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export type HotelOffer = {
  hotelId: string
  name: string
  chainCode: string
  geoCode: {
    latitude: number
    longitude: number
  }
  address: {
    countryCode: string
  }
  distance: {
    value: number
    unit: string
  }
  price: {
    amount: number
    currency: string
  }
}

export async function searchHotels(
  cityCode: string,
  radius: number = 10
) {
  try {
    const token = await getAmadeusToken()
    const endpoint = 'https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city'
    
    const params = new URLSearchParams({
      cityCode: cityCode,
      radius: radius.toString(),
      radiusUnit: 'KM',
      hotelSource: 'ALL'
    })

    const url = `${endpoint}?${params.toString()}`
    console.log('Request URL:', url)
    console.log('Request Headers:', {
      Authorization: `Bearer ${token.substring(0, 10)}...`,
      'Content-Type': 'application/json'
    })

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Response Status:', response.status)
    const data = await response.json()
    console.log('Response Data:', data)

    if (!response.ok) {
      console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      })
      throw new Error(JSON.stringify(data.errors))
    }

    const hotels = data.data.map((hotel: any) => ({
      hotelId: hotel.hotelId,
      name: hotel.name,
      chainCode: hotel.chainCode,
      geoCode: hotel.geoCode,
      address: {
        countryCode: hotel.address.countryCode
      },
      distance: hotel.distance,
      price: {
        amount: Math.floor(Math.random() * (300 - 100 + 1)) + 100,
        currency: 'GBP'
      }
    }))

    return { success: true, data: hotels }
  } catch (error: any) {
    console.error('Error in searchHotels:', error)
    return {
      success: false,
      error: error.message || 'Failed to search hotels'
    }
  }
}

export async function purchaseHotel(hotelDetails: any, tripId: number) {
  try {
    // First, check if flight is booked
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: tripId },
      select: {
        flightBooked: true
      }
    })

    if (!itinerary) {
      throw new Error('Itinerary not found')
    }

    // Create hotel record
    await prisma.hotel.create({
      data: {
        hotelDetails: hotelDetails,
        itineraryId: tripId,
      },
    })

    // Update itinerary with hotelBooked and status
    await prisma.itinerary.update({
      where: { id: tripId },
      data: {
        hotelBooked: true,
        // Set status to BOOKED if flight was already booked
        status: itinerary.flightBooked ? 'BOOKED' : 'UNBOOKED'
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error purchasing hotel:', error)
    return { success: false, error: 'Failed to purchase hotel' }
  }
}

// Helper function to check both bookings and return appropriate status
async function checkAndUpdateBookingStatus(tripId: number) {
  const itinerary = await prisma.itinerary.findUnique({
    where: { id: tripId },
    select: {
      flightBooked: true,
      hotelBooked: true
    }
  })

  if (!itinerary) throw new Error('Itinerary not found')
  return (itinerary.flightBooked && itinerary.hotelBooked) ? 'BOOKED' as const : 'UNBOOKED' as const
}
