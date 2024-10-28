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
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'

const preference = [
   { question: 'Doing outdoor activities' },
   { question: 'Being in nature' },
   { question: 'Wandering around charming villages' },
   { question: 'Going to places of historical significance' },
   { question: 'Visiting museums and art galleries' },
   { question: 'Enjoying tasty local food' },
]

export default function Preference() {
   const questionsPerPage = 3
   const totalSteps = Math.ceil(preference.length / questionsPerPage)

   const [step, setStep] = useState(1)
   const [preferences, setPreferences] = useState<{ [key: number]: number }>(
      preference.reduce(
         (acc, _, index) => {
            acc[index] = 3 // Initial value of 3 for each question
            return acc
         },
         {} as { [key: number]: number }
      )
   )

   const updatePreference = (index: number, value: number) => {
      setPreferences((prev) => ({ ...prev, [index]: value }))
   }

   const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps))
   const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

   const renderStep = () => {
      const startIdx = (step - 1) * questionsPerPage
      const endIdx = startIdx + questionsPerPage
      const currentQuestions = preference.slice(startIdx, endIdx)

      return (
         <>
            <CardHeader>
               <CardTitle className="text-2xl">Travel preferences</CardTitle>
               <CardDescription>Rate your interest</CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-[300px] flex-col justify-center">
               <div className="space-y-5">
                  {currentQuestions.map((item, index) => (
                     <div key={startIdx + index} className="space-y-1">
                        <Label className="text-lg">{item.question}</Label>
                        <div className="flex items-center space-x-4">
                           <Slider
                              value={[preferences[startIdx + index]]}
                              onValueChange={([value]) =>
                                 updatePreference(startIdx + index, value)
                              }
                              max={5}
                              min={1}
                              step={1}
                              className="flex-grow"
                           />
                           <span className="w-8 text-center text-lg font-medium">
                              {preferences[startIdx + index]}
                           </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                           <span>Not at all</span>
                           <span>Love it!</span>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </>
      )
   }

   return (
      <main className="container mx-auto max-w-3xl flex-col">
         <BackgroundGradient className="p-2">
            <Card className="rounded-[23px] px-4">
               {renderStep()}
               <CardFooter className="flex justify-center gap-x-6">
                  <Button
                     onClick={prevStep}
                     disabled={step === 1}
                     variant="ghost"
                     size="lg"
                  >
                     <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>

                  <div className="text-md font-normal">
                     Step {step} of {totalSteps}
                  </div>

                  {step === totalSteps ? (
                     <Button
                        variant="ghost"
                        onClick={() => console.log(preferences)}
                        size="lg"
                     >
                        Finish
                     </Button>
                  ) : (
                     <Button variant="ghost" onClick={nextStep} size="lg">
                        <ArrowRight className="mr-2 h-4 w-4" />
                     </Button>
                  )}
               </CardFooter>
            </Card>
         </BackgroundGradient>
      </main>
   )
}
{
   /* 
    
    <Slider
        value={[preferences.beachPreference]}
        onValueChange={([value]) =>
        updatePreference('beachPreference', value)
        }
        max={5}
        min={1}
        step={1}
        className="flex-grow"
    />

    */
}
