"use server"

import { getAmadeusToken } from "@/lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function fetchFlightOffers(origin: string, destination: string, departureDate: string) {
  try {
    const token = await getAmadeusToken();
    const endpoint = "https://test.api.amadeus.com/v2/shopping/flight-offers";

    const params = new URLSearchParams({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departureDate,
      adults: "1",
      currencyCode: "GBP",
      max: "10", // Limit the number of results
    });

    const response = await fetch(`${endpoint}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch flight offers: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching flight offers:", error);
    return { error: (error as Error).message };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { origin, destination, departureDate } = req.query;

  if (!origin || !destination || !departureDate || typeof origin !== "string" || typeof destination !== "string" || typeof departureDate !== "string") {
    return res.status(400).json({ error: "Missing or invalid query parameters" });
  }

  try {
    const flightOffers = await fetchFlightOffers(origin, destination, departureDate);
    return res.status(200).json(flightOffers);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching flight offers" });
  }
}
