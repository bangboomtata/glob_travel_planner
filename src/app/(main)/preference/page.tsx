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
   { question: 'Doing outdoor activities', type: 'slider' },
   { question: 'Being in nature', type: 'slider' },
   { question: 'Wandering around charming villages', type: 'slider' },
   {
      question: "What's your budget?",
      type: 'sliderOne',
      min: 0,
      max: 1000,
      step: 50,
      defaultValue: 500, // Added default value here
   },
   { question: 'Going to places of historical significance', type: 'slider' },
   { question: 'Visiting museums and art galleries', type: 'slider' },
   { question: 'Enjoying tasty local food', type: 'slider' },
   {
      question:
         'Do you have any dietary restrictions we should know about for foodie experiences?',
      type: 'checkbox',
      options: ['None', 'Vegan', 'Vegetarian', 'No Alcohol'],
   },
]

export default function Preference() {
   const [step, setStep] = useState(1)
   const [preferences, setPreferences] = useState<{
      [key: number]: number | string[]
   }>(
      preference.reduce(
         (acc, curr, index) => {
            if (curr.type === 'slider') return { ...acc, [index]: 3 }
            if (curr.type === 'sliderOne')
               return { ...acc, [index]: curr.defaultValue }
            return { ...acc, [index]: [] }
         },
         {} as { [key: number]: number | string[] }
      )
   )

   // Calculate steps based on question types
   const getQuestionGroups = () => {
      const groups: number[][] = []
      let currentGroup: number[] = []

      preference.forEach((question, index) => {
         if (question.type === 'sliderOne') {
            if (currentGroup.length > 0) {
               groups.push(currentGroup)
               currentGroup = []
            }
            groups.push([index])
         } else {
            if (currentGroup.length === 3) {
               groups.push(currentGroup)
               currentGroup = []
            }
            currentGroup.push(index)
         }
      })

      if (currentGroup.length > 0) {
         groups.push(currentGroup)
      }

      return groups
   }

   const questionGroups = getQuestionGroups()
   const totalSteps = questionGroups.length

   const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps))
   const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

   const renderStep = () => {
      const currentQuestions = questionGroups[step - 1]

      return (
         <>
            <CardHeader>
               <CardTitle className="text-2xl">Travel preferences</CardTitle>
               <CardDescription>Rate your interest</CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-[200px] flex-col justify-center">
               <div className="space-y-5">
                  {currentQuestions.map((questionIndex) => {
                     const item = preference[questionIndex]

                     if (item.type === 'slider') {
                        return (
                           <div key={questionIndex} className="space-y-1">
                              <Label className="text-lg">{item.question}</Label>
                              <div className="flex items-center space-x-4">
                                 <Slider
                                    value={[
                                       preferences[questionIndex] as number,
                                    ]}
                                    onValueChange={([value]) =>
                                       updatePreference(questionIndex, value)
                                    }
                                    max={5}
                                    min={1}
                                    step={1}
                                    className="flex-grow"
                                 />
                                 <span className="w-8 text-center text-lg font-medium">
                                    {preferences[questionIndex]}
                                 </span>
                              </div>
                              <div className="flex justify-between text-sm text-muted-foreground">
                                 <span>Not at all</span>
                                 <span>Love it!</span>
                              </div>
                           </div>
                        )
                     } else if (item.type === 'sliderOne') {
                        return (
                           <div key={questionIndex} className="space-y-1">
                              <Label className="text-lg">{item.question}</Label>
                              <div className="flex items-center space-x-4">
                                 <Slider
                                    value={[
                                       preferences[questionIndex] as number,
                                    ]}
                                    onValueChange={([value]) =>
                                       updatePreference(questionIndex, value)
                                    }
                                    max={item.max}
                                    min={item.min}
                                    step={item.step}
                                    defaultValue={[item.defaultValue ?? 0]}
                                    className="flex-grow"
                                 />
                                 <span className="w-20 text-center text-lg font-medium">
                                    ${preferences[questionIndex]}
                                 </span>
                              </div>
                              <div className="flex justify-between text-sm text-muted-foreground">
                                 <span>${item.min}</span>
                                 <span>${item.max}</span>
                              </div>
                           </div>
                        )
                     } else if (item.type === 'checkbox') {
                        return (
                           <div key={questionIndex} className="space-y-4">
                              <Label className="text-lg">{item.question}</Label>
                              <div className="flex flex-col space-y-2">
                                 {item.options.map((option, optionIndex) => (
                                    <label
                                       key={optionIndex}
                                       className="flex items-center space-x-2"
                                    >
                                       <input
                                          type="checkbox"
                                          className="h-5 w-5 rounded border-gray-300"
                                          checked={(
                                             preferences[
                                                questionIndex
                                             ] as string[]
                                          )?.includes(option)}
                                          onChange={() =>
                                             handleCheckboxChange(
                                                questionIndex,
                                                option
                                             )
                                          }
                                       />
                                       <span className="text-sm">{option}</span>
                                    </label>
                                 ))}
                              </div>
                           </div>
                        )
                     }
                  })}
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
