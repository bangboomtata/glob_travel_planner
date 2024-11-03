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
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from "date-fns"


// Questions array with different question types
const preference = [
   
   { question: 'Doing outdoor activities', type: 'Travel_Taste' },
   { question: 'Being in nature', type: 'Travel_Taste' },
   { question: 'Wandering around charming villages', type: 'Travel_Taste' },
   { question: 'Visiting popular sites and landmarks', type: 'Travel_Taste' },
   {
      question: 'Going to places of historical significance',
      type: 'Travel_Taste',
   },
   { question: 'Visiting museums and art galleries', type: 'Travel_Taste' },
   {
      question:
         'Do you have any dietary restrictions we should know about for foodie experiences?',
      type: 'Dietary_Restrictions',
      options: ['None', 'Vegan', 'Vegetarian', 'No Alcohol'],
   },
   {
      question: 'How long would like to be away for?',
      type: 'Trip_Duration',
      options: ['4 days, 3 nights', '5 days, 4 nights', '6 days, 5 nights'],
   },
   {
      question: 'Which of the following UK airports are you able to fly from?',
      type: 'Airport',
      options: [
         'London (All)',
         'London Gatwick',
         'London Stansted',
         'London Heathrow',
         'Manchester',
         'Birmingham',
      ],
   },
   {
      question: 'Whats your preferred start date?',
      type: 'Start_Date',
   },
   {
      question: 'Do you have any flexibility with your travel dates?',
      type: 'Start_Date_Flexibility',
      options: [
         'Flexible by +/- 1 day',
         'Flexible by +/- 3 days',
         'Not flexible',
      ],
   },
   {
      question: 'What’s your total budget (in £) for your 4-day trip?',
      type: 'Budget',
   },
]

export default function Preference() {
   const [step, setStep] = useState(1)
   const [preferences, setPreferences] = useState<{ [key: string]: any }>({})

   // Total steps based on unique question types
   const totalSteps = new Set(preference.map((q) => q.type)).size

   const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps))
   const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

   // Render a question based on its type
   const renderQuestion = (question: {
      question: string
      type: string
      options?: string[]
   }) => {
      switch (question.type) {
         case 'Travel_Taste':
            return (
               <div>
                  <Label className="text-lg leading-tight">
                     {question.question}
                  </Label>
                  <div className="flex items-center space-x-4">
                     <Slider
                        value={[preferences[question.question] || 3]}
                        onValueChange={([value]) =>
                           setPreferences((prev) => ({
                              ...prev,
                              [question.question]: value,
                           }))
                        }
                        max={5}
                        min={1}
                        step={1}
                        className="flex-grow"
                     />
                     <span className="w-8 text-center text-xl font-medium">
                        {preferences[question.question] || 3}
                     </span>
                  </div>
               </div>
            )
         case 'Dietary_Restrictions':
         case 'Trip_Duration':
         case 'Airport':
         case 'Start_Date_Flexibility':
            return (
               <div className="space-y-4">
                  <Label className="text-lg leading-tight">
                     {question.question}
                  </Label>
                  <div className="grid grid-cols-2 gap-y-4">
                     {question?.options?.map((option, index) => (
                        <label
                           key={index}
                           className="flex items-center space-x-2"
                        >
                           <Switch />
                           <span>{option}</span>
                        </label>
                     ))}
                  </div>
               </div>
            )
         case 'Budget':
            return (
               <div className="flex flex-col space-y-4">
                  <Label className="text-lg leading-tight">
                     {question.question}
                  </Label>
                  <div className="flex flex-row space-x-4">
                     <Slider
                        value={[preferences[question.question] || 3]}
                        onValueChange={([value]) =>
                           setPreferences((prev) => ({
                              ...prev,
                              [question.question]: value,
                           }))
                        }
                        max={5}
                        min={1}
                        step={1}
                        className="flex-grow"
                     />
                     <span className="font-lighter w-8 text-center text-xl">
                        {preferences[question.question] || 3}
                     </span>
                  </div>
               </div>
            )
            case 'Start_Date':
               return (
                  <div className="flex flex-col space-y-4">
                     <Label className="text-lg leading-tight">
                        {question.question}
                     </Label>
                     <Popover>
                        <PopoverTrigger asChild>
                           <Button
                              variant="outline"
                              className={cn(
                                 'w-[240px] justify-start p-6 text-left text-lg font-normal',
                                 !preferences.dates?.from && 'text-muted-foreground'
                              )}
                           >
                              {preferences.dates?.from
                                 ? format(preferences.dates.from, "dd MMM yyyy")
                                 : 'Select a date'}
                           </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                           <Calendar
                              mode="single"
                              selected={preferences.dates?.from || new Date()}                              onSelect={(date) =>
                                 setPreferences((prev) => ({
                                    ...prev,
                                    dates: { from: date },
                                 }))
                              }
                              initialFocus
                           />
                        </PopoverContent>
                     </Popover>
                  </div>
               )
            

         default:
            return null
      }
   }

   const renderStep = () => {
      // Get the current question type for the step
      const questionType = Array.from(new Set(preference.map((q) => q.type)))[
         step - 1
      ]
      const questions = preference.filter((q) => q.type === questionType)

      return (
         <>
            <CardHeader>
               <CardTitle className="text-2xl">
                  {questionType.replace('_', ' ')}
               </CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-[150px] flex-col justify-center">
               <div className="space-y-6">
                  {questions.map((question, i) => (
                     <div key={i} className="mb-4">
                        {renderQuestion(question)}
                     </div>
                  ))}
               </div>
            </CardContent>
         </>
      )
   }

   return (
      <main className="container mx-auto min-h-full max-w-2xl flex-col">
         <BackgroundGradient className="p-2">
            <Card className="rounded-[23px] px-4 py-2">
               {renderStep()}
               <CardFooter className="flex flex-row justify-center gap-x-6">
                  <Button
                     onClick={prevStep}
                     disabled={step === 1}
                     variant="ghost"
                     size="lg"
                  >
                     {/* <ArrowLeft className="mr-2 h-4 w-4" /> */}
                     Previous
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
                        Generate Itinerary
                     </Button>
                  ) : (
                     <Button variant="ghost" onClick={nextStep} size="lg">
                        {/* <ArrowRight className="mr-2 h-4 w-4" /> */}
                        Next
                     </Button>
                  )}
               </CardFooter>
            </Card>
         </BackgroundGradient>
      </main>
   )
}
