'use client';

import { useSearchParams } from 'next/navigation';
import { JsonValue } from 'type-fest';
import { useEffect, useState } from 'react';
import { getItineraryById } from '../trips/action';

// Define the ItineraryStatus type
type ItineraryStatus = 'UNBOOKED' | 'BOOKED';

// Define the API response type
interface ItineraryResponse {
  id: number;
  generatedItinerary: JsonValue;
  userId: number;
  status: ItineraryStatus;
  createdAt: Date;
  preferenceId: number | null;
  preference?: {
    answers: Record<string, {
      questionType: string;
      options?: string[];
      date?: string;
      value?: string;
    }>;
  };
}

// Define the internal component types
interface Itinerary {
  id: number;
  preference: {
    answers: Record<string, any>;
  };
}

interface FlightOffer {
  id: string;
  price: { total: string };
  itineraries: {
    segments: {
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
    }[];
  }[];
}

// Transform function to convert API response to component type
function transformItineraryResponse(response: ItineraryResponse | null): Itinerary | null {
  if (!response) return null;
  
  return {
    id: response.id,
    preference: {
      answers: response.preference?.answers || {}
    }
  };
}

export default function FlightBooking() {
  const searchParams = useSearchParams();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [flightOffers, setFlightOffers] = useState<FlightOffer[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItineraryAndFlights() {
      try {
        const tripId = searchParams.get('tripId');
        if (!tripId) return;

        const response = await getItineraryById(Number(tripId));
        const transformedItinerary = transformItineraryResponse(response);
        setItinerary(transformedItinerary);

        if (transformedItinerary?.preference?.answers) {
          const preferences = transformedItinerary.preference.answers;

          let origin, destination, departureDate;
          for (const key in preferences) {
            const pref = preferences[key];
            if (pref.questionType === 'AIRPORT') {
              if (pref.options?.includes('London')) origin = 'LON';
              else if (pref.options?.includes('Birmingham')) origin = 'BHX';
              else if (pref.options?.includes('Manchester')) origin = 'MAN';
            }
            if (pref.questionType === 'START_DATE') departureDate = pref.date;
            if (pref.questionType === 'DESTINATION') destination = pref.value;
          }

          if (origin && destination && departureDate) {
            const res = await fetch(
              `/api/flights?origin=${origin}&destination=${destination}&departureDate=${departureDate}`
            );
            const data = await res.json();
            setFlightOffers(data.data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching itinerary or flights:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchItineraryAndFlights();
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

      <h2 className="text-xl font-semibold mb-2 text-white">Itinerary Details</h2>
      <pre className="bg-gray-800 p-4 rounded-lg text-white overflow-auto">
        {JSON.stringify(itinerary, null, 2)}
      </pre>

      <h2 className="text-xl font-semibold mb-2 text-white mt-6">Available Flights</h2>
      {flightOffers ? (
        flightOffers.length > 0 ? (
          <div className="space-y-4">
            {flightOffers.map((flight) => (
              <div key={flight.id} className="bg-gray-900 p-4 rounded-lg text-white">
                <p><strong>Price:</strong> £{flight.price.total}</p>
                {flight.itineraries[0]?.segments.map((segment, index) => (
                  <div key={index} className="mt-2">
                    <p><strong>Departure:</strong> {segment.departure.iataCode} at {segment.departure.at}</p>
                    <p><strong>Arrival:</strong> {segment.arrival.iataCode} at {segment.arrival.at}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white">No available flights.</p>
        )
      ) : (
        <p className="text-white">Fetching flights...</p>
      )}
    </div>
  );
}

