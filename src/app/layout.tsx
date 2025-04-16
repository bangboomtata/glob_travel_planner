'use client'

import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { HeaderNav } from '@/app/common'
import { SessionProvider } from "next-auth/react"

const geistSans = localFont({
   src: './fonts/GeistVF.woff',
   variable: '--font-geist-sans',
   weight: '100 900',
})
const geistMono = localFont({
   src: './fonts/GeistMonoVF.woff',
   variable: '--font-geist-mono',
   weight: '100 900',
})

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode
}>) {
   return (
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
         <body className="bg-black py-8 font-sans flex flex-col gap-y-4">
            <SessionProvider>
               <div>
                  <HeaderNav />
               </div>
               <div className="mt-6">
                  {children}
               </div>
            </SessionProvider>
         </body>
      </html>
   )
}
