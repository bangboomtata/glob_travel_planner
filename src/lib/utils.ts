import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs))
}

export function openai() {
   const { Configuration, OpenAIApi } = require('openai')

   const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
   })
   const openai = new OpenAIApi(configuration)
}

const AMADEUS_API_BASE_URL = process.env.NEXT_PUBLIC_AMADEUS_API_BASE_URL!;
const CLIENT_ID = process.env.NEXT_PUBLIC_AMADEUS_CLIENT_ID!;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_AMADEUS_CLIENT_SECRET!;

export const getAmadeusToken: () => Promise<string> = async () => {
  const url = `${AMADEUS_API_BASE_URL}/v1/security/oauth2/token`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token; // The token you can use for subsequent API calls
  } catch (error) {
    console.error("Error fetching Amadeus token:", error);
    throw error;
  }
};
