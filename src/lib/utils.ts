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

interface TokenCache {
  token: string
  expiresAt: number
}

let cachedToken: TokenCache | null = null

export async function getAmadeusToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    console.log('Using cached token, expires in:', 
      Math.round((cachedToken.expiresAt - Date.now()) / 1000), 'seconds')
    return cachedToken.token
  }

  console.log('Fetching new token...')

  const url = `${AMADEUS_API_BASE_URL}/v1/security/oauth2/token`
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  }
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  })

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: body.toString(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Cache the new token with expiration
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    }

    return cachedToken.token
  } catch (error) {
    console.error("Error fetching Amadeus token:", error)
    throw error
  }
}
