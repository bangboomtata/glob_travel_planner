import { getAmadeusToken } from "@/lib/utils"

async function fetchFlightData() {
    try {
      // Get the Amadeus token
      const token = await getAmadeusToken();
  
      // API endpoint and parameters for the flight inspiration search
      const endpoint = "https://test.api.amadeus.com/v1/shopping/flight-destinations";
      const origin = "PAR"; // Replace with the desired origin
      const maxPrice = "200"; // Replace with the desired max price
  
      const response = await fetch(`${endpoint}?origin=${origin}&maxPrice=${maxPrice}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch flight data: ${response.statusText}`);
      }
  
      const data = await response.json();
      return JSON.stringify(data, null, 2); // Format the response for display
    } catch (error) {
      console.error("Error fetching flight data:", error);
      return JSON.stringify({ error: (error as Error).message }, null, 2);
    }
  }
  
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