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
