import { fetchFlightData } from './action'
  
  export default async function BookFlight() {
    // Fetch flight data during server-side rendering
    const flightData = await fetchFlightData();
  
    return (
      <main className="text-white bg-green-700">
        <h1>Book a Flight</h1>
        <p>Book a flight here</p>
        <pre>{flightData}</pre>
      </main>
    );
  }