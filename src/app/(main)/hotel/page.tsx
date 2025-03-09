'use client'

import HotelBooking from './HotelComponent'
import { Suspense } from 'react'

export default function HotelPage() {
  return (
    <Suspense fallback={<div className="text-center text-white">Loading...</div>}>
      <HotelBooking />
    </Suspense>
  )
}
