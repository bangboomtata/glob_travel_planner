'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getItineraryPreferenceById } from '../trips/action'
import { Prisma } from '@prisma/client'

enum ItineraryStatus {
   UNBOOKED = 'UNBOOKED',
   BOOKED = 'BOOKED',
}

interface Activity {
   time: string;
   details: string;
   description: string;
 }
 
 interface DayItinerary {
   day: number;
   activities: Activity[];
 }
 
 interface GeneratedItinerary {
   itinerary: DayItinerary[];
   returnCity: string;
   landingCity: string;
   returnAirport: string;
   landingAirport: string;
   destination_country: string;
 }
 
 interface Answer {
   options?: string[];
   question: string;
   questionType: string;
   date?: string;
   value?: {
     adults?: number;
     children?: number;
   } | number;
 }
 
 interface Preference {
   id: number;
   userId: number;
   answers: {
     [key: string]: Answer;
   };
   createdAt: Date;
 }
 
 interface Flight {
   id: number;
   flightDetails: Prisma.JsonValue;
   itineraryId: number;
 }
 
 interface Itinerary {
   id: number;
   generatedItinerary: GeneratedItinerary;
   userId: number;
   status: ItineraryStatus;
   createdAt: Date;
   preferenceId: number;
   preference: Preference;
   flight?: Flight;
 }
 
 // Type guard to check if a value matches GeneratedItinerary interface
 function isGeneratedItinerary(value: unknown): value is GeneratedItinerary {
   if (typeof value !== 'object' || value === null) return false;
   
   const v = value as GeneratedItinerary;
   return (
     Array.isArray(v.itinerary) &&
     typeof v.returnCity === 'string' &&
     typeof v.landingCity === 'string' &&
     typeof v.returnAirport === 'string' &&
     typeof v.landingAirport === 'string' &&
     typeof v.destination_country === 'string'
   );
 }
 
 // Function to safely convert Prisma data to your Itinerary type
 function convertToItinerary(data: any): Itinerary | null {
   if (!data) return null;
   
   // Ensure generatedItinerary is of the correct type
   if (!isGeneratedItinerary(data.generatedItinerary)) {
     throw new Error('Invalid generatedItinerary format');
   }
 
   return {
     id: data.id,
     generatedItinerary: data.generatedItinerary,
     userId: data.userId,
     status: data.status,
     createdAt: new Date(data.createdAt),
     preferenceId: data.preferenceId,
     preference: {
       ...data.preference,
       createdAt: new Date(data.preference.createdAt)
     },
     flight: data.flight
   };
 }
 
 // Usage in component:
 export default function FlightBooking() {
   const searchParams = useSearchParams();
   const [itineraryPreference, setItineraryPreference] = useState<Itinerary | null>(null);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     async function fetchItineraryAndFlights() {
       try {
         const tripId = searchParams.get('tripId');
         if (!tripId) {
           console.error('No tripId found in search params');
           return;
         }
 
         const itineraryPreferenceData = await getItineraryPreferenceById(Number(tripId));
         const convertedData = convertToItinerary(itineraryPreferenceData);
         setItineraryPreference(convertedData);
         
         const landingCity = convertedData?.generatedItinerary.landingCity;
         const firstDayActivities = convertedData?.generatedItinerary.itinerary[0]?.activities;
       } catch (error) {
         console.error('Error fetching itinerary or flights:', error);
       } finally {
         setLoading(false);
       }
     }
 
     fetchItineraryAndFlights();
   }, [searchParams]);

  if (loading) {
    return <div className="text-center text-white">Loading...</div>
  }

  if (!itineraryPreference) {
    return <div className="text-white">Itinerary not found</div>
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold text-white">Flight Booking</h1>

      <h2 className="mb-2 text-xl font-semibold text-white">
        Itinerary Details
      </h2>
      <pre className="overflow-auto rounded-lg bg-gray-800 p-4 text-white">
        {JSON.stringify(itineraryPreference, null, 2)}
      </pre>
    </div>
  )
}