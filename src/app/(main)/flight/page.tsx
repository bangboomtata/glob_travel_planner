'use client';

import { Suspense } from 'react';
import FlightBooking from './FlightComponent';

export default function FlightBookingPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <FlightBooking />
    </Suspense>
  );
}
