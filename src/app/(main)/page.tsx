'using client'

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

export default function WelcomeOnboarding() {
   return (
      <main className="container mx-auto max-w-3xl flex-col">
         {/* Background Gradient need use client, make it a individual component*/}
         <BackgroundGradient className="p-3">
            <Card className="w-full rounded-2xl max-w-4xl pb-4">
               <CardHeader>
                  <CardTitle>
                     Let&#39;s Get Started on Your Next Adventure!
                  </CardTitle>
                  <CardDescription>
                     Follow these steps to plan your perfect trip.
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     <h3 className="text-lg font-semibold">Welcome aboard!</h3>
                     <p>Here&#39;s how to get started with Glob! :</p>
                     <ul className="list-inside list-disc space-y-2">
                        <li>Set your travel preferences</li>
                        <li>Explore destinations</li>
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
                  {/* <Button
                  variant="outline"
                  onClick={() => {
                     const tabs = ['getStarted', 'preferences', 'explore']
                     const currentIndex = tabs.indexOf(activeTab)
                     if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1])
                     }
                  }}
               >
                  Back
               </Button> */}
               </CardFooter>
            </Card>
         </BackgroundGradient>
      </main>
   )
}
