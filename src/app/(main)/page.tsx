'use client'

import { Button } from '@/components/ui/button'
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { BackgroundGradient } from '@/components/ui/background-gradient'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function WelcomeOnboarding() {
   const { data: session } = useSession();
   return (
      <main className="container mx-auto max-w-lg flex-col">
         {/* {session?.user && (
            <pre className="bg-gray-100 text-black p-2 rounded mb-4">
               {JSON.stringify({ id: session.user.id, email: session.user.email }, null, 2)}
            </pre>
         )} */}
         <BackgroundGradient className="p-3">
            <Card className="w-full rounded-2xl p-6">
               <CardHeader>
                  <CardTitle>
                     Let&#39;s Get Started!
                  </CardTitle>
                  <CardDescription>
                     Follow these steps to plan your perfect trip.
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     <h3 className="text-lg font-semibold">
                        How to get started with Glob!:
                     </h3>
                     <ul className="list-inside list-disc space-y-2">
                        <li>Set your travel preferences</li>
                        <li>Create your first trip itinerary</li>
                        <li>Book flights and accommodations</li>
                     </ul>
                  </div>
               </CardContent>
               <CardFooter className="flex justify-between">
                  <Link
                     href="/preference"
                     className="flex items-center justify-center"
                     prefetch={false}
                  >
                     <Button>
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                     </Button>
                  </Link>
               </CardFooter>
            </Card>
         </BackgroundGradient>
      </main>
   )
}
