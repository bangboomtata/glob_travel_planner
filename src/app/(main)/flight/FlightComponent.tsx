'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getItineraryById } from '../trips/action';

interface Itinerary {
  id: number;
}

export default function FlightBooking() {
  const searchParams = useSearchParams();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItinerary() {
      try {
        const tripId = searchParams.get('tripId');
        if (tripId) {
          const data = await getItineraryById(Number(tripId));
          setItinerary(data);
        }
      } catch (error) {
        console.error('Error fetching itinerary:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchItinerary();
  }, [searchParams]);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!itinerary) {
    return <div className="text-white">Itinerary not found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Flight Booking</h1>
      <div>
        <h2 className="text-xl font-semibold mb-2 text-white">Itinerary Details</h2>
        <pre className="bg-gray-800 p-4 rounded-lg text-white overflow-auto">
          {JSON.stringify(itinerary, null, 2)}
        </pre>
      </div>
    </div>
  );
}
